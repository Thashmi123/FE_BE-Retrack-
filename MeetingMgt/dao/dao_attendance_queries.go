package dao

import (
	"MeetingMgt/dbConfig"
	"MeetingMgt/dto"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

// Find attendance by meeting ID and user ID for a specific date
func DB_FindAttendanceByMeetingAndUser(meetingId, userId, date string) (*dto.Attendance, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"meetingid": meetingId,
		"userid":    userId,
		"date":      date,
		"deleted":   false,
	}

	var attendance dto.Attendance
	err := dbConfig.DATABASE.Collection("Attendances").FindOne(ctx, filter).Decode(&attendance)
	if err != nil {
		return nil, err
	}

	return &attendance, nil
}

// Find all attendance records for a specific meeting
func DB_FindAttendanceByMeeting(meetingId string) ([]dto.Attendance, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"meetingid": meetingId,
		"deleted":   false,
	}

	cursor, err := dbConfig.DATABASE.Collection("Attendances").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var attendances []dto.Attendance
	if err = cursor.All(ctx, &attendances); err != nil {
		return nil, err
	}

	return attendances, nil
}

// Find all attendance records for a specific user
func DB_FindAttendanceByUser(userId string) ([]dto.Attendance, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"userid":  userId,
		"deleted": false,
	}

	cursor, err := dbConfig.DATABASE.Collection("Attendances").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var attendances []dto.Attendance
	if err = cursor.All(ctx, &attendances); err != nil {
		return nil, err
	}

	return attendances, nil
}

// Find meeting by ID (helper function for attendance summary)
func DB_FindMeetingById(meetingId string) (*dto.Meeting, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"meetingid": meetingId,
		"deleted":   false,
	}

	var meeting dto.Meeting
	err := dbConfig.DATABASE.Collection("Meetings").FindOne(ctx, filter).Decode(&meeting)
	if err != nil {
		return nil, err
	}

	return &meeting, nil
}
