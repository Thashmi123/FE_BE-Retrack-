import axios from 'axios';
import { TaskApi } from '../api';

// User service for managing user-related API calls
class UserService {
  constructor() {
    this.API_BASE_URL = TaskApi;
    
    // Create axios instance with default config
    this.apiClient = axios.create({
      baseURL: this.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor for debugging
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log('User API Request:', config.method?.toUpperCase(), config.url, config.params);
        return config;
      },
      (error) => {
        console.error('User API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for debugging
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log('User API Response:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('User API Response Error:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Get all users excluding the specified user ID
  async getAllUsers(excludeUserId = null) {
    try {
      const params = {};
      if (excludeUserId) {
        params.excludeUserId = excludeUserId;
      }

      const response = await this.apiClient.get('/users', { params });
      return {
        success: true,
        users: response.data.users || [],
        count: response.data.count || 0,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching all users:', error);
      return {
        success: false,
        users: [],
        count: 0,
        error: error.response?.data?.message || error.message || 'Failed to fetch users'
      };
    }
  }

  // Get a specific user by ID
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await this.apiClient.get(`/users/${userId}`);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return {
        success: false,
        user: null,
        error: error.response?.data?.message || error.message || 'Failed to fetch user'
      };
    }
  }

  // Search users by name or email
  async searchUsers(query, excludeUserId = null) {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      const params = { q: query.trim() };
      if (excludeUserId) {
        params.excludeUserId = excludeUserId;
      }

      const response = await this.apiClient.get('/users/search', { params });
      return {
        success: true,
        users: response.data.users || [],
        count: response.data.count || 0,
        query: response.data.query,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        success: false,
        users: [],
        count: 0,
        query: query,
        error: error.response?.data?.message || error.message || 'Failed to search users'
      };
    }
  }

  // Get current user ID from localStorage
  getCurrentUserId() {
    return localStorage.getItem('userId') || 
           localStorage.getItem('currentUserId') || 
           'user1'; // fallback
  }

  // Store user ID in localStorage
  setCurrentUserId(userId) {
    if (userId) {
      localStorage.setItem('userId', userId);
      localStorage.setItem('currentUserId', userId);
    }
  }

  // Clear user ID from localStorage
  clearCurrentUserId() {
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUserId');
  }

  // Get demo users as fallback
  getDemoUsers(excludeUserId = null) {
    const demoUsers = [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        online: true,
        lastSeen: new Date(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        online: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        id: 'user3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        online: true,
        lastSeen: new Date(),
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
      },
      {
        id: 'user4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        online: false,
        lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000)
      },
      {
        id: 'user5',
        name: 'David Brown',
        email: 'david@example.com',
        online: true,
        lastSeen: new Date(),
        createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000)
      }
    ];

    return demoUsers.filter(user => user.id !== excludeUserId);
  }

  // Format last seen time for display
  formatLastSeen(lastSeen) {
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
  }

  // Test API connectivity
  async testConnection() {
    try {
      const response = await this.apiClient.get('/users', { 
        params: { excludeUserId: 'test' },
        timeout: 5000 
      });
      return {
        success: true,
        message: 'API connection successful',
        endpoint: `${this.API_BASE_URL}/users`
      };
    } catch (error) {
      return {
        success: false,
        message: 'API connection failed',
        endpoint: `${this.API_BASE_URL}/users`,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

// Export singleton instance
export default new UserService();
