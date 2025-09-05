import axios from "axios";
import { TaskApi } from "../api";

const API_BASE_URL = TaskApi;

class ChatService {
  // Send a new message
  async sendMessage(
    senderId,
    receiverId,
    text,
    meetingId = null,
    meetingTitle = null
  ) {
    try {
      const payload = {
        senderId,
        receiverId,
        text,
      };

      // Add meeting context if provided
      if (meetingId) {
        payload.meetingId = meetingId;
      }
      if (meetingTitle) {
        payload.meetingTitle = meetingTitle;
      }

      const response = await axios.post(`${API_BASE_URL}/messages`, payload);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Get conversations for a user
  async getConversationsForUser(userId, skip = 0, limit = 20) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/conversations`,
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  // Get messages in a conversation
  async getMessagesInConversation(conversationId, skip = 0, limit = 30) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  // Get all messages sent to a specific user (for meeting chat)
  async getAllMessagesToUser(receiverId, skip = 0, limit = 100) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${receiverId}/messages`,
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching messages to user:", error);
      throw error;
    }
  }

  // Get messages for a specific meeting
  async getMeetingMessages(meetingId, skip = 0, limit = 30) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/meetings/${meetingId}/messages`,
        {
          params: { skip, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching meeting messages:", error);
      throw error;
    }
  }

  // Resolve/create conversation between two users
  async resolveConversation(user1, user2) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/conversations/resolve`,
        {
          user1,
          user2,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error resolving conversation:", error);
      throw error;
    }
  }

  // Format message time for display
  formatMessageTime(sentAt) {
    if (!sentAt) return "";
    const date = new Date(sentAt);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  // Get other user in conversation
  getOtherUserId(conversation, currentUserId) {
    return conversation.userA === currentUserId
      ? conversation.userB
      : conversation.userA;
  }

  // Check if a conversation is a meeting conversation (meeting ID as user)
  isMeetingConversation(conversation) {
    // Meeting IDs typically start with "MEE" prefix
    return (
      (conversation.userA && conversation.userA.startsWith("MEE")) ||
      (conversation.userB && conversation.userB.startsWith("MEE"))
    );
  }

  // Get meeting ID from conversation
  getMeetingIdFromConversation(conversation) {
    if (conversation.userA && conversation.userA.startsWith("MEE")) {
      return conversation.userA;
    }
    if (conversation.userB && conversation.userB.startsWith("MEE")) {
      return conversation.userB;
    }
    return null;
  }

  // Filter conversations to show only meeting conversations
  filterMeetingConversations(conversations) {
    return conversations.filter((conv) => this.isMeetingConversation(conv));
  }

  // Filter conversations to show only user conversations (exclude meeting conversations)
  filterUserConversations(conversations) {
    return conversations.filter((conv) => !this.isMeetingConversation(conv));
  }
}

export default new ChatService();
