package api

import (
	"io/ioutil"

	"github.com/gofiber/fiber/v2"
)

func SwaggerHandler(c *fiber.Ctx) error {
	swaggerJSON, err := ioutil.ReadFile("docs/openapi.json")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to load Swagger JSON file")
	}


	return c.Status(fiber.StatusOK).Send(swaggerJSON)
}