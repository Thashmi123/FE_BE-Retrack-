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
      // Send request with capitalized field names to match backend expectations
      const response = await apiClient.post('/Login', {
        Email: email,
        Password: password
      });
      
      if (response.data.token) {
        // Normalize user data to ensure consistent field names
        const normalizedUser = {
          id: response.data.user.UserId,
          userId: response.data.user.UserId,
          UserId: response.data.user.UserId,
          firstName: response.data.user.FirstName,
          lastName: response.data.user.LastName,
          email: response.data.user.Email,
          username: response.data.user.Username,
          role: response.data.user.Role,
          name: `${response.data.user.FirstName} ${response.data.user.LastName}`.trim()
        };
        
        // Store user data and token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('userId', normalizedUser.id);
        localStorage.setItem('currentUserId', normalizedUser.id);
        
        return {
          ...response.data,
          user: normalizedUser
        };
      }
      return response.data;
    } catch (error) {
      console.error('Auth Service Login Error:', error);
      if (!error.response) {
        throw { message: 'Network error - please check your connection and ensure the UserMGT service is running on port 8889' };
      }
      
      // Handle specific error cases
      if (error.response.status === 401) {
        throw { message: 'Invalid email or password' };
      } else if (error.response.status === 400) {
        throw { message: error.response.data?.message || 'Invalid request format' };
      } else if (error.response.status >= 500) {
        throw { message: 'Server error - please try again later' };
      }
      
      throw error.response.data || { message: 'Login failed' };
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
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('profileURL');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('auth0_profile');
    localStorage.removeItem('Name');
    
    // Clear all session storage
    sessionStorage.clear();
    
    // Clear any cookies if they exist
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
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
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn('JWT token has expired');
        // Auto-logout if token is expired
        this.logout();
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Error validating JWT token:', e);
      return false;
    }
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