package api

import (
	"UserMGT/utils"
	"github.com/gofiber/fiber/v2"

	"UserMGT/dao"
)

// @Summary      DeleteUser
// @Description   This API performs the DELETE operation on User. It allows you to delete User records.
// @Tags          User
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.User "Status OK"
// @Success      202  {array}   dto.User "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /DeleteUser [DELETE]

func DeleteUserApi(c *fiber.Ctx) error {

	userId := c.Query("userId")

	err := dao.DB_DeleteUser(userId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	return utils.SendSuccessResponse(c)

}
