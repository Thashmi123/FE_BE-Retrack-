package api

import (
	"TaskMgt/dto"
	"TaskMgt/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Simple in-memory user store for demo purposes
// In a real application, this would be stored in a database
var users = []dto.User{
	{
		ID:        "user1",
		Name:      "John Doe",
		Email:     "john@example.com",
		Online:    true,
		LastSeen:  time.Now(),
		CreatedAt: time.Now().Add(-24 * time.Hour),
	},
	{
		ID:        "user2",
		Name:      "Jane Smith",
		Email:     "jane@example.com",
		Online:    false,
		LastSeen:  time.Now().Add(-2 * time.Hour),
		CreatedAt: time.Now().Add(-48 * time.Hour),
	},
	{
		ID:        "user3",
		Name:      "Mike Johnson",
		Email:     "mike@example.com",
		Online:    true,
		LastSeen:  time.Now(),
		CreatedAt: time.Now().Add(-72 * time.Hour),
	},
	{
		ID:        "user4",
		Name:      "Sarah Wilson",
		Email:     "sarah@example.com",
		Online:    false,
		LastSeen:  time.Now().Add(-1 * time.Hour),
		CreatedAt: time.Now().Add(-96 * time.Hour),
	},
	{
		ID:        "user5",
		Name:      "David Brown",
		Email:     "david@example.com",
		Online:    true,
		LastSeen:  time.Now(),
		CreatedAt: time.Now().Add(-120 * time.Hour),
	},
}

// @Summary      GetAllUsers
// @Description  Get all users (excluding the requesting user)
// @Tags         Users
// @Produce      json
// @Param        excludeUserId query string false "User ID to exclude from results"
// @Success      200 {object} map[string]interface{} "Users retrieved"
// @Failure      500 {object} map[string]interface{} "Server Error"
// @Router       /users [get]
func GetAllUsersApi(c *fiber.Ctx) error {
	excludeUserId := c.Query("excludeUserId", "")
	
	var filteredUsers []dto.User
	for _, user := range users {
		if user.ID != excludeUserId {
			filteredUsers = append(filteredUsers, user)
		}
	}

	return c.JSON(fiber.Map{
		"message": "Users retrieved successfully",
		"users":   filteredUsers,
		"count":   len(filteredUsers),
	})
}

// @Summary      GetUserById
// @Description  Get a specific user by ID
// @Tags         Users
// @Produce      json
// @Param        userId path string true "User ID"
// @Success      200 {object} map[string]interface{} "User retrieved"
// @Failure      404 {object} map[string]interface{} "User not found"
// @Router       /users/{userId} [get]
func GetUserByIdApi(c *fiber.Ctx) error {
	userId := c.Params("userId")
	if userId == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "userId is required")
	}

	for _, user := range users {
		if user.ID == userId {
			return c.JSON(fiber.Map{
				"message": "User retrieved successfully",
				"user":    user,
			})
		}
	}

	return utils.SendErrorResponse(c, fiber.StatusNotFound, "User not found")
}

// @Summary      SearchUsers
// @Description  Search users by name or email
// @Tags         Users
// @Produce      json
// @Param        q query string true "Search query"
// @Param        excludeUserId query string false "User ID to exclude from results"
// @Success      200 {object} map[string]interface{} "Users found"
// @Router       /users/search [get]
func SearchUsersApi(c *fiber.Ctx) error {
	query := c.Query("q", "")
	excludeUserId := c.Query("excludeUserId", "")
	
	if query == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Search query is required")
	}

	var matchedUsers []dto.User
	for _, user := range users {
		if user.ID != excludeUserId {
			// Simple case-insensitive search in name and email
			if contains(user.Name, query) || contains(user.Email, query) {
				matchedUsers = append(matchedUsers, user)
			}
		}
	}

	return c.JSON(fiber.Map{
		"message": "Search completed",
		"users":   matchedUsers,
		"count":   len(matchedUsers),
		"query":   query,
	})
}

// Helper function for case-insensitive string matching
func contains(str, substr string) bool {
	if len(substr) == 0 {
		return true
	}
	if len(str) == 0 {
		return false
	}
	
	// Simple case-insensitive check
	for i := 0; i <= len(str)-len(substr); i++ {
		match := true
		for j := 0; j < len(substr); j++ {
			if toLower(str[i+j]) != toLower(substr[j]) {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}

// Helper function to convert character to lowercase
func toLower(c byte) byte {
	if c >= 'A' && c <= 'Z' {
		return c + 32
	}
	return c
}