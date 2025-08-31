package api

import (
	"TaskMgt/integrations"
	"TaskMgt/utils"

	"github.com/gofiber/fiber/v2"

	"TaskMgt/dao"

	"encoding/csv"
	"fmt"
	"io"

	"TaskMgt/dto"
	"encoding/json"
	"strconv"

	"github.com/google/uuid"
)

// @Summary      UploadTask
// @Description   This API performs the UPLOAD operation on Task. It allows you to  Task records.
// @Tags          Task
// @Accept       json
// @Produce      json
// @Param        data body dto. false "string collection"
// @Success      200  {array}   dto. "Status OK"
// @Success      202  {array}   dto. "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /UploadTask [UPLOAD]

func UploadTaskApi(c *fiber.Ctx) error {

	file, err := c.FormFile("file")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Could not parse form file")
	}

	src, err := file.Open()
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Could not open uploaded file")
	}
	defer src.Close()

	reader := csv.NewReader(src)

	header, _ := reader.Read()

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return utils.SendErrorResponse(c, fiber.StatusInternalServerError, "Error reading CSV record")
		}

		object := make(map[string]interface{})

		for i, value := range record {
			key := header[i]

			if value == "false" || value == "true" || value == "FALSE" || value == "TRUE" {
				boolValue, err := strconv.ParseBool(value)
				if err == nil {
					object[key] = boolValue
				} else {
					object[key] = value
				}
			} else {
				intValue, err := strconv.Atoi(value)
				if err == nil {
					object[key] = intValue
				} else {
					object[key] = value
				}
			}
		}

		objectJSON, err := json.Marshal(object)
		if err != nil {
			fmt.Println("Error marshalling object map:", err)
			return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
		}
		var TaskStruct dto.Task
		if err := json.Unmarshal(objectJSON, &TaskStruct); err != nil {
			fmt.Println("Error unmarshalling object JSON:", err)
			return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
		}

		TaskStruct.TaskId = uuid.New().String()

		err = dao.DB_CreateTask(&TaskStruct)
		if err != nil {
			return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
		}

		// Send email notification if email is provided
		if TaskStruct.AssignedToEmail != "" {
			emailService := integrations.NewEmailService()
			if emailErr := emailService.SendTaskCreatedEmail(TaskStruct.AssignedToEmail, TaskStruct.AssignedToName, TaskStruct.Title, TaskStruct.TaskId); emailErr != nil {
				// Log the error but don't fail the task creation
				utils.LogError("Failed to send task creation email during bulk upload", emailErr)
			}
		}
	}

	return utils.SendSuccessResponse(c)

}
