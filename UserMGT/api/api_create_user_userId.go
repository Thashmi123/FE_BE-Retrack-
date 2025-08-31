package api

import (
	"UserMGT/utils"
	"github.com/gofiber/fiber/v2"

	"UserMGT/functions"

	"UserMGT/dto"
	"github.com/go-playground/validator/v10"

	"UserMGT/dao"
)

// @Summary      CreateUser
// @Description   This API performs the POST operation on User. It allows you to create User records.
// @Tags          User
// @Accept       json
// @Produce      json
// @Param        data body dto.User false "string collection"
// @Success      200  {array}   dto.User "Status OK"
// @Success      202  {array}   dto.User "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /CreateUser [POST]

func CreateUserApi(c *fiber.Ctx) error {

	inputObj := dto.User{}

	if err := c.BodyParser(&inputObj); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	UserId, err := functions.IdGenerator("Users", "UserId", "USE")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}
	inputObj.UserId = UserId
	if err := functions.UniqueCheck(inputObj, "Users", []string{"UserId"}); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	validate := validator.New()
	if validationErr := validate.Struct(&inputObj); validationErr != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
	}
	err = dao.DB_CreateUser(&inputObj)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SendSuccessResponse(c)

}
