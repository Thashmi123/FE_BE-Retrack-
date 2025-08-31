package dao

import (
	"UserMGT/dbConfig"
	"UserMGT/dto"
	"context"
)

func DB_CreateUser(object *dto.User) error {

	_, err := dbConfig.DATABASE.Collection("Users").InsertOne(context.Background(), object)
	if err != nil {
		return err
	}
	return nil
}
