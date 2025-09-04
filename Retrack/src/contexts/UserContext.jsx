import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../Services/auth.service';

// Create context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        const token = AuthService.getToken();
        
        console.log('UserContext initialization - User:', currentUser, 'Token exists:', !!token);
        
        // Validate token exists and is not expired
        if (currentUser && token && AuthService.isLoggedIn()) {
          // Ensure userId is stored in localStorage for chat functionality
          const userId = currentUser.id || currentUser.userId || currentUser.UserId || currentUser.ID;
          
          if (!userId) {
            console.error('No valid userId found in user data:', currentUser);
            AuthService.logout();
            setUser(null);
            setLoading(false);
            return;
          }
          
          const enhancedUser = {
            ...currentUser,
            id: userId,
            userId: userId,
            UserId: userId,
            name: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username || 'User'
          };
          
          // Store enhanced user data with consistent userId
          localStorage.setItem('user', JSON.stringify(enhancedUser));
          localStorage.setItem('userId', userId);
          localStorage.setItem('currentUserId', userId);
          
          setUser(enhancedUser);
          AuthService.setAuthHeader();
          
          console.log('User initialized successfully:', enhancedUser);
        } else {
          // If no token or token expired, ensure user is logged out
          console.log('No valid token found or token expired, logging out');
          AuthService.logout();
          setUser(null);
          // Clear userId from localStorage
          localStorage.removeItem('userId');
          localStorage.removeItem('currentUserId');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        AuthService.logout();
        setUser(null);
        localStorage.removeItem('userId');
        localStorage.removeItem('currentUserId');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Periodically check if user is still logged in
  useEffect(() => {
    const interval = setInterval(() => {
      if (!AuthService.isLoggedIn()) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('UserContext login attempt for:', email);
      const response = await AuthService.login(email, password);
      
      console.log('Login response received:', response);
      
      // The AuthService.login already normalizes the user data
      const enhancedUser = response.user;
      
      if (!enhancedUser.id && !enhancedUser.userId) {
        throw new Error('Invalid user data received from server');
      }
      
      setUser(enhancedUser);
      AuthService.setAuthHeader();
      
      console.log('User logged in successfully:', enhancedUser);
      return response;
    } catch (error) {
      console.error('Login failed in UserContext:', error);
      // Make sure user is null on login failure
      setUser(null);
      localStorage.removeItem('userId');
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    setUser(null);
    
    // Clear userId and chat-related data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('chatSettings');
    localStorage.removeItem('selectedChatUser');
    
    // Clear any cached data
    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  };

  // Update user function
  const updateUser = (userData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...userData };
      // Ensure userId consistency
      const userId = updatedUser.id || updatedUser.userId || updatedUser.ID || 'user1';
      updatedUser.id = userId;
      updatedUser.userId = userId;
      
      // Update in localStorage as well
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userId', userId);
      localStorage.setItem('currentUserId', userId);
      
      return updatedUser;
    });
  };

  // Get current userId from localStorage (utility function)
  const getCurrentUserId = () => {
    return localStorage.getItem('userId') || localStorage.getItem('currentUserId') || user?.id || user?.userId || 'user1';
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    getCurrentUserId,
    isLoggedIn: !!user, // Use user state instead of AuthService.isLoggedIn()
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserContext;