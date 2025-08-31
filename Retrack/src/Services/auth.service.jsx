import axios from 'axios';

// UserMGT API base URL
const API_BASE_URL = 'http://localhost:8889/UserMGT/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class AuthService {
  // Login with email and password
  async login(email, password) {
    try {
      const response = await apiClient.post('/Login', { email, password });
      if (response.data.token) {
        // Store user data and token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }

  // Register a new user
  async register(userData) {
    try {
      const response = await apiClient.post('/Register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }

  // Logout
  logout() {
    // Remove user from local storage to log user out
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get JWT token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  }

  // Set authorization header for API requests
  setAuthHeader() {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  // Update user profile
  async updateUser(userData) {
    try {
      // For now, we'll simulate this since UserMGT doesn't have a direct update endpoint
      // In a real implementation, you would call the appropriate API endpoint
      const user = this.getCurrentUser();
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
}

// Export singleton instance
export default new AuthService();