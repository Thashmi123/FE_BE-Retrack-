package api

import (
	"TaskMgt/dao"
	"TaskMgt/dto"
	"TaskMgt/functions"
	"TaskMgt/utils"
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

/*
	POST /messages
	Body: { "senderId": "...", "receiverId": "...", "text": "hello" }
	Creates (or reuses) a 1-1 Conversation and inserts a Message.
*/

// @Summary      SendMessage
// @Description  Creates (or reuses) a 1-1 conversation and inserts a message
// @Tags         Chat
// @Accept       json
// @Produce      json
// @Param        data body object{senderId=string,receiverId=string,text=string} true "Message payload"
// @Success      201  {object} map[string]interface{} "Message Created"
// @Failure      400  {object} map[string]interface{} "Bad Request"
// @Failure      500  {object} map[string]interface{} "Server Error"
// @Router       /messages [POST]
func SendMessageApi(c *fiber.Ctx) error {
	type input struct {
		SenderID     string `json:"senderId" validate:"required"`
		ReceiverID   string `json:"receiverId" validate:"required,nefield=SenderID"`
		Text         string `json:"text" validate:"required"`
		MeetingID    string `json:"meetingId"`    // optional, for meeting-specific messages
		MeetingTitle string `json:"meetingTitle"` // optional, for display purposes
	}

	var in input
	if err := c.BodyParser(&in); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Invalid JSON: "+err.Error())
	}
	validate := validator.New()
	if err := validate.Struct(&in); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	ctx := context.Background()

	// Ensure unique/normalized conversation for the pair, generate a new ID if needed
	newConvID, err := functions.IdGenerator("Conversations", "ID", "CON")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to generate Conversation ID: "+err.Error())
	}
	conv, err := dao.DB_GetOrCreateConversation(ctx, in.SenderID, in.ReceiverID, newConvID)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to get/create conversation: "+err.Error())
	}

	// Create message
	newMsgID, err := functions.IdGenerator("Messages", "ID", "MSG")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to generate Message ID: "+err.Error())
	}

	msg := &dto.Message{
		ID:             newMsgID,
		ConversationID: conv.ID,
		SenderID:       in.SenderID,
		ReceiverID:     in.ReceiverID,
		Text:           in.Text,
		SentAt:         time.Now().UTC(),
		Status:         "sent",
		MeetingID:      in.MeetingID,
		MeetingTitle:   in.MeetingTitle,
	}

	if err := dao.DB_CreateMessage(ctx, msg); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to create message: "+err.Error())
	}

	// Broadcast message to SSE clients
	go broadcastMessageToSSEClients(msg)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":       "Message created",
		"conversation":  conv, // handy for UI to jump straight in
		"messageObject": msg,
	})
}

/*
	GET /meetings/:meetingId/messages?skip=0&limit=30
	List all messages for a specific meeting.
*/
func GetMeetingMessagesApi(c *fiber.Ctx) error {
	meetingID := c.Params("meetingId")
	if meetingID == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "meetingId parameter is required")
	}

	skip, _ := strconv.ParseInt(c.Query("skip", "0"), 10, 64)
	limit, _ := strconv.ParseInt(c.Query("limit", "30"), 10, 64)

	ctx := context.Background()
	messages, err := dao.DB_ListMessagesByMeeting(ctx, meetingID, skip, limit)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to fetch meeting messages: "+err.Error())
	}

	return c.JSON(fiber.Map{
		"message": "Meeting messages retrieved",
		"messages": messages,
		"meetingId": meetingID,
		"count": len(messages),
	})
}

/*
	POST /meetings/:meetingId/conversation
	Create a conversation for a meeting using meeting ID as a "user ID"
*/
func CreateMeetingConversationApi(c *fiber.Ctx) error {
	meetingID := c.Params("meetingId")
	if meetingID == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "meetingId parameter is required")
	}

	ctx := context.Background()

	// Create conversation between meeting ID (as user A) and USR-6 (meeting chat user as user B)
	newConvID, err := functions.IdGenerator("Conversations", "ID", "CON")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to generate Conversation ID: "+err.Error())
	}

	// Use meeting ID as one user and USR-6 as the meeting chat user
	conv, err := dao.DB_GetOrCreateConversation(ctx, meetingID, "USR-6", newConvID)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to create meeting conversation: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":      "Meeting conversation created",
		"conversation": conv,
		"meetingId":    meetingID,
	})
}

/*
	GET /users/:userId/conversations?skip=0&limit=20
	List all conversations where user is a participant.
*/

// @Summary      ListConversations
// @Description  Lists conversations for a user (paged)
// @Tags         Chat
// @Produce      json
// @Param        userId  path     string true  "User ID"
// @Param        skip    query    int    false "Skip (default 0)"
// @Param        limit   query    int    false "Limit (default 20)"
// @Success      200 {object} map[string]interface{} "Conversations"
// @Failure      400 {object} map[string]interface{} "Bad Request"
// @Failure      500 {object} map[string]interface{} "Server Error"
// @Router       /users/{userId}/conversations [get]
func ListConversationsForUserApi(c *fiber.Ctx) error {
	userID := c.Params("userId")
	if userID == "" {
		userID = c.Query("userId")
	}
	if userID == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "userId is required")
	}

	skipQ := c.Query("skip", "0")
	limitQ := c.Query("limit", "20")
	skip, err := strconv.ParseInt(skipQ, 10, 64)
	if err != nil || skip < 0 {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "skip must be a non-negative integer")
	}
	limit, err := strconv.ParseInt(limitQ, 10, 64)
	if err != nil || limit <= 0 || limit > 100 {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "limit must be 1..100")
	}

	ctx := context.Background()
	convs, err := dao.DB_ListConversationsForUser(ctx, userID, skip, limit)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to list conversations: "+err.Error())
	}

	return c.JSON(fiber.Map{
		"message":       "Conversations retrieved",
		"count":         len(convs),
		"conversations": convs,
	})
}

/*
	GET /conversations/:conversationId/messages?skip=0&limit=30
	List messages in a conversation (newest first). UI can reverse if needed.
*/

// @Summary      ListMessages
// @Description  Lists messages in a conversation (paged, newest first)
// @Tags         Chat
// @Produce      json
// @Param        conversationId path  string true  "Conversation ID"
// @Param        skip           query int    false "Skip (default 0)"
// @Param        limit          query int    false "Limit (default 30)"
// @Success      200 {object} map[string]interface{} "Messages"
// @Failure      400 {object} map[string]interface{} "Bad Request"
// @Failure      500 {object} map[string]interface{} "Server Error"
// @Router       /conversations/{conversationId}/messages [get]
func ListMessagesByConversationApi(c *fiber.Ctx) error {
	conversationID := c.Params("conversationId")
	if conversationID == "" {
		conversationID = c.Query("conversationId")
	}
	if conversationID == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "conversationId is required")
	}

	skipQ := c.Query("skip", "0")
	limitQ := c.Query("limit", "30")
	skip, err := strconv.ParseInt(skipQ, 10, 64)
	if err != nil || skip < 0 {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "skip must be a non-negative integer")
	}
	limit, err := strconv.ParseInt(limitQ, 10, 64)
	if err != nil || limit <= 0 || limit > 100 {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "limit must be 1..100")
	}

	ctx := context.Background()
	msgs, err := dao.DB_ListMessagesByConversation(ctx, conversationID, skip, limit)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to list messages: "+err.Error())
	}

	return c.JSON(fiber.Map{
		"message":  "Messages retrieved",
		"count":    len(msgs),
		"messages": msgs,
	})
}

/*
	POST /conversations/resolve
	Body: { "user1": "...", "user2": "..." }
	Gets existing conversation for a pair or creates one (returns it).
*/

// @Summary      ResolveConversation
// @Description  Get-or-create a 1-1 conversation for two users
// @Tags         Chat
// @Accept       json
// @Produce      json
// @Param        data body object{user1=string,user2=string} true "Pair payload"
// @Success      200  {object} map[string]interface{} "Conversation"
// @Failure      400  {object} map[string]interface{} "Bad Request"
// @Failure      500  {object} map[string]interface{} "Server Error"
// @Router       /conversations/resolve [POST]
func ResolveConversationApi(c *fiber.Ctx) error {
	type input struct {
		User1 string `json:"user1" validate:"required"`
		User2 string `json:"user2" validate:"required,nefield=User1"`
	}

	var in input
	if err := c.BodyParser(&in); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Invalid JSON: "+err.Error())
	}

	validate := validator.New()
	if err := validate.Struct(&in); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	newConvID, err := functions.IdGenerator("Conversations", "ID", "CON")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to generate Conversation ID: "+err.Error())
	}

	ctx := context.Background()
	conv, err := dao.DB_GetOrCreateConversation(ctx, in.User1, in.User2, newConvID)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to resolve conversation: "+err.Error())
	}

	// Make sure CreatedAt exists if new was created (DB_GetOrCreateConversation sets it)
	if conv.CreatedAt.IsZero() {
		conv.CreatedAt = time.Now().UTC()
	}

	return c.JSON(fiber.Map{
		"message":      "Conversation resolved",
		"conversation": conv,
	})
}

// Channel for broadcasting messages to SSE clients
var messageBroadcast = make(chan dto.Message, 100)

// SSE client manager
type SSEManager struct {
	clients map[string]chan dto.Message
	mutex   sync.RWMutex
}

var sseManager = &SSEManager{
	clients: make(map[string]chan dto.Message),
}

// Add client to SSE manager
func (m *SSEManager) AddClient(id string) chan dto.Message {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	
	clientChan := make(chan dto.Message, 10)
	m.clients[id] = clientChan
	return clientChan
}

// Remove client from SSE manager
func (m *SSEManager) RemoveClient(id string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	
	if clientChan, ok := m.clients[id]; ok {
		close(clientChan)
		delete(m.clients, id)
	}
}

// Broadcast message to all connected clients
func (m *SSEManager) Broadcast(message dto.Message) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	
	for _, clientChan := range m.clients {
		select {
		case clientChan <- message:
		default:
			// Channel is full, skip
		}
	}
}

// Start message broadcaster goroutine
func init() {
	go func() {
		for message := range messageBroadcast {
			sseManager.Broadcast(message)
		}
	}()
}

// Broadcast message to all SSE clients
func broadcastMessageToSSEClients(message *dto.Message) {
	// Send to broadcast channel
	select {
	case messageBroadcast <- *message:
	default:
		// Channel is full, log and continue
		log.Printf("Warning: SSE broadcast channel is full, dropping message")
	}
}

/*
	GET /sse/chat
	Server-Sent Events endpoint for real-time chat messages
*/

// @Summary      SSEChatStream
// @Description  Server-Sent Events endpoint for real-time chat messages
// @Tags         Chat
// @Produce      text/event-stream
// @Param        userId query string true "User ID to filter messages for"
// @Success      200  {string} string "SSE Stream"
// @Router       /sse/chat [get]
func SSEChatStream(c *fiber.Ctx) error {
	// Get user ID from query parameter
	userID := c.Query("userId")
	if userID == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "userId query parameter is required")
	}

	// Set SSE headers
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("Access-Control-Allow-Headers", "Cache-Control")
	
	// Generate unique client ID
	clientID := fmt.Sprintf("%s_%s", userID, uuid.New().String())
	
	// Add client to manager
	clientChan := sseManager.AddClient(clientID)
	defer sseManager.RemoveClient(clientID)
	
	// Send initial connection message
	connectionMsg := map[string]interface{}{
		"type":    "connected",
		"message": "Connected to chat stream",
		"userId":  userID,
	}
	connectionJSON, _ := json.Marshal(connectionMsg)
	c.Response().Write([]byte(fmt.Sprintf("data: %s\n\n", connectionJSON)))
	c.Response().Flush()
	
	// Send heartbeat every 30 seconds
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	// Client loop
	for {
		select {
		case message, ok := <-clientChan:
			if !ok {
				// Channel closed
				return nil
			}
			
			// Only send messages that are relevant to this user
			if message.SenderID != userID && message.ReceiverID != userID {
				continue
			}
			
			// Convert message to JSON
			messageJSON, err := json.Marshal(message)
			if err != nil {
				log.Printf("Error marshaling message for SSE: %v", err)
				continue
			}
			
			// Send SSE message
			_, err = c.Response().Write([]byte(fmt.Sprintf("data: %s\n\n", messageJSON)))
			if err != nil {
				log.Printf("Error sending SSE message: %v", err)
				return err
			}
			
			// Flush response
			c.Response().Flush()
			
		case <-ticker.C:
			// Send heartbeat
			heartbeat := map[string]interface{}{
				"type":    "heartbeat",
				"message": "ping",
				"time":    time.Now().UTC().Format(time.RFC3339),
			}
			heartbeatJSON, _ := json.Marshal(heartbeat)
			_, err := c.Response().Write([]byte(fmt.Sprintf("data: %s\n\n", heartbeatJSON)))
			if err != nil {
				log.Printf("Error sending heartbeat: %v", err)
				return err
			}
			c.Response().Flush()
			
		case <-c.Context().Done():
			// Client disconnected
			return nil
		}
	}
}
