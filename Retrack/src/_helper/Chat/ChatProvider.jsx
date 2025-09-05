import React, { useEffect, useRef, useState } from "react";
import Context from "./index";
import ChatService from "../../Services/chat.service";
import UserService from "../../Services/user.service";
import { useUser } from "../../contexts/UserContext";
import { useMessage } from "../../contexts/MessageContext";
import { TaskApi } from "../../api";
import axios from "axios";

const ChatProvider = (props) => {
  const { user } = useUser();
  const messageContext = useMessage();
  const [allMemberss, setAllMembers] = useState([]);
  const [menuToggle, setMenuToggle] = useState(false);
  const [memberss, setMembers] = useState([]);
  const [chatss, setChats] = useState([]);
  const [currentUserr, setCurrentUser] = useState(null);
  const [selectedUserr, setSelectedUser] = useState(null);

  // Set current user from context and load available users
  useEffect(() => {
    const initializeChat = async () => {
      if (user) {
        // Get userId from multiple sources including localStorage
        const storedUserId =
          localStorage.getItem("userId") ||
          localStorage.getItem("currentUserId");
        const userId =
          user.id ||
          user.userId ||
          user.UserId ||
          user.ID ||
          storedUserId ||
          "user1";

        // Map user properties from different possible sources
        const currentUser = {
          id: userId,
          userId: userId,
          name:
            user.name ||
            user.Name ||
            `${user.FirstName || ""} ${user.LastName || ""}`.trim() ||
            user.username ||
            "Current User",
          email: user.email || user.Email || "",
          online: true,
        };

        // Store userId in localStorage for consistency
        localStorage.setItem("userId", userId);
        localStorage.setItem("currentUserId", userId);

        setCurrentUser(currentUser);

        // Load all available users for chat from backend using UserService
        try {
          console.log("Loading users from API, excluding userId:", userId);

          // Test API connection first
          const connectionTest = await UserService.testConnection();
          console.log("API Connection Test:", connectionTest);

          const result = await UserService.getAllUsers(userId);

          if (result.success && result.users.length > 0) {
            const formattedUsers = result.users.map((u) => ({
              id: u.id || u.ID || u.UserId,
              name:
                u.name ||
                u.Name ||
                u.FirstName + " " + u.LastName ||
                u.Username ||
                "Unknown User",
              email: u.email || u.Email || "",
              online: u.online !== undefined ? u.online : false,
              status: u.online
                ? "Online"
                : `Last seen ${UserService.formatLastSeen(u.lastSeen)}`,
              lastSeen: u.lastSeen,
              isMeetingChat:
                u.Username === "meeting_chat" || u.UserId === "USR-6",
            }));

            // Add meeting chat user if not already present
            const hasMeetingChat = formattedUsers.some((u) => u.isMeetingChat);
            if (!hasMeetingChat) {
              const meetingChatUser = {
                id: "USR-6",
                name: "The Meeting Chat",
                email: "meetingcaht@gmail.com",
                online: true,
                status: "Online - Meeting Room",
                lastSeen: new Date(),
                isMeetingChat: true,
              };
              formattedUsers.unshift(meetingChatUser); // Add at the beginning
            }

            setAllMembers(formattedUsers);
            // Filter out meeting_chat from regular members list for chat selection
            const regularMembers = formattedUsers.filter(
              (u) => !u.isMeetingChat
            );
            setMembers(regularMembers);

            console.log("Chat initialized with user:", currentUser);
            console.log(
              "Available users loaded from API:",
              formattedUsers.length
            );
            console.log(
              "Meeting chat user included:",
              hasMeetingChat || "Added manually"
            );
          } else {
            throw new Error(result.error || "No users found from API");
          }
        } catch (error) {
          console.error("Error loading users from API:", error.message);
          console.log("Falling back to demo users...");

          // Fallback to demo users if API fails
          const demoUsers = UserService.getDemoUsers(userId);
          const formattedDemoUsers = demoUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            online: u.online,
            status: u.online
              ? "Online"
              : `Last seen ${UserService.formatLastSeen(u.lastSeen)}`,
            lastSeen: u.lastSeen,
            isMeetingChat: false,
          }));

          // Add meeting chat user to demo users as well
          const meetingChatUser = {
            id: "USR-6",
            name: "The Meeting Chat",
            email: "meetingcaht@gmail.com",
            online: true,
            status: "Online - Meeting Room",
            lastSeen: new Date(),
            isMeetingChat: true,
          };
          formattedDemoUsers.unshift(meetingChatUser);

          setAllMembers(formattedDemoUsers);
          // Filter out meeting_chat from regular members list for chat selection
          const regularDemoMembers = formattedDemoUsers.filter(
            (u) => !u.isMeetingChat
          );
          setMembers(regularDemoMembers);
          console.log(
            "Using demo users due to API error. Demo users count:",
            formattedDemoUsers.length
          );
        }
      } else {
        // Clear chat data if no user is logged in
        setCurrentUser(null);
        setAllMembers([]);
        setMembers([]);
        // Note: conversations and messages are now managed by MessageContext
        // Clear userId from localStorage
        localStorage.removeItem("userId");
        localStorage.removeItem("currentUserId");
      }
    };

    initializeChat();
  }, [user]);

  // Load conversations when current user changes
  useEffect(() => {
    if (currentUserr?.id) {
      messageContext.fetchConversations();
    }
  }, [currentUserr]);
  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Never";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return lastSeenDate.toLocaleDateString();
  };

  // Use message context methods
  const {
    conversations,
    currentMessages,
    loading,
    unreadCounts,
    activeConversationId,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setActiveConversation,
    resetUnreadCount,
    getUnreadCount,
    getTotalUnreadCount,
  } = messageContext;

  const fetchChatMemberAsyn = () => {
    // This method is kept for compatibility but functionality is handled in fetchConversations
  };

  const fetchChatAsyn = () => {
    fetchConversations();
  };

  const sendMessageAsyn = async (
    currentUserId,
    selectedUserId,
    messageInput
  ) => {
    if (!messageInput.trim() || !currentUserId || !selectedUserId) return;

    try {
      await sendMessage(currentUserId, selectedUserId, messageInput);
      // Message will be added via SSE automatically
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const replyByUserAsyn = async (
    currentUserId,
    selectedUserId,
    replyMessage
  ) => {
    // This method is removed as we now handle real user-to-user messaging
    // No auto-replies needed
  };

  const createNewChatAsyn = async (currentUserId, selectedUserId) => {
    try {
      const response = await ChatService.resolveConversation(
        currentUserId,
        selectedUserId
      );
      await fetchConversations(); // Refresh conversations
      return response.conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const changeChat = async (userID) => {
    const selectedUser = allMemberss.find((x) => x.id === userID) || {
      id: userID,
      name: `User ${userID}`,
      online: true,
      status: "Available",
    };

    setSelectedUser(selectedUser);

    if (selectedUser && currentUserr) {
      // Find or create conversation
      let conversation = conversations.find(
        (conv) => ChatService.getOtherUserId(conv, currentUserr.id) === userID
      );

      if (!conversation) {
        conversation = await createNewChatAsyn(currentUserr.id, userID);
      }

      if (conversation) {
        // Set this as the active conversation
        setActiveConversation(conversation.id);

        // Reset unread count for this conversation
        resetUnreadCount(conversation.id);

        // Fetch messages for this conversation
        await fetchMessages(conversation.id);
      }
    }
  };

  // Special method to access meeting chat
  const getMeetingChatUser = () => {
    return allMemberss.find((user) => user.isMeetingChat);
  };

  // Method to start meeting chat
  const startMeetingChat = async () => {
    const meetingChatUser = getMeetingChatUser();
    if (meetingChatUser && currentUserr) {
      setSelectedUser(meetingChatUser);

      // For meeting chat, we don't need a specific conversation
      // We'll load all messages sent to the meeting chat user
      setActiveConversation("meeting-chat-global");

      // Load all messages sent to meeting chat user
      await loadMeetingChatMessages();
    }
  };

  // Load all messages sent to meeting chat user
  const loadMeetingChatMessages = async () => {
    const meetingChatUser = getMeetingChatUser();
    if (!meetingChatUser) return;

    try {
      const response = await ChatService.getAllMessagesToUser(
        meetingChatUser.id
      );
      const messages = response.messages || [];

      // Transform messages to match frontend format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        sender: msg.senderId,
        time: ChatService.formatMessageTime(msg.sentAt),
        text: msg.text,
        status: msg.status === "sent",
        senderName: msg.senderName || `User ${msg.senderId}`, // Include sender name for display
      }));

      // Sort messages by timestamp (oldest first)
      transformedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));

      // Set messages using MessageContext method
      messageContext.setCurrentMessages(transformedMessages);

      console.log(
        `Loaded ${transformedMessages.length} messages for meeting chat`
      );
    } catch (error) {
      console.error("Error loading meeting chat messages:", error);
    }
  };

  const searchMember = async (keywords) => {
    if (keywords === "") {
      // Filter out meeting chat users when showing all members
      const regularMembers = allMemberss.filter((u) => !u.isMeetingChat);
      setMembers(regularMembers);
    } else {
      try {
        const userId = currentUserr?.id || UserService.getCurrentUserId();
        const result = await UserService.searchUsers(keywords, userId);

        if (result.success && result.users.length > 0) {
          const formattedResults = result.users.map((u) => ({
            id: u.id || u.ID || u.UserId,
            name:
              u.name ||
              u.Name ||
              u.FirstName + " " + u.LastName ||
              u.Username ||
              "Unknown User",
            email: u.email || u.Email || "",
            online: u.online !== undefined ? u.online : false,
            status: u.online
              ? "Online"
              : `Last seen ${UserService.formatLastSeen(u.lastSeen)}`,
            lastSeen: u.lastSeen,
            isMeetingChat:
              u.Username === "meeting_chat" || u.UserId === "USR-6",
          }));

          // Filter out meeting chat users from search results
          const filteredResults = formattedResults.filter(
            (u) => !u.isMeetingChat
          );
          setMembers(filteredResults);
          console.log(
            "Search results:",
            filteredResults.length,
            "users found for query:",
            keywords
          );
        } else {
          console.log(
            "No search results from API, falling back to local filtering"
          );
          // Fallback to filtering existing members, excluding meeting chat
          const filteredMembers = allMemberss.filter(
            (member) =>
              !member.isMeetingChat &&
              (member.name.toLowerCase().includes(keywords.toLowerCase()) ||
                member.email.toLowerCase().includes(keywords.toLowerCase()))
          );
          setMembers(filteredMembers);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        // Fallback to filtering existing members, excluding meeting chat
        const filteredMembers = allMemberss.filter(
          (member) =>
            !member.isMeetingChat &&
            (member.name.toLowerCase().includes(keywords.toLowerCase()) ||
              member.email.toLowerCase().includes(keywords.toLowerCase()))
        );
        setMembers(filteredMembers);
      }
    }
  };

  return (
    <Context.Provider
      value={{
        ...props,
        allMemberss,
        chatss: [
          {
            // Transform conversations to match expected format
            users:
              selectedUserr && currentUserr
                ? [currentUserr.id, selectedUserr.id]
                : [],
            messages: currentMessages,
          },
        ],
        selectedUserr,
        currentUserr,
        memberss,
        menuToggle,
        loading,
        conversations,
        currentMessages,
        setMenuToggle,
        fetchChatAsyn: fetchChatAsyn,
        fetchChatMemberAsyn: fetchChatMemberAsyn,
        sendMessageAsyn: sendMessageAsyn,
        replyByUserAsyn: replyByUserAsyn,
        createNewChatAsyn: createNewChatAsyn,
        changeChat: changeChat,
        searchMember: searchMember,
        fetchConversations,
        fetchMessages,
        unreadCounts, // Expose unread message counts
        setActiveConversationId: setActiveConversation, // Use message context method
        resetUnreadCount, // Use message context method
        getUnreadCount, // Expose unread count getter
        getTotalUnreadCount, // Expose total unread count getter
        getMeetingChatUser, // Expose meeting chat user getter
        startMeetingChat, // Expose meeting chat starter
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ChatProvider;
