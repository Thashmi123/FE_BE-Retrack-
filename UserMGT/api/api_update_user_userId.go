package api

import (
	"UserMGT/utils"
	"github.com/gofiber/fiber/v2"

	"UserMGT/dto"
	"github.com/go-playground/validator/v10"

	"UserMGT/dao"
)

// @Summary      UpdateUser
// @Description   This API performs the PUT operation on User. It allows you to update User records.
// @Tags          User
// @Accept       json
// @Produce      json
// @Param        data body dto.User false "string collection"
// @Success      200  {array}   dto.User "Status OK"
// @Success      202  {array}   dto.User "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /UpdateUser [PUT]

func UpdateUserApi(c *fiber.Ctx) error {

	inputObj := dto.User{}

	if err := c.BodyParser(&inputObj); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	validate := validator.New()
	if validationErr := validate.Struct(&inputObj); validationErr != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
	}
	err := dao.DB_UpdateUser(&inputObj)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SendSuccessResponse(c)

}
