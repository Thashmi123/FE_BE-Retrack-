package api

import (
	"UserMGT/dao"
	"UserMGT/dto"
	"UserMGT/utils"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// @Summary      Login
// @Description  Authenticate user and return JWT token.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        data body LoginRequest false "Login credentials"
// @Success      200  {object} map[string]interface{} "JWT + User Info"
// @Failure      400  {object} utils.Response "Bad Request"
// @Failure      401  {object} utils.Response "Unauthorized"
// @Router       /login [POST]
func LoginUserApi(c *fiber.Ctx) error {
	var req dto.LoginRequest

	// Log the incoming request for debugging
	fmt.Printf("Login API called with body: %s\n", string(c.Body()))

	if err := c.BodyParser(&req); err != nil {
		fmt.Printf("Body parsing error: %v\n", err)
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Invalid request format")
	}

	fmt.Printf("Parsed login request - Email: %s\n", req.Email)

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		fmt.Printf("Validation error: %v\n", err)
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	user, err := dao.DB_FindUserByEmail(req.Email)
	if err != nil {
		fmt.Printf("Database error finding user: %v\n", err)
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Database error")
	}
	
	if user == nil {
		fmt.Printf("User not found for email: %s\n", req.Email)
		return utils.SendErrorResponse(c, fiber.StatusUnauthorized, "Invalid credentials")
	}
	
	if user.Deleted {
		fmt.Printf("User account is deleted for email: %s\n", req.Email)
		return utils.SendErrorResponse(c, fiber.StatusUnauthorized, "Invalid credentials")
	}

	fmt.Printf("User found - UserId: %s, Email: %s\n", user.UserId, user.Email)

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		fmt.Printf("Password comparison failed for user: %s\n", user.Email)
		return utils.SendErrorResponse(c, fiber.StatusUnauthorized, "Invalid credentials")
	}

	token, err := utils.GenerateJWT(user.UserId, user.Email, user.Role)
	if err != nil {
		fmt.Printf("JWT generation failed: %v\n", err)
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Token generation failed")
	}

	fmt.Printf("Login successful for user: %s, token generated\n", user.Email)

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"UserId":       user.UserId,
			"FirstName":    user.FirstName,
			"LastName":     user.LastName,
			"Email":        user.Email,
			"Username":     user.Username,
			"Role":         user.Role,
		},
	})
}
