package dao

import (
	"MeetingMgt/dbConfig"
	"MeetingMgt/dto"
	
	"context"
    "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func DB_FindMeetingbyMeetingId (meetingId string) (*dto.Meeting, error) {
	var object dto.Meeting

	err := dbConfig.DATABASE.Collection("Meetings").FindOne(context.Background(), bson.M{"MeetingId": meetingId, "deleted":false}).Decode(&object)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		} else {
		    return nil, err
		}
    }
	return &object, nil
}
