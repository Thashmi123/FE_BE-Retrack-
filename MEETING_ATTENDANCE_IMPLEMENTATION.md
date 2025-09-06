# Meeting Attendance Tracking Implementation

## Overview

This implementation adds automatic meeting participant tracking and attendance management to the ReTrack system. When users click on meetings, their attendance is automatically tracked, and meeting organizers can view attendance counts and participant lists.

## Features Implemented

### 1. Enhanced Attendance Data Model

**File**: `MeetingMgt/dto/model_Attendance.go`

- **Enhanced Attendance struct** with new fields:

  - `MeetingId`: Links attendance to specific meeting
  - `UserId`: Links attendance to specific user
  - `UserName`: User's display name
  - `UserEmail`: User's email address
  - `JoinTime`: When user joined the meeting
  - `LeaveTime`: When user left the meeting
  - `Duration`: Meeting duration in minutes
  - `Status`: Attendance status (present, absent, late, left_early)
  - `CreatedAt`/`UpdatedAt`: Timestamps

- **MeetingAttendanceSummary struct** for aggregated data:
  - Meeting details
  - Total participants count
  - Present/absent counts
  - Complete participant list

### 2. Backend API Endpoints

**New API endpoints in MeetingMgt service (Port 8887):**

#### Join Meeting

- **Endpoint**: `POST /MeetingMgt/api/JoinMeeting`
- **Purpose**: Automatically track when a user joins a meeting
- **Body**: `{ MeetingId, UserId, UserName, UserEmail }`
- **Response**: Success message with attendance record

#### Leave Meeting

- **Endpoint**: `POST /MeetingMgt/api/LeaveMeeting`
- **Purpose**: Track when a user leaves and calculate duration
- **Body**: `{ MeetingId, UserId, Date }`
- **Response**: Updated attendance record with duration

#### Get Meeting Attendance

- **Endpoint**: `GET /MeetingMgt/api/GetMeetingAttendance?meetingId={id}`
- **Purpose**: Get attendance summary and participant list for a meeting
- **Response**: `MeetingAttendanceSummary` object

#### Get User Attendance

- **Endpoint**: `GET /MeetingMgt/api/GetUserAttendance?userId={id}`
- **Purpose**: Get all attendance records for a specific user
- **Response**: Array of attendance records

### 3. Database Layer

**File**: `MeetingMgt/dao/dao_attendance_queries.go`

New DAO functions:

- `DB_FindAttendanceByMeetingAndUser()`: Find specific attendance record
- `DB_FindAttendanceByMeeting()`: Get all attendance for a meeting
- `DB_FindAttendanceByUser()`: Get all attendance for a user
- `DB_FindMeetingById()`: Helper to get meeting details

### 4. Frontend Integration

#### Meeting Service Updates

**File**: `Retrack/src/Services/meeting.service.jsx`

Added new methods:

- `joinMeeting(attendanceData)`: Track meeting join
- `leaveMeeting(leaveData)`: Track meeting leave
- `getMeetingAttendance(meetingId)`: Get attendance data
- `getUserAttendance(userId)`: Get user's attendance history

#### MeetingAttendance Component

**File**: `Retrack/src/Components/Application/Meeting/MeetingAttendance.jsx`

New React component that displays:

- Attendance summary statistics (total, present, absent, attendance rate)
- Detailed participant list with join times and duration
- Status badges for each participant
- Real-time attendance data

#### MeetingRoom Component Updates

**File**: `Retrack/src/Components/Application/Meeting/MeetingRoom.jsx`

Enhanced with:

- Automatic attendance tracking when meetings are selected
- "Show Attendance" button for selected meetings
- Background tracking of join/leave events
- Integration with MeetingAttendance component

#### Meeting Management Component Updates

**File**: `Retrack/src/Components/Application/Meeting/index.jsx`

Enhanced with:

- "Attendance" button for each meeting in the table
- Modal display of attendance information
- Integration with MeetingAttendance component

## How It Works

### Automatic Tracking Flow

1. **User Clicks Meeting**: When a user selects a meeting in the MeetingRoom component
2. **Automatic Join Tracking**: System automatically calls `JoinMeeting` API
3. **Attendance Record Created**: New attendance record created with join time
4. **User Leaves Meeting**: When user leaves, `LeaveMeeting` API called
5. **Duration Calculated**: System calculates and stores meeting duration

### Manual Attendance Viewing

1. **Click Attendance Button**: User clicks "Attendance" button on any meeting
2. **API Call**: System calls `GetMeetingAttendance` API
3. **Data Display**: MeetingAttendance component displays:
   - Total participant count
   - Present/absent counts
   - Attendance rate percentage
   - Detailed participant list with join times and durations

### Data Flow

```
Frontend (React)
    ↓ HTTP/REST
MeetingMgt Service (Go)
    ↓ MongoDB Driver
MongoDB (Attendances Collection)
```

## Usage Examples

### For Meeting Organizers

1. **View Meeting List**: Go to Meeting Management page
2. **Click Attendance Button**: Click "Attendance" button for any meeting
3. **View Statistics**: See total participants, present count, attendance rate
4. **View Participants**: See detailed list of who attended and for how long

### For Meeting Participants

1. **Join Meeting**: Click on any meeting in MeetingRoom
2. **Automatic Tracking**: Your attendance is automatically recorded
3. **Leave Meeting**: When you leave, duration is calculated and stored

## Technical Details

### Database Schema

**Attendances Collection:**

```json
{
  "attendanceid": "ATT_123456",
  "meetingid": "MEE_789012",
  "userid": "USR_345678",
  "username": "John Doe",
  "useremail": "john@example.com",
  "date": "2024-01-15",
  "status": "present",
  "jointime": "14:30:00",
  "leavetime": "15:45:00",
  "duration": 75,
  "createdat": "2024-01-15T14:30:00Z",
  "updatedat": "2024-01-15T15:45:00Z",
  "deleted": false
}
```

### API Response Examples

**GetMeetingAttendance Response:**

```json
{
  "MeetingId": "MEE_789012",
  "MeetingTitle": "Weekly Team Standup",
  "TotalParticipants": 5,
  "PresentCount": 4,
  "AbsentCount": 1,
  "Participants": [
    {
      "AttendanceId": "ATT_123456",
      "UserId": "USR_345678",
      "UserName": "John Doe",
      "UserEmail": "john@example.com",
      "Status": "present",
      "JoinTime": "14:30:00",
      "LeaveTime": "15:45:00",
      "Duration": 75
    }
  ]
}
```

## Benefits

1. **Automatic Tracking**: No manual attendance taking required
2. **Real-time Data**: Attendance data available immediately
3. **Detailed Analytics**: Join times, durations, and attendance rates
4. **User-friendly Interface**: Easy-to-use attendance viewing
5. **Scalable**: Works with any number of meetings and participants
6. **Integrated**: Seamlessly integrated with existing meeting system

## Future Enhancements

1. **Email Notifications**: Send attendance reports via email
2. **Export Functionality**: Export attendance data to CSV/Excel
3. **Attendance Reports**: Generate detailed attendance reports
4. **Mobile App Integration**: Track attendance from mobile devices
5. **Real-time Updates**: Live attendance updates during meetings
6. **Attendance Policies**: Set up attendance requirements and policies

## Testing

To test the implementation:

1. **Start Backend Services**: Ensure MeetingMgt service is running on port 8887
2. **Start Frontend**: Run React app on port 3000
3. **Create Meeting**: Create a test meeting
4. **Join Meeting**: Click on the meeting to trigger attendance tracking
5. **View Attendance**: Click "Attendance" button to see participant data
6. **Leave Meeting**: Leave the meeting to test duration calculation

## Dependencies

- **Backend**: Go 1.19+, Fiber framework, MongoDB driver
- **Frontend**: React 18+, Axios for HTTP requests
- **Database**: MongoDB with Attendances collection
