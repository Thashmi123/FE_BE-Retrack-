# Meeting Chat Implementation

## Overview

This implementation adds meeting-specific chat functionality where conversations are properly identified by meeting ID and user context. When a user sends a message via a meeting ID to user-6 (the meeting chat user), the message is tagged with the meeting information for proper identification.

## Backend Changes

### 1. Extended Message Model (`TaskMgt/dto/model_message.go`)

- Added `MeetingID` field to store the meeting ID
- Added `MeetingTitle` field to store the meeting title for display purposes

### 2. Updated Message API (`TaskMgt/api/api_msg_api.go`)

- Modified `SendMessageApi` to accept optional `meetingId` and `meetingTitle` parameters
- Added `GetMeetingMessagesApi` endpoint to retrieve messages by meeting ID
- Messages now include meeting context when provided

### 3. Enhanced DAO Layer (`TaskMgt/dao/create_conversation.go`)

- Added `DB_ListMessagesByMeeting` function to query messages by meeting ID
- Supports pagination with skip/limit parameters

### 4. Updated Router (`TaskMgt/apiHandlers/router.go`)

- Added route: `GET /meetings/:meetingId/messages` for meeting-specific message retrieval

## Frontend Changes

### 1. Enhanced Chat Service (`Retrack/src/Services/chat.service.jsx`)

- Updated `sendMessage` method to accept optional `meetingId` and `meetingTitle` parameters
- Added `getMeetingMessages` method to fetch messages for a specific meeting
- Maintains backward compatibility with existing functionality

### 2. Improved Meeting Chat Component (`Retrack/src/Components/Application/Meeting/MeetingChat.jsx`)

- Modified `loadChatMessages` to load messages specific to the selected meeting
- Updated `handleSendMessage` to include meeting context when sending messages
- Enhanced message display to show meeting title and ID
- Added meeting context header in the chat interface

## Key Features

### Meeting-Specific Messages

- Messages are now tagged with meeting ID and title
- Each meeting has its own isolated chat history
- Messages sent to user-6 are properly identified by meeting context

### Enhanced UI

- Meeting title is displayed in the chat header
- Messages show meeting context with badges
- Meeting ID is displayed in message metadata
- Improved message layout with better visual hierarchy

### Backward Compatibility

- Existing chat functionality remains unchanged
- Meeting context is optional - regular chats work without meeting ID
- All existing API endpoints continue to work

## API Endpoints

### New Endpoints

- `GET /meetings/:meetingId/messages` - Get messages for a specific meeting
- `POST /messages` - Enhanced to accept meeting context (optional)

### Updated Endpoints

- `POST /messages` now accepts:
  ```json
  {
    "senderId": "string",
    "receiverId": "string",
    "text": "string",
    "meetingId": "string", // optional
    "meetingTitle": "string" // optional
  }
  ```

## Usage Example

### Sending a Meeting Message

```javascript
// Send message with meeting context
await ChatService.sendMessage(
  currentUser.id, // senderId
  "USR-6", // receiverId (meeting chat user)
  "Hello everyone!", // message text
  "MEET-123", // meetingId
  "Project Review" // meetingTitle
);
```

### Loading Meeting Messages

```javascript
// Load messages for a specific meeting
const response = await ChatService.getMeetingMessages("MEET-123");
const messages = response.messages;
```

## Database Schema Changes

The Messages collection now includes:

- `meetingId` (string, optional) - References the meeting ID
- `meetingTitle` (string, optional) - Meeting title for display

## Benefits

1. **Meeting Isolation**: Each meeting has its own chat history
2. **Context Awareness**: Messages are clearly identified by meeting
3. **User Experience**: Clear visual indicators of meeting context
4. **Scalability**: Supports multiple concurrent meetings
5. **Flexibility**: Works with any meeting ID and user-6 as the meeting chat user

## Testing

To test the implementation:

1. Select a meeting from the meeting list
2. Send a message - it will be tagged with the meeting context
3. Switch to another meeting - you'll see different messages
4. Messages sent to user-6 will be identifiable by meeting title and ID

The implementation ensures that conversations are properly organized by meeting context while maintaining the existing chat functionality for regular user-to-user conversations.
