import axios from 'axios';
import { TaskApi } from '../api';

const API_BASE_URL = TaskApi;

class ChatService {
  // Send a new message
  async sendMessage(senderId, receiverId, text) {
    try {
      const response = await axios.post(`${API_BASE_URL}/messages`, {
        senderId,
        receiverId,
        text
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get conversations for a user
  async getConversationsForUser(userId, skip = 0, limit = 20) {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/conversations`, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages in a conversation
  async getMessagesInConversation(conversationId, skip = 0, limit = 30) {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Resolve/create conversation between two users
  async resolveConversation(user1, user2) {
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations/resolve`, {
        user1,
        user2
      });
      return response.data;
    } catch (error) {
      console.error('Error resolving conversation:', error);
      throw error;
    }
  }

  // Format message time for display
  formatMessageTime(sentAt) {
    const date = new Date(sentAt);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }

  // Get other user in conversation
  getOtherUserId(conversation, currentUserId) {
    return conversation.userA === currentUserId ? conversation.userB : conversation.userA;
  }
}

export default new ChatService();