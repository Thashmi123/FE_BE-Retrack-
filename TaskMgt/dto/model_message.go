package dto

import "time"

type Conversation struct {
	ID        string    `json:"id"` 
	UserA     string    `json:"userA"` 
	UserB     string    `json:"userB"` 
	CreatedAt time.Time `json:"createdAt"`
}

type Message struct {
	ID             string    `json:"id"`                // uuid
	ConversationID string    `json:"conversationId"`    // fk -> Conversation
	SenderID       string    `json:"senderId"`          // fk -> User
	ReceiverID     string    `json:"receiverId"`        // fk -> User
	Text           string    `json:"text"`              // message body
	SentAt         time.Time `json:"sentAt"`            // timestamp when message was sent
	Status         string    `json:"status"`            // message status (sent, delivered, read)
}