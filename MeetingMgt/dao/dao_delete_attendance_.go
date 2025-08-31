package dao

import (
	"MeetingMgt/dbConfig"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"context"
)

func DB_DeleteAttendance (attendanceId string)  error {
  
        result, err := dbConfig.DATABASE.Collection("Attendances").UpdateOne(context.Background(), bson.M{"attendanceid": attendanceId}, bson.M{"$set": bson.M{"deleted": true}})
        if err != nil {
            return err
        }
        if result.ModifiedCount < 1 {
            return errors.New("Specified Id not found!")
        }
        return nil
  
}

