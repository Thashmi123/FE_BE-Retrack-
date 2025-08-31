package functions

import (
	"TaskMgt/dbConfig"
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func IdGenerator(collectionName, idField, Fword string) (string, error) {
	result, err := GetNextID(collectionName, Fword)
	if err != nil {
		return "", err
	}
	return result, nil

}
func GetNextID(collectionName, Fword string) (string, error) {
	var idManager struct {
		Seq        int       `bson:"seq"`
		Prefix     string    `bson:"prefix"`
		Type       string    `bson:"type"`
		CreatedAt  time.Time `bson:"created_at"`
		ModifiedAt time.Time `bson:"modified_at"`
	}

	currentTime := time.Now()

	update := bson.M{
		"$inc": bson.M{"seq": 1},
		"$set": bson.M{"modified_at": currentTime},
		"$setOnInsert": bson.M{
			"prefix":     Fword,
			"type":       collectionName,
			"created_at": currentTime,
		},
	}

	filter := bson.M{"_id": fmt.Sprintf("%s-", Fword)}

	err := dbConfig.DATABASE.Collection("id_manager").FindOneAndUpdate(
		context.Background(),
		filter,
		update,
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	).Decode(&idManager)

	if err != nil {
		return "", err
	}

	NewID := fmt.Sprintf("%s-%d", Fword, idManager.Seq)

	return NewID, nil
}
