package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      DeleteMeeting 
// @Description   This API performs the DELETE operation on Meeting. It allows you to delete Meeting records.
// @Tags          Meeting
// @Accept       json
// @Produce      json
// @Param        objectId query []string false "string collection"  collectionFormat(multi)
// @Success      200  {array}   dto.Meeting "Status OK"
// @Success      202  {array}   dto.Meeting "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /DeleteMeeting [DELETE]

    func DeleteMeetingApi(c *fiber.Ctx) error {





    
        
            
        meetingId := c.Query("meetingId")
                    
                
                    
            



    
  err := dao.DB_DeleteMeeting(meetingId)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }



        return utils.SendSuccessResponse(c)
        
    
}

