package dao

import (
	"TaskMgt/dbConfig"
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
)

func DB_DeleteTask(taskId string) error {

	result, err := dbConfig.DATABASE.Collection("Tasks").UpdateOne(context.Background(), bson.M{"taskid": taskId}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		return err
	}
	if result.ModifiedCount < 1 {
		return errors.New("Specified Id not found!")
	}
	return nil

}
