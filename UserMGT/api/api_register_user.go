package api

import (
	"UserMGT/dao"
	"UserMGT/dto"
	"UserMGT/functions"
	"UserMGT/utils"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUserApi(c *fiber.Ctx) error {
	var user dto.User
	if err := c.BodyParser(&user); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Invalid input")
	}

	validate := validator.New()
	if err := validate.Struct(user); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	exists, err := dao.DB_FindUserByEmail(user.Email)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Password hashing failed")
	}
	if exists != nil {
		return utils.SendErrorResponse(c, fiber.StatusConflict, "Email already in use")
	}

	user.UserId, _ = functions.IdGenerator("Users", "UserId", "USR")
	user.Role = "user"
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.IsVerified = false

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Password hashing failed")
	}
	user.Password = string(hashedPassword)

	if err := dao.DB_CreateUser(&user); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "User creation failed")
	}

	return utils.SendSuccessResponse(c)
}
