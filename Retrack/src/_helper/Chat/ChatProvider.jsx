import React, { useEffect, useState } from 'react';
import Context from './index';
import ChatService from '../../Services/chat.service';
import UserService from '../../Services/user.service';
import { useUser } from '../../contexts/UserContext';
import { TaskApi } from '../../api';
import axios from 'axios';

const ChatProvider = (props) => {
  const { user } = useUser();
  const [allMemberss, setAllMembers] = useState([]);
  const [menuToggle, setMenuToggle] = useState(false);
  const [memberss, setMembers] = useState([]);
  const [chatss, setChats] = useState([]);
  const [currentUserr, setCurrentUser] = useState(null);
  const [selectedUserr, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Set current user from context and load available users
  useEffect(() => {
    const initializeChat = async () => {
      if (user) {
        // Get userId from multiple sources including localStorage
        const storedUserId = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
        const userId = user.id || user.userId || user.ID || storedUserId || 'user1';
        
        // Map user properties from different possible sources
        const currentUser = {
          id: userId,
          userId: userId,
          name: user.name || user.username || user.Name || 'Current User',
          email: user.email || user.Email || '',
          online: true
        };
        
        // Store userId in localStorage for consistency
        localStorage.setItem('userId', userId);
        localStorage.setItem('currentUserId', userId);
        
        setCurrentUser(currentUser);

        // Load all available users for chat from backend using UserService
        try {
          console.log('Loading users from API, excluding userId:', userId);
          
          // Test API connection first
          const connectionTest = await UserService.testConnection();
          console.log('API Connection Test:', connectionTest);
          
          const result = await UserService.getAllUsers(userId);
          
          if (result.success && result.users.length > 0) {
            const formattedUsers = result.users.map(u => ({
              id: u.id || u.ID,
              name: u.name || u.Name,
              email: u.email || u.Email,
              online: u.online !== undefined ? u.online : false,
              status: u.online ? 'Online' : `Last seen ${UserService.formatLastSeen(u.lastSeen)}`,
              lastSeen: u.lastSeen
            }));
            
            setAllMembers(formattedUsers);
            setMembers(formattedUsers);
            
            console.log('Chat initialized with user:', currentUser);
            console.log('Available users loaded from API:', formattedUsers.length);
          } else {
            throw new Error(result.error || 'No users found from API');
          }
        } catch (error) {
          console.error('Error loading users from API:', error.message);
          console.log('Falling back to demo users...');
          
          // Fallback to demo users if API fails
          const demoUsers = UserService.getDemoUsers(userId);
          const formattedDemoUsers = demoUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            online: u.online,
            status: u.online ? 'Online' : `Last seen ${UserService.formatLastSeen(u.lastSeen)}`,
            lastSeen: u.lastSeen
          }));
          
          setAllMembers(formattedDemoUsers);
          setMembers(formattedDemoUsers);
          console.log('Using demo users due to API error. Demo users count:', formattedDemoUsers.length);
        }
      } else {
        // Clear chat data if no user is logged in
        setCurrentUser(null);
        setAllMembers([]);
        setMembers([]);
        setConversations([]);
        setCurrentMessages([]);
        // Clear userId from localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('currentUserId');
      }
    };

    initializeChat();
  }, [user]);

  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  // Fetch conversations for current user
  const fetchConversations = async () => {
    if (!currentUserr?.id) return;
    
    setLoading(true);
    try {
      const response = await ChatService.getConversationsForUser(currentUserr.id);
      setConversations(response.conversations || []);
      
      // Users are now loaded in the initialization effect
      // This method just updates conversations
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setAllMembers([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const response = await ChatService.getMessagesInConversation(conversationId);
      const messages = response.messages || [];
      
      // Transform messages to match frontend format
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        sender: msg.senderId,
        time: ChatService.formatMessageTime(msg.sentAt),
        text: msg.text,
        status: msg.status === 'sent'
      }));
      
      setCurrentMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setCurrentMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMemberAsyn = () => {
    // This method is kept for compatibility but functionality is handled in fetchConversations
  };

  const fetchChatAsyn = () => {
    fetchConversations();
  };

  useEffect(() => {
    if (currentUserr?.id) {
      fetchConversations();
    }
  }, [currentUserr]);

  const sendMessageAsyn = async (currentUserId, selectedUserId, messageInput) => {
    if (!messageInput.trim() || !currentUserId || !selectedUserId) return;

    try {
      const response = await ChatService.sendMessage(currentUserId, selectedUserId, messageInput);
      
      // Add message to current messages immediately for better UX
      const newMessage = {
        id: response.messageObject.id,
        sender: currentUserId,
        time: ChatService.formatMessageTime(response.messageObject.sentAt),
        text: messageInput,
        status: true
      };
      
      setCurrentMessages(prev => [...prev, newMessage]);
      
      // Update conversations list
      await fetchConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const replyByUserAsyn = async (currentUserId, selectedUserId, replyMessage) => {
    // This method is removed as we now handle real user-to-user messaging
    // No auto-replies needed
  };

  const createNewChatAsyn = async (currentUserId, selectedUserId) => {
    try {
      const response = await ChatService.resolveConversation(currentUserId, selectedUserId);
      await fetchConversations(); // Refresh conversations
      return response.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const changeChat = async (userID) => {
    const selectedUser = allMemberss.find((x) => x.id === userID) || {
      id: userID,
      name: `User ${userID}`,
      online: true,
      status: 'Available'
    };
    
    setSelectedUser(selectedUser);
    
    if (selectedUser && currentUserr) {
      // Find or create conversation
      let conversation = conversations.find(conv => 
        ChatService.getOtherUserId(conv, currentUserr.id) === userID
      );
      
      if (!conversation) {
        conversation = await createNewChatAsyn(currentUserr.id, userID);
      }
      
      if (conversation) {
        await fetchMessages(conversation.id);
      }
    }
  };

  const searchMember = async (keywords) => {
    if (keywords === '') {
      setMembers(allMemberss);
    } else {
      try {
        const userId = currentUserr?.id || UserService.getCurrentUserId();
        const result = await UserService.searchUsers(keywords, userId);
        
        if (result.success && result.users.length > 0) {
          const formattedResults = result.users.map(u => ({
            id: u.id || u.ID,
            name: u.name || u.Name,
            email: u.email || u.Email,
            online: u.online !== undefined ? u.online : false,
            status: u.online ? 'Online' : `Last seen ${UserService.formatLastSeen(u.lastSeen)}`,
            lastSeen: u.lastSeen
          }));
          
          setMembers(formattedResults);
          console.log('Search results:', formattedResults.length, 'users found for query:', keywords);
        } else {
          console.log('No search results from API, falling back to local filtering');
          // Fallback to filtering existing members
          const filteredMembers = allMemberss.filter(member =>
            member.name.toLowerCase().includes(keywords.toLowerCase()) ||
            member.email.toLowerCase().includes(keywords.toLowerCase())
          );
          setMembers(filteredMembers);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        // Fallback to filtering existing members
        const filteredMembers = allMemberss.filter(member =>
          member.name.toLowerCase().includes(keywords.toLowerCase()) ||
          member.email.toLowerCase().includes(keywords.toLowerCase())
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
        chatss: [{ // Transform conversations to match expected format
          users: selectedUserr && currentUserr ? [currentUserr.id, selectedUserr.id] : [],
          messages: currentMessages
        }],
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
      }}>
      {props.children}
    </Context.Provider>
  );
};

export default ChatProvider;
