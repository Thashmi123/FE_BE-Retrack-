import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import ChatService from "../Services/chat.service";

// Message Context for global message state management
const MessageContext = createContext();

// Action types
const MESSAGE_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_CONVERSATIONS: "SET_CONVERSATIONS",
  SET_CURRENT_MESSAGES: "SET_CURRENT_MESSAGES",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_ACTIVE_CONVERSATION: "SET_ACTIVE_CONVERSATION",
  UPDATE_UNREAD_COUNT: "UPDATE_UNREAD_COUNT",
  RESET_UNREAD_COUNT: "RESET_UNREAD_COUNT",
  SET_SSE_CONNECTION: "SET_SSE_CONNECTION",
  SET_ERROR: "SET_ERROR",
};

// Initial state
const initialState = {
  conversations: [],
  currentMessages: [],
  activeConversationId: null,
  unreadCounts: {},
  loading: false,
  error: null,
  sseConnected: false,
  sseReconnectAttempts: 0,
};

// Reducer
const messageReducer = (state, action) => {
  switch (action.type) {
    case MESSAGE_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case MESSAGE_ACTIONS.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };

    case MESSAGE_ACTIONS.SET_CURRENT_MESSAGES:
      return { ...state, currentMessages: action.payload };

    case MESSAGE_ACTIONS.ADD_MESSAGE:
      const { conversationId, message } = action.payload;

      // Add message to current messages if it's the active conversation
      if (conversationId === state.activeConversationId) {
        return {
          ...state,
          currentMessages: [...state.currentMessages, message],
        };
      } else {
        // Update unread count for inactive conversations
        return {
          ...state,
          unreadCounts: {
            ...state.unreadCounts,
            [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
          },
        };
      }

    case MESSAGE_ACTIONS.SET_ACTIVE_CONVERSATION:
      return {
        ...state,
        activeConversationId: action.payload,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload]: 0, // Reset unread count for active conversation
        },
      };

    case MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCounts: {
          ...state.unreadCounts,
          [action.payload.conversationId]: action.payload.count,
        },
      };

    case MESSAGE_ACTIONS.RESET_UNREAD_COUNT:
      const newUnreadCounts = { ...state.unreadCounts };
      delete newUnreadCounts[action.payload];
      return {
        ...state,
        unreadCounts: newUnreadCounts,
      };

    case MESSAGE_ACTIONS.SET_SSE_CONNECTION:
      return {
        ...state,
        sseConnected: action.payload.connected,
        sseReconnectAttempts:
          action.payload.reconnectAttempts || state.sseReconnectAttempts,
      };

    case MESSAGE_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

// Message Provider Component
export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // 3 seconds
  const pollingInterval = 1000; // 3 seconds polling as fallback

  // Get current user ID from localStorage or context
  const getCurrentUserId = () => {
    return (
      localStorage.getItem("userId") ||
      localStorage.getItem("currentUserId") ||
      null
    );
  };

  const currentUserId = getCurrentUserId();

  // Polling fallback function
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      if (currentUserId && state.activeConversationId) {
        try {
          const response = await ChatService.getMessagesInConversation(
            state.activeConversationId
          );
          const messages = response.messages || [];

          // Transform messages to match frontend format
          const transformedMessages = messages.map((msg) => ({
            id: msg.id,
            sender: msg.senderId,
            time: ChatService.formatMessageTime(msg.sentAt),
            text: msg.text,
            status: msg.status === "sent",
          }));

          // Only update if messages have changed
          if (transformedMessages.length !== state.currentMessages.length) {
            dispatch({
              type: MESSAGE_ACTIONS.SET_CURRENT_MESSAGES,
              payload: transformedMessages,
            });
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }
    }, pollingInterval);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Initialize SSE connection
  useEffect(() => {
    if (!currentUserId) {
      // Clean up SSE connection if no user
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      stopPolling();
      dispatch({
        type: MESSAGE_ACTIONS.SET_SSE_CONNECTION,
        payload: { connected: false },
      });
      return;
    }

    const connectSSE = () => {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const sseUrl = `${
        process.env.REACT_APP_API_BASE_URL || "http://localhost:8888"
      }/sse/chat?userId=${currentUserId}`;
      // console.log("Connecting to SSE at:", sseUrl);

      eventSourceRef.current = new EventSource(sseUrl);

      eventSourceRef.current.onopen = () => {
        // console.log("SSE connection established");
        stopPolling(); // Stop polling when SSE is connected
        dispatch({
          type: MESSAGE_ACTIONS.SET_SSE_CONNECTION,
          payload: { connected: true, reconnectAttempts: 0 },
        });
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === "connected") {
            // console.log("SSE connected:", data.message);
            return;
          }

          if (data.type === "heartbeat") {
            // Ignore heartbeat messages
            return;
          }

          // Handle new chat message
          if (data.id && data.senderId && data.text) {
            // console.log("New message received via SSE:", data);

            // Transform message to match frontend format
            const newMessage = {
              id: data.id,
              sender: data.senderId,
              time: ChatService.formatMessageTime(data.sentAt),
              text: data.text,
              status: data.status === "sent",
              senderName: data.senderName || `User ${data.senderId}`, // Include sender name
            };

            // Check if this is a message to the meeting chat user (USR-6)
            const isMeetingChatMessage = data.receiverId === "USR-6";

            if (
              isMeetingChatMessage &&
              state.activeConversationId === "meeting-chat-global"
            ) {
              // If we're in meeting chat view, add the message directly to current messages
              dispatch({
                type: MESSAGE_ACTIONS.ADD_MESSAGE,
                payload: {
                  conversationId: "meeting-chat-global",
                  message: newMessage,
                },
              });
            } else {
              // Regular conversation message handling
              dispatch({
                type: MESSAGE_ACTIONS.ADD_MESSAGE,
                payload: {
                  conversationId: data.conversationId,
                  message: newMessage,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error processing SSE message:", error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error("SSE error:", error);
        dispatch({
          type: MESSAGE_ACTIONS.SET_SSE_CONNECTION,
          payload: { connected: false },
        });

        // Start polling as fallback when SSE fails
        startPolling();

        // Attempt reconnection
        if (state.sseReconnectAttempts < maxReconnectAttempts) {
          const delay =
            reconnectDelay * Math.pow(2, state.sseReconnectAttempts); // Exponential backoff
          // console.log(
          //   `Attempting to reconnect in ${delay}ms (attempt ${
          //     state.sseReconnectAttempts + 1
          //   }/${maxReconnectAttempts})`
          // );

          reconnectTimeoutRef.current = setTimeout(() => {
            dispatch({
              type: MESSAGE_ACTIONS.SET_SSE_CONNECTION,
              payload: { reconnectAttempts: state.sseReconnectAttempts + 1 },
            });
            connectSSE();
          }, delay);
        } else {
          console.error(
            "Max reconnection attempts reached, using polling fallback"
          );
          dispatch({
            type: MESSAGE_ACTIONS.SET_ERROR,
            payload: "Using polling fallback for chat updates",
          });
        }
      };
    };

    connectSSE();

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopPolling();
    };
  }, [currentUserId, state.sseReconnectAttempts]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!currentUserId) return;

    dispatch({ type: MESSAGE_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await ChatService.getConversationsForUser(currentUserId);
      const allConversations = response.conversations || [];

      // Filter out meeting conversations (meeting IDs as users) for regular chat
      const userConversations =
        ChatService.filterUserConversations(allConversations);

      dispatch({
        type: MESSAGE_ACTIONS.SET_CONVERSATIONS,
        payload: userConversations,
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      dispatch({ type: MESSAGE_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: MESSAGE_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;

    dispatch({ type: MESSAGE_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await ChatService.getMessagesInConversation(
        conversationId
      );
      const messages = response.messages || [];

      // Transform messages to match frontend format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        sender: msg.senderId,
        time: ChatService.formatMessageTime(msg.sentAt),
        text: msg.text,
        status: msg.status === "sent",
      }));

      dispatch({
        type: MESSAGE_ACTIONS.SET_CURRENT_MESSAGES,
        payload: transformedMessages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      dispatch({ type: MESSAGE_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: MESSAGE_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Send message
  const sendMessage = async (senderId, receiverId, text) => {
    if (!text.trim() || !senderId || !receiverId) return;

    try {
      await ChatService.sendMessage(senderId, receiverId, text);
      // Message will be added via SSE, no need to add it manually
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch({ type: MESSAGE_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Set active conversation
  const setActiveConversation = (conversationId) => {
    dispatch({
      type: MESSAGE_ACTIONS.SET_ACTIVE_CONVERSATION,
      payload: conversationId,
    });

    // Start polling if SSE is not connected
    if (!state.sseConnected) {
      startPolling();
    }
  };

  // Reset unread count for a conversation
  const resetUnreadCount = (conversationId) => {
    dispatch({
      type: MESSAGE_ACTIONS.RESET_UNREAD_COUNT,
      payload: conversationId,
    });
  };

  // Get unread count for a conversation
  const getUnreadCount = (conversationId) => {
    return state.unreadCounts[conversationId] || 0;
  };

  // Get total unread count
  const getTotalUnreadCount = () => {
    return Object.values(state.unreadCounts).reduce(
      (total, count) => total + count,
      0
    );
  };

  // Set current messages directly (for meeting chat)
  const setCurrentMessages = (messages) => {
    dispatch({
      type: MESSAGE_ACTIONS.SET_CURRENT_MESSAGES,
      payload: messages,
    });
  };

  const value = {
    ...state,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setActiveConversation,
    resetUnreadCount,
    getUnreadCount,
    getTotalUnreadCount,
    setCurrentMessages,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

// Custom hook to use message context
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};

export default MessageContext;
