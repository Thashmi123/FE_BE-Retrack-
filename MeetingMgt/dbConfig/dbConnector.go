package dbConfig

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

func ConnectToMongoDB() {
	fmt.Println("Connecting to mongo cluster")

	// Create a context
	ctx := context.Background()

	// Connect to MongoDB Atlas
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(DATABASE_URL))
	if err != nil {
		log.Fatal(err)
	}

	//Ping database
    err = client.Ping(ctx, nil)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Successfully connected to mongo cluster")
	DATABASE = client.Database(DATABASE_NAME)
}
