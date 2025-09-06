package api

import (
	"MeetingMgt/dto"
	"MeetingMgt/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"MeetingMgt/dao"
)

// @Summary      LeaveMeeting
// @Description  Track when a user leaves a meeting and calculate duration
// @Tags         Attendance
// @Accept       json
// @Produce      json
// @Param        data body dto.Attendance false "Leave meeting data"
// @Success      200  {object} map[string]interface{} "Success"
// @Failure      400  {object} utils.Response "Bad Request"
// @Router       /LeaveMeeting [POST]
func LeaveMeetingApi(c *fiber.Ctx) error {
	var request struct {
		MeetingId string `json:"MeetingId" validate:"required"`
		UserId    string `json:"UserId" validate:"required"`
		Date      string `json:"Date" validate:"required"`
	}

	if err := c.BodyParser(&request); err != nil {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	}

	// Find existing attendance record
	attendance, err := dao.DB_FindAttendanceByMeetingAndUser(request.MeetingId, request.UserId, request.Date)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusNotFound, "Attendance record not found")
	}

	// Set leave time and calculate duration
	now := time.Now()
	attendance.LeaveTime = now.Format("15:04:05")
	attendance.UpdatedAt = now

	// Calculate duration if join time exists
	if attendance.JoinTime != "" {
		joinTime, err := time.Parse("15:04:05", attendance.JoinTime)
		if err == nil {
			leaveTime, err := time.Parse("15:04:05", attendance.LeaveTime)
			if err == nil {
				duration := leaveTime.Sub(joinTime)
				attendance.Duration = int(duration.Minutes())
			}
		}
	}

	// Update attendance record
	err = dao.DB_UpdateAttendance(attendance)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccessResponse(c, map[string]interface{}{
		"message": "Successfully left meeting",
		"attendance": attendance,
	})
}
