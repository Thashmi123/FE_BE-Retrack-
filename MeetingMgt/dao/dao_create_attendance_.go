package dao

import (
    "context"
	"MeetingMgt/dbConfig"
	"MeetingMgt/dto"

)

func DB_CreateAttendance (object *dto.Attendance) error {

	_, err := dbConfig.DATABASE.Collection("Attendances").InsertOne(context.Background(), object)
	if err != nil {
		return err
	}
	return nil
}