package api

import (
	"UserMGT/utils"
	"github.com/gofiber/fiber/v2"

	"UserMGT/dao"
)

// @Summary      FindUser
// @Description   This API performs the GET operation on User. It allows you to retrieve User records.
// @Tags          User
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.User "Status OK"
// @Success      202  {array}   dto.User "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /FindUser [GET]

func FindUserApi(c *fiber.Ctx) error {

	userId := c.Query("userId")

	returnValue, err := dao.DB_FindUserbyUserId(userId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return c.Status(fiber.StatusAccepted).JSON(&returnValue)
}
