package api

import (
	"TaskMgt/dao"
	"TaskMgt/dto"
	"TaskMgt/functions"
	"TaskMgt/integrations"
	"TaskMgt/utils"

	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

// @Summary      CreateTask
// @Description  Creates a task and sends email notification
// @Tags         Task
// @Accept       json
// @Produce      json
// @Param        data body dto.Task true "Task payload"
// @Success      201  {object} map[string]interface{} "Task Created"
// @Failure      400  {object} map[string]interface{} "Bad Request"
// @Router       /CreateTask [POST]
func CreateTaskApi(c *fiber.Ctx) error {
	inputObj := dto.Task{}

	if err := c.BodyParser(&inputObj); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Invalid JSON: "+err.Error())
	}

	validate := validator.New()
	if validationErr := validate.Struct(&inputObj); validationErr != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
	}

	taskId, err := functions.IdGenerator("Tasks", "TaskId", "TAS")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to generate Task ID: "+err.Error())
	}
	inputObj.TaskId = taskId

	if err := functions.UniqueCheck(inputObj, "Tasks", []string{"TaskId"}); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Duplicate Task ID: "+err.Error())
	}

	if inputObj.DueDate.IsZero() {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "due_date must be provided in ISO 8601 format")
	}

	now := time.Now().UTC()
	inputObj.CreatedAt = now
	inputObj.UpdatedAt = now

	if err := dao.DB_CreateTask(&inputObj); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Failed to create task: "+err.Error())
	}

	if inputObj.AssignedToEmail != "" {
		emailService := integrations.NewEmailService()
		if emailErr := emailService.SendTaskCreatedEmail(
			inputObj.AssignedToEmail,
			inputObj.AssignedToName,
			inputObj.Title,
			inputObj.TaskId,
		); emailErr != nil {
			utils.LogError("Email Error (Assignee)", emailErr)
		}
	}

	if inputObj.AssignedByEmail != "" {
		emailService := integrations.NewEmailService()
		if emailErr := emailService.SendTaskAssignConfirmation(
			inputObj.AssignedByEmail,
			inputObj.AssignedByName,
			inputObj.AssignedToName,
			inputObj.Title,
			inputObj.TaskId,
		); emailErr != nil {
			utils.LogError("Failed to send confirmation to assigner", emailErr)
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Task created successfully",
		"task_id": inputObj.TaskId,
	})
}
