# Real-time Chat with Server-Sent Events (SSE)

This implementation provides real-time chat functionality using Server-Sent Events (SSE) for continuous message streaming between the React frontend and Go backend.

## Features Implemented

### ✅ Backend (Go - TaskMgt)

- **SSE Endpoint**: `/sse/chat?userId={userId}` - Streams real-time messages to specific users
- **Message Broadcasting**: Automatically broadcasts new messages to all connected clients
- **User Filtering**: Only sends messages relevant to the connected user
- **Heartbeat**: Sends periodic heartbeat messages to keep connections alive
- **Error Handling**: Proper error handling and connection cleanup
- **CORS Support**: Configured for cross-origin requests

### ✅ Frontend (React - Retrack)

- **Global Message State**: React Context for managing all messages across the app
- **SSE Client**: Automatic connection and reconnection with exponential backoff
- **Real-time Updates**: Messages appear instantly without manual refresh
- **Notification Badges**: Shows unread message counts for inactive chats
- **Auto-reconnection**: Automatically reconnects on connection loss
- **Error Handling**: Graceful error handling and user feedback

## Architecture

### Backend Architecture

```
TaskMgt/
├── api/
│   └── api_msg_api.go          # SSE endpoint and message APIs
├── dto/
│   └── model_message.go        # Message and Conversation models
└── apiHandlers/
    └── router.go               # Route registration
```

### Frontend Architecture

```
Retrack/src/
├── contexts/
│   └── MessageContext.jsx     # Global message state management
├── _helper/Chat/
│   └── ChatProvider.jsx       # Chat-specific provider
├── Components/Application/Chat/
│   └── ChatApp/
│       ├── ChatStatus.jsx     # User list with notification badges
│       └── Chatting.jsx       # Chat interface
└── assets/scss/components/
    └── _chat-notifications.scss # Notification styling
```

## API Endpoints

### Message APIs

- `POST /TaskMgt/api/messages` - Send a new message
- `GET /TaskMgt/api/users/{userId}/conversations` - Get user conversations
- `GET /TaskMgt/api/conversations/{conversationId}/messages` - Get conversation messages
- `POST /TaskMgt/api/conversations/resolve` - Create or get conversation between users

### SSE Endpoint

- `GET /sse/chat?userId={userId}` - Real-time message stream

## Usage

### Backend Setup

1. Start the Go backend server:

```bash
cd TaskMgt
go run main.go
```

2. Test SSE connection:

```bash
go run test_sse.go
```

### Frontend Setup

1. Install dependencies:

```bash
cd Retrack
npm install
```

2. Start the React development server:

```bash
npm start
```

3. Navigate to the chat application in your browser

## Key Components

### MessageContext

The `MessageContext` provides global message state management:

- **State**: conversations, messages, unread counts, connection status
- **Actions**: fetch conversations, send messages, manage unread counts
- **SSE**: Automatic connection and message handling

### SSE Connection

- **Auto-connect**: Connects when user is logged in
- **Reconnection**: Exponential backoff on connection loss
- **User filtering**: Only receives relevant messages
- **Heartbeat**: Keeps connection alive

### Notification System

- **Unread counts**: Tracks unread messages per conversation
- **Visual indicators**: Badges on inactive chats
- **Auto-reset**: Clears counts when conversation is opened

## Configuration

### Environment Variables

Set the API base URL in your React app:

```javascript
// In your .env file
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Backend Configuration

The SSE endpoint is configured in `api_msg_api.go`:

- **Heartbeat interval**: 30 seconds
- **Max reconnection attempts**: 5
- **Reconnection delay**: 3 seconds (with exponential backoff)

## Testing

### Manual Testing

1. Open two browser windows/tabs
2. Log in as different users
3. Send messages between users
4. Verify real-time updates
5. Check notification badges

### Automated Testing

Run the Go test script:

```bash
cd TaskMgt
go run test_sse.go
```

## Error Handling

### Backend Errors

- **Connection errors**: Logged and handled gracefully
- **Message validation**: Proper error responses
- **SSE errors**: Connection cleanup on errors

### Frontend Errors

- **Connection loss**: Automatic reconnection with backoff
- **API errors**: User-friendly error messages
- **SSE errors**: Graceful degradation

## Performance Considerations

### Backend

- **Connection pooling**: Efficient client management
- **Message filtering**: Only sends relevant messages
- **Memory management**: Proper cleanup of closed connections

### Frontend

- **State optimization**: Efficient re-renders
- **Connection management**: Single connection per user
- **Memory cleanup**: Proper component unmounting

## Security Considerations

- **User validation**: Messages are filtered by user ID
- **CORS configuration**: Proper cross-origin setup
- **Input validation**: Message content validation
- **Connection limits**: Prevents connection flooding

## Troubleshooting

### Common Issues

1. **SSE Connection Failed**

   - Check if backend is running
   - Verify CORS configuration
   - Check browser console for errors

2. **Messages Not Appearing**

   - Verify user IDs are correct
   - Check SSE connection status
   - Verify message API responses

3. **Reconnection Issues**
   - Check network connectivity
   - Verify backend is accessible
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem("debug", "true");
```

## Future Enhancements

- **Message persistence**: Store messages in database
- **Typing indicators**: Show when users are typing
- **Message status**: Read receipts and delivery status
- **File sharing**: Support for file attachments
- **Group chats**: Multi-user conversations
- **Message search**: Search through message history
- **Push notifications**: Browser notifications for new messages

## Dependencies

### Backend

- Go 1.19+
- Fiber v2
- PostgreSQL (for message persistence)

### Frontend

- React 18+
- React Context API
- Bootstrap 5 (for styling)

## License

This implementation is part of the Retrack project and follows the same licensing terms.
