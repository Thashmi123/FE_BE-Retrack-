package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      FindAttendance 
// @Description   This API performs the GET operation on Attendance. It allows you to retrieve Attendance records.
// @Tags          Attendance
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Attendance "Status OK"
// @Success      202  {array}   dto.Attendance "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /FindAttendance [GET]

    func FindAttendanceApi(c *fiber.Ctx) error {





    
        
            
        attendanceId := c.Query("attendanceId")
                    
                
                    
            



    
  returnValue, err := dao.DB_FindAttendancebyAttendanceId(attendanceId)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }



        return c.Status(fiber.StatusAccepted).JSON(&returnValue)
}

