package api

import (
	"TaskMgt/utils"
	"github.com/gofiber/fiber/v2"

	"TaskMgt/dao"
)

// @Summary      DeleteTask
// @Description   This API performs the DELETE operation on Task. It allows you to delete Task records.
// @Tags          Task
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Task "Status OK"
// @Success      202  {array}   dto.Task "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /DeleteTask [DELETE]

func DeleteTaskApi(c *fiber.Ctx) error {

	taskId := c.Query("taskId")

	err := dao.DB_DeleteTask(taskId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SendSuccessResponse(c)

}
