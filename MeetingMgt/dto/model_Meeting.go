package dto



type Meeting struct {
    MeetingId   string ` json:"MeetingId" `
    Title   string ` json:"Title" `
    Description   string ` json:"Description" `
    Date   string ` json:"Date" `
    StartTime   string ` json:"StartTime" `
    EndTime   string ` json:"EndTime" `
    Location   string ` json:"Location" `
    Participants   string ` json:"Participants" `
    Deleted bool `json:"deleted"`}

