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

	// Generate UserId before validation
	user.UserId, _ = functions.IdGenerator("Users", "UserId", "USR")
	
	// Validate user data (excluding UserId since it's now generated)
	validate := validator.New()
	if err := validate.Struct(user); err != nil {
		// Check if the only error is the UserId field being required
		// Since we generate it, we can ignore this specific validation error
		if validationErrs, ok := err.(validator.ValidationErrors); ok {
			var filteredErrors []string
			for _, fieldErr := range validationErrs {
				// Skip UserId required validation error since we generate it
				if fieldErr.Field() != "UserId" || fieldErr.Tag() != "required" {
					filteredErrors = append(filteredErrors, fieldErr.Error())
				}
			}
			
			// If there are other validation errors, return them
			if len(filteredErrors) > 0 {
				return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
			}
		} else {
			// If it's not a validation error, return it
			return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
		}
	}

	exists, err := dao.DB_FindUserByEmail(user.Email)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Database error")
	}
	if exists != nil {
		return utils.SendErrorResponse(c, fiber.StatusConflict, "Email already in use")
	}

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
