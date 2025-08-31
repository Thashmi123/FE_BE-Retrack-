package dao

import (
	"TaskMgt/dbConfig"
	"TaskMgt/dto"
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
)

func DB_UpdateTask(object *dto.Task) error {

	result, err := dbConfig.DATABASE.Collection("Tasks").UpdateOne(context.Background(), bson.M{"taskid": object.TaskId, "deleted": false}, bson.M{"$set": object})
	if err != nil {
		return err
	}
	if result.ModifiedCount < 1 && result.MatchedCount != 1 {
		return errors.New("Specified ID not found!")
	}

	return nil
}
