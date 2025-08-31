package dto



type Attendance struct {
    AttendanceId   string ` json:"AttendanceId" `
    Date   string ` json:"Date" `
    Status   string ` json:"Status" `
    Deleted bool `json:"deleted"`}

