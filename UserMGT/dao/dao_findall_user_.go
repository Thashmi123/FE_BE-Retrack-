package dao

import (
	"UserMGT/dbConfig"
	"UserMGT/dto"
	"context"
	"errors"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func DB_FindallUser(page, size, searchTerm string, noPagination bool, excludeUserId string) (int64, *[]dto.User, error) {
	var skip int64 = 0
	var limit int64 = 0

	if !noPagination {
		pageInt, err := strconv.Atoi(page)
		if err != nil || pageInt < 1 {
			return 0, nil, errors.New("invalid page number")
		}
		sizeInt, err := strconv.Atoi(size)
		if err != nil || sizeInt < 1 {
			return 0, nil, errors.New("invalid page size")
		}
		skip = int64((pageInt - 1) * sizeInt)
		limit = int64(sizeInt)
	}

	filter := bson.M{"deleted": false}
	
	// Exclude a specific user if excludeUserId is provided
	if excludeUserId != "" {
		filter["userid"] = bson.M{"$ne": excludeUserId}
	}

	if searchTerm != "" {
		searchConditions := []bson.M{
			{"userid": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"firstname": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"lastname": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"email": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"profileimage": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"coverimage": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"country": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"username": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"password": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"gender": bson.M{"$regex": searchTerm, "$options": "i"}},
			{"phonenumber": bson.M{"$regex": searchTerm, "$options": "i"}},
		}
		filter["$or"] = searchConditions
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{"$match": filter},
		{"$facet": bson.M{
			"metadata": []bson.M{{"$count": "total"}},
			"data": func() []bson.M {
				stages := []bson.M{}

				if !noPagination {
					stages = append(stages, bson.M{"$skip": skip})
					stages = append(stages, bson.M{"$limit": limit})
				}

				return stages
			}(),
		}},
	}

	cursor, err := dbConfig.DATABASE.Collection("Users").Aggregate(ctx, pipeline)
	if err != nil {
		return 0, nil, err
	}
	defer cursor.Close(ctx)

	var results struct {
		Metadata []struct {
			Total int32 `bson:"total"`
		} `bson:"metadata"`
		Data []dto.User `bson:"data"`
	}

	if cursor.Next(ctx) {
		if err := cursor.Decode(&results); err != nil {
			return 0, nil, err
		}
	}

	var objects []dto.User
	if len(results.Data) > 0 {
		objects = results.Data
	} else {
		objects = []dto.User{}
	}

	var count int64 = 0
	if len(results.Metadata) > 0 {
		count = int64(results.Metadata[0].Total)
	}

	return count, &objects, nil
}
