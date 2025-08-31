package utils

import (
	"github.com/gofiber/fiber/v2"
)

type Response struct {
	Operation string `json:"operation"`
	Error     string `json:"error,omitempty"`
}

// SendErrorResponse sends a response with an error message
func SendErrorResponse(c *fiber.Ctx, statusCode int, errorMessage string) error {
	response := Response{
		Operation: "Failed",
		Error:     errorMessage,
	}
	return c.Status(statusCode).JSON(response)
}

// SendSuccessResponse sends a response for a successful operation
func SendSuccessResponse(c *fiber.Ctx) error {
	response := Response{
		Operation: "Success",
		Error:     "",
	}
	return c.Status(fiber.StatusOK).JSON(response)
}
