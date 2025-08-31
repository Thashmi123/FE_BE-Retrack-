package dbConfig

import (
	mongo "go.mongodb.org/mongo-driver/mongo"
)

var DATABASE *mongo.Database

const DATABASE_URL = "mongodb+srv://chamitheos:chamith@retrack.jknxt3n.mongodb.net/?retryWrites=true&w=majority&appName=retrack"

const DATABASE_NAME = "UserMGT"
