package api

import (
	"TaskMgt/utils"
	"github.com/gofiber/fiber/v2"

	"TaskMgt/dto"
	"github.com/go-playground/validator/v10"

	"TaskMgt/dao"
)

// @Summary      UpdateTask
// @Description   This API performs the PUT operation on Task. It allows you to update Task records.
// @Tags          Task
// @Accept       json
// @Produce      json
// @Param        data body dto.Task false "string collection"
// @Success      200  {array}   dto.Task "Status OK"
// @Success      202  {array}   dto.Task "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /UpdateTask [PUT]

func UpdateTaskApi(c *fiber.Ctx) error {

	inputObj := dto.Task{}

	if err := c.BodyParser(&inputObj); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	validate := validator.New()
	if validationErr := validate.Struct(&inputObj); validationErr != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
	}
	err := dao.DB_UpdateTask(&inputObj)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SendSuccessResponse(c)

}
