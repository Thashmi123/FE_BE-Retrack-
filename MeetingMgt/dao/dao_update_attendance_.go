package dao

import (
	"MeetingMgt/dbConfig"
    "MeetingMgt/dto"
    "errors"
    "go.mongodb.org/mongo-driver/bson"
	"context"
)

func DB_UpdateAttendance (object *dto.Attendance)  error {

	result, err := dbConfig.DATABASE.Collection("Attendances").UpdateOne(context.Background(), bson.M{"attendanceid": object.AttendanceId, "deleted":false}, bson.M{"$set": object})
	if err != nil {
		return err
	}
	if result.ModifiedCount < 1 && result.MatchedCount != 1 {
		return errors.New("Specified ID not found!")
	}

	return nil
}