# ReTrack System Design

## Overview

ReTrack is a full-stack web application built with React frontend and Go microservices backend, featuring real-time chat, task management, meeting scheduling, and video conferencing capabilities.

## Frontend Architecture

### Technology Stack

- **Framework**: React.js
- **Port**: 3000
- **State Management**: React Context API
- **Styling**: SCSS/CSS
- **Real-time**: WebRTC, Server-Sent Events

### Key Components

```
Retrack/src/
├── contexts/           # Global state management
│   ├── UserContext.jsx
│   └── MessageContext.jsx
├── Services/           # API communication layer
│   ├── user.service.jsx      # Port 8889
│   ├── task.service.jsx      # Port 8888
│   ├── chat.service.jsx      # Port 8888
│   ├── meeting.service.jsx   # Port 8887
│   └── webrtc.service.js     # Video/Audio
├── Components/         # UI Components
│   ├── Application/
│   │   ├── Chat/       # Chat interface
│   │   ├── Meeting/    # Video conferencing
│   │   ├── Task/       # Task management
│   │   └── Users/      # User management
│   └── Layout/         # Navigation & headers
└── Route/              # Routing configuration
```

### Frontend Features

- **Dashboard**: Main application interface
- **Real-time Chat**: SSE-based messaging system
- **Video Meetings**: WebRTC-powered video conferencing
- **Task Management**: CRUD operations for tasks
- **User Management**: Authentication and user profiles
- **Calendar Integration**: Meeting scheduling

## Backend Architecture

### Microservices Design

The backend consists of three independent Go microservices:

#### 1. UserMGT Service (Port 8889)

- **Purpose**: User authentication and management
- **Database**: MongoDB
- **APIs**:
  - `POST /UserMGT/api/Login`
  - `POST /UserMGT/api/Register`
  - `GET /UserMGT/api/FindallUser`
  - `PUT /UserMGT/api/UpdateUser`

#### 2. TaskMGT Service (Port 8888)

- **Purpose**: Task management + Chat system
- **Database**: MongoDB
- **APIs**:
  - `POST /TaskMgt/api/CreateTask`
  - `GET /TaskMgt/api/FindallTask`
  - `POST /TaskMgt/api/messages` (Chat)
  - `GET /TaskMgt/api/sse/chat` (Real-time)

#### 3. MeetingMgt Service (Port 8887)

- **Purpose**: Meeting and attendance management
- **Database**: MongoDB
- **APIs**:
  - `POST /MeetingMgt/api/CreateMeeting`
  - `GET /MeetingMgt/api/FindallMeeting`
  - `POST /MeetingMgt/api/CreateAttendance`

### Backend Technology Stack

- **Language**: Go (Golang)
- **Framework**: Fiber (HTTP framework)
- **Database**: MongoDB Atlas
- **Real-time**: Server-Sent Events (SSE)
- **Authentication**: JWT tokens
- **CORS**: Enabled for cross-origin requests

## Database Design

### MongoDB Collections

- **Users**: User profiles, authentication data
- **Tasks**: Task management with assignments
- **Messages**: Chat messages and conversations
- **Meetings**: Meeting schedules and details
- **Attendance**: Meeting participation records

### Key Relationships

- Users can have multiple tasks (assigned to/assigned by)
- Users can have multiple conversations
- Messages belong to conversations
- Meetings can have multiple attendance records

## Real-time Features

### Server-Sent Events (SSE)

- **Endpoint**: `/TaskMgt/api/sse/chat`
- **Purpose**: Real-time message delivery
- **Implementation**: Go Fiber with SSE streaming

### WebRTC

- **Purpose**: Video/audio conferencing
- **Implementation**: Browser-based peer-to-peer connections
- **Features**: Screen sharing, media controls, participant management

## API Communication

### Service-to-Service Communication

```
Frontend (React)
    ↓ HTTP/REST
Backend Services (Go)
    ↓ MongoDB Driver
MongoDB Atlas
```

### Port Configuration

- **Frontend**: 3000
- **UserMGT**: 8889
- **TaskMGT**: 8888
- **MeetingMgt**: 8887

## Security & Authentication

### Authentication Flow

1. User registers/logs in via UserMGT service
2. JWT token generated and stored
3. Token used for subsequent API calls
4. CORS configured for cross-origin requests

### Data Validation

- Input validation on all API endpoints
- Email format validation for user registration
- Required field validation for all models

## Deployment Architecture

### Development Environment

- Local development with individual service ports
- MongoDB Atlas for database hosting
- Environment variables for configuration

### Production Considerations

- Docker containers for each service
- Load balancing for high availability
- Database connection pooling
- CORS configuration for production domains

## Key Features Summary

1. **Multi-tenant Architecture**: Separate services for different functionalities
2. **Real-time Communication**: SSE for chat, WebRTC for video
3. **Scalable Design**: Microservices can be scaled independently
4. **Modern Frontend**: React with context-based state management
5. **RESTful APIs**: Standard HTTP methods for all operations
6. **Database Flexibility**: MongoDB for flexible document storage

## Technology Dependencies

### Frontend

- React 18+
- Axios for HTTP requests
- SCSS for styling
- WebRTC APIs

### Backend

- Go 1.19+
- Fiber web framework
- MongoDB Go driver
- JWT for authentication
