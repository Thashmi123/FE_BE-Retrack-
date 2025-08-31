package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      FindallAttendance 
// @Description   This API performs the GET operation on Attendance. It allows you to retrieve Attendance records.
// @Tags          Attendance
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Attendance "Status OK"
// @Success      202  {array}   dto.Attendance "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /FindallAttendance [GET]

    func FindallAttendanceApi(c *fiber.Ctx) error {





    
            page := c.Query("page", "1")
                size := c.Query("size", "10")
                searchTerm := c.Query("searchTerm", "")
                noPaginationStr := c.Query("noPagination", "")
                noPagination := noPaginationStr == "true"
            
        



    
  Count, Attendance ,err := dao.DB_FindallAttendance(page,size,searchTerm,noPagination)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }    


returnValue := map[string]interface{}{
                "Count":    Count,
                "Attendance": Attendance,
            }
    
        return c.Status(fiber.StatusAccepted).JSON(&returnValue)
}

