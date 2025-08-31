package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      DeleteAttendance 
// @Description   This API performs the DELETE operation on Attendance. It allows you to delete Attendance records.
// @Tags          Attendance
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Attendance "Status OK"
// @Success      202  {array}   dto.Attendance "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /DeleteAttendance [DELETE]

    func DeleteAttendanceApi(c *fiber.Ctx) error {





    
        
            
        attendanceId := c.Query("attendanceId")
                    
                
                    
            



    
  err := dao.DB_DeleteAttendance(attendanceId)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }



        return utils.SendSuccessResponse(c)
        
    
}

