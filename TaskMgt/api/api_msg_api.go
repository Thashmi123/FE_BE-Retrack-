package api

import (
	"TaskMgt/dao"
	"TaskMgt/dto"
	"TaskMgt/functions"
	"TaskMgt/utils"
	"context"
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
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
		SenderID   string `json:"senderId" validate:"required"`
		ReceiverID string `json:"receiverId" validate:"required,nefield=SenderID"`
		Text       string `json:"text" validate:"required"`
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
	}

	if err := dao.DB_CreateMessage(ctx, msg); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to create message: "+err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":       "Message created",
		"conversation":  conv, // handy for UI to jump straight in
		"messageObject": msg,
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
