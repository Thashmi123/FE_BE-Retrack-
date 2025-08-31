package api

import (
	"TaskMgt/utils"
	"github.com/gofiber/fiber/v2"

	"TaskMgt/dao"
)

// @Summary      FindallTask
// @Description   This API performs the GET operation on Task. It allows you to retrieve Task records.
// @Tags          Task
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Task "Status OK"
// @Success      202  {array}   dto.Task "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /FindallTask [GET]

func FindallTaskApi(c *fiber.Ctx) error {

	page := c.Query("page", "1")
	size := c.Query("size", "10")
	searchTerm := c.Query("searchTerm", "")
	noPaginationStr := c.Query("noPagination", "")
	noPagination := noPaginationStr == "true"

	Count, Task, err := dao.DB_FindallTask(page, size, searchTerm, noPagination)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	returnValue := map[string]interface{}{
		"Count": Count,
		"Task":  Task,
	}

	return c.Status(fiber.StatusAccepted).JSON(&returnValue)
}
