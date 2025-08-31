package dao

import (
	"TaskMgt/dbConfig"
	"TaskMgt/dto"

	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func DB_FindTaskbyTaskId(taskId string) (*dto.Task, error) {
	var object dto.Task

	err := dbConfig.DATABASE.Collection("Tasks").FindOne(context.Background(), bson.M{"taskid": taskId, "deleted": false}).Decode(&object)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		} else {
			return nil, err
		}
	}
	return &object, nil
}
