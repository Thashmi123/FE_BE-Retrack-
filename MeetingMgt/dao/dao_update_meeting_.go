package dao

import (
	"MeetingMgt/dbConfig"
    "MeetingMgt/dto"
    "errors"
    "go.mongodb.org/mongo-driver/bson"
	"context"
)

func DB_UpdateMeeting (object *dto.Meeting)  error {

	result, err := dbConfig.DATABASE.Collection("Meetings").UpdateOne(context.Background(), bson.M{"meetingid": object.MeetingId, "deleted":false}, bson.M{"$set": object})
	if err != nil {
		return err
	}
	if result.ModifiedCount < 1 && result.MatchedCount != 1 {
		return errors.New("Specified ID not found!")
	}

	return nil
}