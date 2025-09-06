package dto

import "time"

type Attendance struct {
    AttendanceId   string `json:"AttendanceId" bson:"attendanceid"`
    MeetingId      string `json:"MeetingId" bson:"meetingid" validate:"required"`
    UserId         string `json:"UserId" bson:"userid" validate:"required"`
    UserName       string `json:"UserName" bson:"username"`
    UserEmail      string `json:"UserEmail" bson:"useremail"`
    Date           string `json:"Date" bson:"date"`
    Status         string `json:"Status" bson:"status"` // "present", "absent", "late", "left_early"
    JoinTime       string `json:"JoinTime" bson:"jointime"`
    LeaveTime      string `json:"LeaveTime" bson:"leavetime"`
    Duration       int    `json:"Duration" bson:"duration"` // in minutes
    CreatedAt      time.Time `json:"CreatedAt" bson:"createdat"`
    UpdatedAt      time.Time `json:"UpdatedAt" bson:"updatedat"`
    Deleted        bool   `json:"deleted" bson:"deleted"`
}

type MeetingAttendanceSummary struct {
    MeetingId        string       `json:"MeetingId"`
    MeetingTitle     string       `json:"MeetingTitle"`
    TotalParticipants int         `json:"TotalParticipants"`
    PresentCount     int          `json:"PresentCount"`
    AbsentCount      int          `json:"AbsentCount"`
    Participants     []Attendance `json:"Participants"`
}

