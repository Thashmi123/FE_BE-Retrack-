package dao

import (
	"MeetingMgt/dbConfig"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"context"
)

func DB_DeleteMeeting (meetingId string)  error {
  
        result, err := dbConfig.DATABASE.Collection("Meetings").UpdateOne(context.Background(), bson.M{"MeetingId": meetingId}, bson.M{"$set": bson.M{"deleted": true}})
        if err != nil {
            return err
        }
        if result.ModifiedCount < 1 {
            return errors.New("Specified Id not found!")
        }
        return nil
  
}

