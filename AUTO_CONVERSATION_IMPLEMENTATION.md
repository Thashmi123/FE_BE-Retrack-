# Automatic Meeting Conversation Implementation

## Overview

This implementation automatically creates conversations when meetings are created, using the meeting ID as a "user ID" for the conversation. It also properly filters and separates meeting chats from regular user chats in the frontend.

## Backend Changes

### 1. New API Endpoint (`TaskMgt/api/api_msg_api.go`)

- **Added**: `CreateMeetingConversationApi` function
- **Route**: `POST /meetings/:meetingId/conversation`
- **Purpose**: Creates a conversation between meeting ID (as user A) and USR-6 (meeting chat user as user B)
- **Functionality**:
  - Uses meeting ID as one participant in the conversation
  - Creates conversation with USR-6 as the meeting chat user
  - Returns conversation details with meeting context

### 2. Updated Router (`TaskMgt/apiHandlers/router.go`)

- **Added**: Route for meeting conversation creation
- **Route**: `cg.Post("/meetings/:meetingId/conversation", api.CreateMeetingConversationApi)`

### 3. Enhanced Meeting Creation (`MeetingMgt/api/api_create_meeting_meetingId.go`)

- **Added**: `createMeetingConversation` function
- **Modified**: `CreateMeetingApi` to automatically create conversation after meeting creation
- **Cross-service call**: Calls TaskMgt service to create conversation
- **Error handling**: Logs warnings if conversation creation fails but doesn't fail meeting creation

## Frontend Changes

### 1. Enhanced Chat Service (`Retrack/src/Services/chat.service.jsx`)

- **Added**: `isMeetingConversation()` - Checks if conversation involves meeting ID
- **Added**: `getMeetingIdFromConversation()` - Extracts meeting ID from conversation
- **Added**: `filterMeetingConversations()` - Filters to show only meeting conversations
- **Added**: `filterUserConversations()` - Filters to show only user conversations (excludes meetings)

### 2. Updated Meeting Chat Component (`Retrack/src/Components/Application/Meeting/MeetingChat.jsx`)

- **Modified**: `loadAllConversations()` to filter and show only meeting conversations
- **Enhanced**: Conversation display to show meeting titles and IDs
- **Improved**: UI to display meeting context with calendar icons and meeting information

### 3. Updated Message Context (`Retrack/src/contexts/MessageContext.jsx`)

- **Modified**: `fetchConversations()` to filter out meeting conversations
- **Result**: Regular chat page now shows only user-to-user conversations

## Key Features

### Automatic Conversation Creation

- **Trigger**: When a meeting is created via `CreateMeetingApi`
- **Process**:
  1. Meeting is created with unique meeting ID (MEE-xxx)
  2. Cross-service call to TaskMgt creates conversation
  3. Conversation created between meeting ID and USR-6
- **Error Handling**: Meeting creation succeeds even if conversation creation fails

### Conversation Filtering

- **Meeting Chat Area**: Shows only conversations involving meeting IDs
- **Regular Chat Area**: Shows only user-to-user conversations
- **Identification**: Meeting conversations identified by meeting ID prefix (MEE-xxx)

### Enhanced UI

- **Meeting Conversations**: Display with calendar icons and meeting titles
- **Meeting Context**: Shows meeting ID and title in conversation list
- **Visual Separation**: Clear distinction between meeting and user chats

## API Endpoints

### New Endpoints

- `POST /meetings/:meetingId/conversation` - Create conversation for meeting

### Updated Endpoints

- `POST /CreateMeeting` - Now automatically creates conversation

## Database Impact

### Conversations Collection

- **New Pattern**: Conversations with meeting IDs as participants
- **Example**:
  ```json
  {
    "id": "CON-123",
    "userA": "MEE-456", // Meeting ID
    "userB": "USR-6", // Meeting chat user
    "createdAt": "2024-01-01T00:00:00Z"
  }
  ```

### Messages Collection

- **Enhanced**: Messages include meeting context
- **Filtering**: Can be filtered by meeting ID for meeting-specific chats

## Usage Flow

### 1. Meeting Creation

```javascript
// When meeting is created
const meeting = {
  title: "Project Review",
  date: "2024-01-15",
  // ... other meeting data
};

// API automatically:
// 1. Creates meeting with ID "MEE-123"
// 2. Creates conversation between "MEE-123" and "USR-6"
```

### 2. Meeting Chat Access

```javascript
// Meeting chat area shows:
// - Conversations involving meeting IDs
// - Meeting titles and context
// - Filtered from regular user chats
```

### 3. Regular Chat Access

```javascript
// Regular chat area shows:
// - Only user-to-user conversations
// - Meeting conversations are hidden
// - Clean user interface
```

## Benefits

1. **Automatic Setup**: No manual conversation creation needed
2. **Clear Separation**: Meeting chats and user chats are properly separated
3. **Context Awareness**: Meeting conversations show meeting context
4. **Scalable**: Works with any number of meetings
5. **User Experience**: Clean interfaces for both meeting and user chats
6. **Error Resilient**: Meeting creation succeeds even if conversation creation fails

## Testing

### Meeting Creation Test

1. Create a new meeting
2. Verify conversation is automatically created
3. Check that meeting ID is used as conversation participant

### Chat Filtering Test

1. Access meeting chat area - should show only meeting conversations
2. Access regular chat area - should show only user conversations
3. Verify meeting conversations show meeting context

### Cross-Service Integration Test

1. Verify MeetingMgt service calls TaskMgt service
2. Check error handling when TaskMgt service is unavailable
3. Confirm meeting creation succeeds even with conversation creation failure

## Configuration

### Service URLs

- **MeetingMgt**: `http://localhost:8887/MeetingMgt/api`
- **TaskMgt**: `http://localhost:8888/TaskMgt/api`

### Meeting ID Format

- **Prefix**: "MEE" (configurable in IdGenerator)
- **Example**: "MEE-123456789"

### Meeting Chat User

- **ID**: "USR-6"
- **Name**: "The Meeting Chat"
- **Purpose**: Central meeting chat user for all meeting conversations

This implementation ensures that meeting conversations are automatically created and properly separated from regular user conversations, providing a clean and organized chat experience for both meeting and user interactions.
