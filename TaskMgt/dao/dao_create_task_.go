package dao

import (
	"TaskMgt/dbConfig"
	"TaskMgt/dto"
	"context"
)

func DB_CreateTask(object *dto.Task) error {

	_, err := dbConfig.DATABASE.Collection("Tasks").InsertOne(context.Background(), object)
	if err != nil {
		return err
	}
	return nil
}
