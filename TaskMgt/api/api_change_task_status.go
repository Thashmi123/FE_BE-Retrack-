package api

import (
	"TaskMgt/dao"
	"TaskMgt/integrations"
	"TaskMgt/utils"

	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// ChangeTaskStatusRequest represents the request body for changing task status
type ChangeTaskStatusRequest struct {
	TaskId    string `json:"task_id" validate:"required"`    // use snake_case for REST
	NewStatus string `json:"new_status" validate:"required"` // use snake_case for REST
}

// @Summary      ChangeTaskStatus
// @Description  Change task status and notify assignee + assigner
// @Tags         Task
// @Accept       json
// @Produce      json
// @Param        data body ChangeTaskStatusRequest true "Task status change request"
// @Success      200  {object}   utils.Response "OK"
// @Failure      400  {object}   utils.Response "Bad Request"
// @Failure      404  {object}   utils.Response "Not Found"
// @Router       /ChangeTaskStatus [PUT]
func ChangeTaskStatusApi(c *fiber.Ctx) error {
	var input ChangeTaskStatusRequest

	if err := c.BodyParser(&input); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	validate := validator.New()
	if err := validate.Struct(&input); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	currentTask, err := dao.DB_FindTaskbyTaskId(input.TaskId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusNotFound, "Task not found: "+err.Error())
	}

	oldStatus := currentTask.Status
	if oldStatus == input.NewStatus {
		return utils.SendSuccessResponse(c)
	}

	currentTask.Status = input.NewStatus
	currentTask.UpdatedAt = time.Now().UTC()

	if err := dao.DB_UpdateTask(currentTask); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to update task: "+err.Error())
	}

	emailService := integrations.NewEmailService()

	if currentTask.AssignedToEmail != "" {
		if emailErr := emailService.SendTaskStatusUpdatedEmail(
			currentTask.AssignedToEmail,
			currentTask.AssignedToName,
			currentTask.Title,
			currentTask.TaskId,
			oldStatus,
			input.NewStatus,
		); emailErr != nil {
			utils.LogError("Assignee notification failed", emailErr)
		}
	}

	if currentTask.AssignedByEmail != "" {
		if emailErr := emailService.SendTaskStatusUpdatedEmail(
			currentTask.AssignedByEmail,
			currentTask.AssignedByName,
			currentTask.Title,
			currentTask.TaskId,
			oldStatus,
			input.NewStatus,
		); emailErr != nil {
			utils.LogError("Assigner notification failed", emailErr)
		}
	}

	return utils.SendSuccessResponse(c)
}
