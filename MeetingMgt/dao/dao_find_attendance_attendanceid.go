package dao

import (
	"MeetingMgt/dbConfig"
	"MeetingMgt/dto"
	
	"context"
    "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func DB_FindAttendancebyAttendanceId (attendanceId string) (*dto.Attendance, error) {
	var object dto.Attendance

	err := dbConfig.DATABASE.Collection("Attendances").FindOne(context.Background(), bson.M{"attendanceid": attendanceId, "deleted":false}).Decode(&object)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		} else {
		    return nil, err
		}
    }
	return &object, nil
}
