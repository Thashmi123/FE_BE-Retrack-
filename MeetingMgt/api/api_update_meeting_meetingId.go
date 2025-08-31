package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  "MeetingMgt/dto"
    "github.com/go-playground/validator/v10"
    
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      UpdateMeeting 
// @Description   This API performs the PUT operation on Meeting. It allows you to update Meeting records.
// @Tags          Meeting
// @Accept       json
// @Produce      json
// @Param        data body dto.Meeting false "string collection" 
// @Success      200  {array}   dto.Meeting "Status OK"
// @Success      202  {array}   dto.Meeting "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /UpdateMeeting [PUT]

    func UpdateMeetingApi(c *fiber.Ctx) error {







    
  
    inputObj := dto.Meeting{}


    if err := c.BodyParser(&inputObj); err != nil {
    		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }
    

    validate := validator.New()
    if validationErr := validate.Struct(&inputObj); validationErr != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
    }
err := dao.DB_UpdateMeeting(&inputObj)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }



        return utils.SendSuccessResponse(c)
        
    
}

