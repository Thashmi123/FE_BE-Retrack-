package api

import (
	"UserMGT/dao"
	"UserMGT/dto"
	"UserMGT/utils"

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

	if err := c.BodyParser(&req); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Invalid request format")
	}

	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	user, err := dao.DB_FindUserByEmail(req.Email)
	if err != nil || user == nil || user.Deleted {
		return utils.SendErrorResponse(c, fiber.StatusUnauthorized, "Invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusUnauthorized, "Invalid credentials")
	}

	token, err := utils.GenerateJWT(user.UserId, user.Email, user.Role)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Token generation failed")
	}

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
