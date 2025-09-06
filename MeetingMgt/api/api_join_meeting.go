package api

import (
	"MeetingMgt/dto"
	"MeetingMgt/functions"
	"MeetingMgt/utils"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"MeetingMgt/dao"
)

// @Summary      JoinMeeting
// @Description  Automatically track when a user joins a meeting
// @Tags         Attendance
// @Accept       json
// @Produce      json
// @Param        data body dto.Attendance false "Join meeting data"
// @Success      200  {object} map[string]interface{} "Success"
// @Failure      400  {object} utils.Response "Bad Request"
// @Router       /JoinMeeting [POST]
func JoinMeetingApi(c *fiber.Ctx) error {
	var attendance dto.Attendance

	if err := c.BodyParser(&attendance); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	// Generate AttendanceId
	attendanceId, err := functions.IdGenerator("Attendances", "AttendanceId", "ATT")
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}
	attendance.AttendanceId = attendanceId

	// Set current time
	now := time.Now()
	attendance.CreatedAt = now
	attendance.UpdatedAt = now
	attendance.Date = now.Format("2006-01-02")
	attendance.JoinTime = now.Format("15:04:05")
	attendance.Status = "present"
	attendance.Deleted = false

	// Validate required fields
	validate := validator.New()
	if validationErr := validate.Struct(&attendance); validationErr != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
	}

	// Check if user already has attendance record for this meeting today
	existingAttendance, err := dao.DB_FindAttendanceByMeetingAndUser(attendance.MeetingId, attendance.UserId, attendance.Date)
	if err == nil && existingAttendance != nil {
		// Update existing record with new join time
		existingAttendance.JoinTime = attendance.JoinTime
		existingAttendance.Status = "present"
		existingAttendance.UpdatedAt = now
		err = dao.DB_UpdateAttendance(existingAttendance)
		if err != nil {
			return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
		}
	return c.Status(fiber.StatusOK).JSON(map[string]interface{}{
		"operation": "Success",
		"message": "Attendance updated successfully",
		"attendance": existingAttendance,
	})
	}

	// Create new attendance record
	err = dao.DB_CreateAttendance(&attendance)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(map[string]interface{}{
		"operation": "Success",
		"message": "Successfully joined meeting",
		"attendance": attendance,
	})
}
