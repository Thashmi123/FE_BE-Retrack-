package api

import (
	"TaskMgt/utils"
	"github.com/gofiber/fiber/v2"

	"TaskMgt/dao"
)

// @Summary      FindTask
// @Description   This API performs the GET operation on Task. It allows you to retrieve Task records.
// @Tags          Task
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Task "Status OK"
// @Success      202  {array}   dto.Task "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /FindTask [GET]

func FindTaskApi(c *fiber.Ctx) error {

	taskId := c.Query("taskId")

	returnValue, err := dao.DB_FindTaskbyTaskId(taskId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return c.Status(fiber.StatusAccepted).JSON(&returnValue)
}
