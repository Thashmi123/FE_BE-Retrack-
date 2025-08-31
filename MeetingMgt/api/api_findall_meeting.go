package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      FindallMeeting 
// @Description   This API performs the GET operation on Meeting. It allows you to retrieve Meeting records.
// @Tags          Meeting
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Meeting "Status OK"
// @Success      202  {array}   dto.Meeting "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /FindallMeeting [GET]

    func FindallMeetingApi(c *fiber.Ctx) error {





    
            page := c.Query("page", "1")
                size := c.Query("size", "10")
                searchTerm := c.Query("searchTerm", "")
                noPaginationStr := c.Query("noPagination", "")
                noPagination := noPaginationStr == "true"
            
        



    
  Count, Meeting ,err := dao.DB_FindallMeeting(page,size,searchTerm,noPagination)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }    


returnValue := map[string]interface{}{
                "Count":    Count,
                "Meeting": Meeting,
            }
    
        return c.Status(fiber.StatusAccepted).JSON(&returnValue)
}

