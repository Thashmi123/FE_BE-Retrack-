package api

import (
	"UserMGT/utils"
	"github.com/gofiber/fiber/v2"

	"UserMGT/dao"
)

// @Summary      FindallUser
// @Description   This API performs the GET operation on User. It allows you to retrieve User records.
// @Tags          User
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.User "Status OK"
// @Success      202  {array}   dto.User "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /FindallUser [GET]

func FindallUserApi(c *fiber.Ctx) error {

	page := c.Query("page", "1")
	size := c.Query("size", "10")
	searchTerm := c.Query("searchTerm", "")
	noPaginationStr := c.Query("noPagination", "")
	noPagination := noPaginationStr == "true"

	Count, User, err := dao.DB_FindallUser(page, size, searchTerm, noPagination)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	returnValue := map[string]interface{}{
		"Count": Count,
		"User":  User,
	}

	return c.Status(fiber.StatusAccepted).JSON(&returnValue)
}
