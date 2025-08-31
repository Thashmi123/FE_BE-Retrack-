package dao

import (
    "context"
	"MeetingMgt/dbConfig"
	"MeetingMgt/dto"

)

func DB_CreateMeeting (object *dto.Meeting) error {

	_, err := dbConfig.DATABASE.Collection("Meetings").InsertOne(context.Background(), object)
	if err != nil {
		return err
	}
	return nil
}