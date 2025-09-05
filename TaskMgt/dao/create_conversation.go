package dao

import (
	"TaskMgt/dbConfig"
	"TaskMgt/dto"
	"context"
	"errors"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)



func EnsureChatIndexes(ctx context.Context) error {
	conv := dbConfig.DATABASE.Collection("Conversations")
	msgs := dbConfig.DATABASE.Collection("Messages")

	_, err := conv.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "usera", Value: 1},
			{Key: "userb", Value: 1},
		},
		Options: options.Index().SetUnique(true).SetName("uniq_user_pair"),
	})
	if err != nil {
		return err
	}

	_, err = conv.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "usera", Value: 1}},
	})
	if err != nil {
		return err
	}
	_, err = conv.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "userb", Value: 1}},
	})
	if err != nil {
		return err
	}

	_, err = msgs.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "conversationid", Value: 1},
			{Key: "_id", Value: -1}, // use ObjectID time for sort if you want
		},
		Options: options.Index().SetName("conv_id__id_desc"),
	})
	return err
}


func normalizePair(a, b string) (string, string) {
	if a == b {
		return a, b
	}
	s := []string{a, b}
	sort.Strings(s)
	return s[0], s[1]
}

func DB_FindConversationByUsers(ctx context.Context, user1, user2 string) (*dto.Conversation, error) {
	a, b := normalizePair(user1, user2)
	var conv dto.Conversation
	err := dbConfig.
		DATABASE.
		Collection("Conversations").
		FindOne(ctx, bson.M{"usera": a, "userb": b}).
		Decode(&conv)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	return &conv, err
}

func DB_CreateConversation(ctx context.Context, conv *dto.Conversation) error {
	_, err := dbConfig.
		DATABASE.
		Collection("Conversations").
		InsertOne(ctx, conv)
	return err
}


func DB_GetOrCreateConversation(ctx context.Context, user1, user2, newID string) (*dto.Conversation, error) {
	a, b := normalizePair(user1, user2)

	coll := dbConfig.DATABASE.Collection("Conversations")

	var existing dto.Conversation
	err := coll.FindOne(ctx, bson.M{"usera": a, "userb": b}).Decode(&existing)
	if err == nil {
		return &existing, nil
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}

	newConv := &dto.Conversation{
		ID:        newID,
		UserA:     a,
		UserB:     b,
		CreatedAt: time.Now().UTC(),
	}
	if _, err := coll.InsertOne(ctx, newConv); err != nil {
		// If a race inserted the same pair, fetch it
		if we, ok := err.(mongo.WriteException); ok {
			for _, e := range we.WriteErrors {
				if e.Code == 11000 { // duplicate key
					var conv dto.Conversation
					e2 := coll.FindOne(ctx, bson.M{"usera": a, "userb": b}).Decode(&conv)
					return &conv, e2
				}
			}
		}
		return nil, err
	}
	return newConv, nil
}

// Find by ID
func DB_FindConversationByID(ctx context.Context, id string) (*dto.Conversation, error) {
	var conv dto.Conversation
	err := dbConfig.
		DATABASE.
		Collection("Conversations").
		FindOne(ctx, bson.M{"id": id}).
		Decode(&conv)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	return &conv, err
}

// List conversations for a user (either side). Simple skip/limit paging.
func DB_ListConversationsForUser(ctx context.Context, userID string, skip, limit int64) ([]dto.Conversation, error) {
	coll := dbConfig.DATABASE.Collection("Conversations")

	filter := bson.M{
		"$or": []bson.M{
			{"usera": userID},
			{"userb": userID},
		},
	}

	cur, err := coll.Find(
		ctx,
		filter,
		// Newest first by createdAt (fallback to _id if you prefer)
		options.Find().
			SetSort(bson.D{{Key: "createdat", Value: -1}}).
			SetSkip(skip).
			SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []dto.Conversation
	for cur.Next(ctx) {
		var c dto.Conversation
		if err := cur.Decode(&c); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, cur.Err()
}

// ===== Message DAO =====

func DB_CreateMessage(ctx context.Context, m *dto.Message) error {
	_, err := dbConfig.
		DATABASE.
		Collection("Messages").
		InsertOne(ctx, m)
	return err
}

// List messages in a conversation (oldest first for chat display). Simple skip/limit paging.
func DB_ListMessagesByConversation(ctx context.Context, conversationID string, skip, limit int64) ([]dto.Message, error) {
	coll := dbConfig.DATABASE.Collection("Messages")

	cur, err := coll.Find(
		ctx,
		bson.M{"conversationid": conversationID},
		options.Find().
			SetSort(bson.D{{Key: "sentat", Value: 1}}).
			SetSkip(skip).
			SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []dto.Message
	for cur.Next(ctx) {
		var m dto.Message
		if err := cur.Decode(&m); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, cur.Err()
}

// List messages for a specific meeting (oldest first for chat display). Simple skip/limit paging.
func DB_ListMessagesByMeeting(ctx context.Context, meetingID string, skip, limit int64) ([]dto.Message, error) {
	coll := dbConfig.DATABASE.Collection("Messages")

	cur, err := coll.Find(
		ctx,
		bson.M{"meetingid": meetingID},
		options.Find().
			SetSort(bson.D{{Key: "sentat", Value: 1}}).
			SetSkip(skip).
			SetLimit(limit),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []dto.Message
	for cur.Next(ctx) {
		var m dto.Message
		if err := cur.Decode(&m); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, cur.Err()
}
