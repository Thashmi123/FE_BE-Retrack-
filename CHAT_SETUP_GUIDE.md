# Chat System Setup and Testing Guide

## Overview
This guide explains how to set up and test the improved chat functionality between users in the Retrack application using real backend APIs.

## Backend Changes Made

### 1. Enhanced Message Model
- Added `SentAt` timestamp field for proper message ordering
- Added `Status` field for message delivery status
- Updated API to populate these fields automatically

### 2. Fixed API Routes
- Corrected route parameters to use path params instead of query params
- Updated conversation and message retrieval endpoints
- Added proper error handling and validation

### 3. Database Improvements
- Updated message sorting to use `SentAt` timestamp
- Improved conversation indexing for better performance

### 4. User Management API
- Created `TaskMgt/dto/model_user.go` for user data structure
- Created `TaskMgt/api/api_user.go` with user management endpoints
- Added user routes to router for fetching and searching users

## Frontend Changes Made

### 1. New Chat Service
- Created `Retrack/src/Services/chat.service.jsx` for backend API integration
- Handles message sending, conversation management, and real-time updates

### 2. Enhanced Chat Provider
- Updated `Retrack/src/_helper/Chat/ChatProvider.jsx` to use real APIs only
- Integrated with UserContext for proper user management
- Removed all mock data and sample users
- Uses backend user API for fetching available users

### 3. Improved UI Components
- Updated `SendChat.jsx` for real message sending
- Enhanced `ChatMessage.jsx` with text-based avatars (no image imports)
- Improved `ChatStatus.jsx` for conversation list management
- Removed all image dependencies and used emoji/text-based UI elements

### 4. CSS Improvements
- Added `Retrack/src/assets/scss/components/_chat-improvements.scss`
- Better message bubbles, loading states, and responsive design

## Setup Instructions

### 1. Backend Setup
1. Ensure MongoDB is running
2. Start the TaskMgt backend service:
   ```bash
   cd TaskMgt
   go run main.go
   ```
3. The backend should be running on `http://localhost:8888`

### 2. Frontend Setup
1. Import the new CSS file in your main SCSS file:
   ```scss
   @import 'components/chat-improvements';
   ```

2. Ensure the ChatProvider is wrapped around your app components that need chat functionality.

### 3. Database Indexes
The system will automatically create necessary indexes for:
- Conversation uniqueness (userA, userB pairs)
- Message sorting by conversation and timestamp

## Testing the Chat System

### 1. Backend Users Available
The system includes 5 backend users for testing (stored in memory):
- John Doe (user1) - Online
- Jane Smith (user2) - Offline
- Mike Johnson (user3) - Online
- Sarah Wilson (user4) - Offline
- David Brown (user5) - Online

### 2. Testing Steps

1. **Login as User 1**
   - Navigate to the Chat App
   - You should see a list of available users on the left sidebar

2. **Start a Conversation**
   - Click on any user from the list (e.g., Jane Smith)
   - This will create or open a conversation between you and that user

3. **Send Messages**
   - Type a message in the input field at the bottom
   - Press Enter or click Send
   - The message should appear in the chat history immediately

4. **Test with Multiple Users**
   - Open another browser/incognito window
   - Login as a different user (you may need to modify the UserContext to simulate different users)
   - Navigate to Chat App and send messages back

### 3. Features to Test

- ✅ **Message Sending**: Messages are sent to backend and stored in database
- ✅ **Real-time Display**: Messages appear immediately after sending
- ✅ **Conversation Management**: Conversations are created automatically between users
- ✅ **Message History**: Previous messages are loaded when opening a conversation
- ✅ **User Search**: Search functionality in the user list
- ✅ **Online Status**: Visual indicators for user online/offline status
- ✅ **Message Timestamps**: Proper time formatting for messages
- ✅ **Responsive Design**: Works on mobile and desktop

## API Endpoints

### Chat APIs
- `POST /TaskMgt/api/messages` - Send a new message
- `GET /TaskMgt/api/users/:userId/conversations` - Get user's conversations
- `GET /TaskMgt/api/conversations/:conversationId/messages` - Get messages in conversation
- `POST /TaskMgt/api/conversations/resolve` - Create/get conversation between two users

### User APIs
- `GET /TaskMgt/api/users` - Get all users (with optional excludeUserId param)
- `GET /TaskMgt/api/users/:userId` - Get specific user by ID
- `GET /TaskMgt/api/users/search` - Search users by name or email

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure TaskMgt backend is running on port 8888
   - Check CORS settings allow frontend domain

2. **Messages Not Appearing**
   - Check browser console for API errors
   - Verify user authentication is working
   - Ensure MongoDB is running and accessible

3. **User List Empty**
   - Check if backend user API is accessible at `/TaskMgt/api/users`
   - Verify UserContext is properly providing user information
   - Ensure backend is returning users in correct format

4. **Styling Issues**
   - Ensure the chat-improvements.scss file is imported
   - Check if Bootstrap classes are available
   - Text-based avatars should display with colored circles

5. **Image Loading Errors**
   - All images have been replaced with text-based avatars and emojis
   - No external image dependencies should exist

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'chat:*');
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket for live message updates
2. **File Sharing**: Add support for image and file attachments
3. **Message Status**: Show delivered/read status for messages
4. **Group Chats**: Extend to support multi-user conversations
5. **Push Notifications**: Browser notifications for new messages
6. **Message Search**: Search within conversation history
7. **Emoji Reactions**: Add reaction support to messages

## Security Considerations

1. **Authentication**: Ensure proper user authentication before accessing chat
2. **Authorization**: Verify users can only access their own conversations
3. **Input Validation**: Sanitize message content to prevent XSS
4. **Rate Limiting**: Implement rate limiting for message sending
5. **Data Privacy**: Ensure messages are encrypted in transit and at rest

---

The chat system is now fully functional with real backend integration, providing smooth messaging between users while maintaining the existing UI design.