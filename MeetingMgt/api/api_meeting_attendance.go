package api

import (
	"MeetingMgt/dto"
	"MeetingMgt/utils"

	"github.com/gofiber/fiber/v2"
	"MeetingMgt/dao"
)

// @Summary      GetMeetingAttendance
// @Description  Get attendance summary and participant list for a specific meeting
// @Tags         Attendance
// @Accept       json
// @Produce      json
// @Param        meetingId query string true "Meeting ID"
// @Success      200  {object} dto.MeetingAttendanceSummary "Success"
// @Failure      400  {object} utils.Response "Bad Request"
// @Router       /GetMeetingAttendance [GET]
func GetMeetingAttendanceApi(c *fiber.Ctx) error {
	meetingId := c.Query("meetingId")
	if meetingId == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "Meeting ID is required")
	}

	// Get meeting details
	meeting, err := dao.DB_FindMeetingById(meetingId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusNotFound, "Meeting not found")
	}

	// Get attendance records for this meeting
	attendances, err := dao.DB_FindAttendanceByMeeting(meetingId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
	}

	// Calculate summary
	presentCount := 0
	absentCount := 0
	
	for _, attendance := range attendances {
		if attendance.Status == "present" {
			presentCount++
		} else {
			absentCount++
		}
	}

	summary := dto.MeetingAttendanceSummary{
		MeetingId:         meetingId,
		MeetingTitle:      meeting.Title,
		TotalParticipants: len(attendances),
		PresentCount:      presentCount,
		AbsentCount:       absentCount,
		Participants:      attendances,
	}

	return c.Status(fiber.StatusOK).JSON(summary)
}

// @Summary      GetUserAttendance
// @Description  Get attendance records for a specific user
// @Tags         Attendance
// @Accept       json
// @Produce      json
// @Param        userId query string true "User ID"
// @Success      200  {object} map[string]interface{} "Success"
// @Failure      400  {object} utils.Response "Bad Request"
// @Router       /GetUserAttendance [GET]
func GetUserAttendanceApi(c *fiber.Ctx) error {
	userId := c.Query("userId")
	if userId == "" {
		return utils.SendErrorResponse(c, fiber.StatusBadRequest, "User ID is required")
	}

	// Get attendance records for this user
	attendances, err := dao.DB_FindAttendanceByUser(userId)
	if err != nil {
		return utils.SendErrorResponse(c, fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(map[string]interface{}{
		"userId":      userId,
		"attendances": attendances,
		"count":       len(attendances),
	})
}
