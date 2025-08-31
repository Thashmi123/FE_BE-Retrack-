package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  "MeetingMgt/dto"
    "github.com/go-playground/validator/v10"
    
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      UpdateAttendance 
// @Description   This API performs the PUT operation on Attendance. It allows you to update Attendance records.
// @Tags          Attendance
// @Accept       json
// @Produce      json
// @Param        data body dto.Attendance false "string collection" 
// @Success      200  {array}   dto.Attendance "Status OK"
// @Success      202  {array}   dto.Attendance "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /UpdateAttendance [PUT]

    func UpdateAttendanceApi(c *fiber.Ctx) error {







    
  
    inputObj := dto.Attendance{}


    if err := c.BodyParser(&inputObj); err != nil {
    		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }
    

    validate := validator.New()
    if validationErr := validate.Struct(&inputObj); validationErr != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
    }
err := dao.DB_UpdateAttendance(&inputObj)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }



        return utils.SendSuccessResponse(c)
        
    
}

