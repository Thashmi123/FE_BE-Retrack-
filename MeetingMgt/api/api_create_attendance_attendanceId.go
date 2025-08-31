package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  "MeetingMgt/functions"
    
  "MeetingMgt/dto"
    "github.com/go-playground/validator/v10"
    
    "MeetingMgt/dao"
    
  

  
  
  
)

// @Summary      CreateAttendance 
// @Description   This API performs the POST operation on Attendance. It allows you to create Attendance records.
// @Tags          Attendance
// @Accept       json
// @Produce      json
// @Param        data body dto.Attendance false "string collection" 
// @Success      200  {array}   dto.Attendance "Status OK"
// @Success      202  {array}   dto.Attendance "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /CreateAttendance [POST]

    func CreateAttendanceApi(c *fiber.Ctx) error {







    
  
    inputObj := dto.Attendance{}


    if err := c.BodyParser(&inputObj); err != nil {
    		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }
    
AttendanceId, err := functions.IdGenerator("Attendances", "AttendanceId", "ATT")
	    if err != nil {
		    return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	    }
        inputObj.AttendanceId = AttendanceId
        if err := functions.UniqueCheck(inputObj, "Attendances", []string{ "AttendanceId"}) ; err!=nil{
          return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
        }
    
    validate := validator.New()
    if validationErr := validate.Struct(&inputObj); validationErr != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
    }
err = dao.DB_CreateAttendance(&inputObj)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }



        return utils.SendSuccessResponse(c)
        
    
}

