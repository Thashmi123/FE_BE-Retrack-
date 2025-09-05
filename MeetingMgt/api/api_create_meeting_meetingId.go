package api

import (
  
"MeetingMgt/utils"
"github.com/gofiber/fiber/v2"

  "MeetingMgt/functions"
    
  "MeetingMgt/dto"
    "github.com/go-playground/validator/v10"
    
    "MeetingMgt/dao"
    
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

// @Summary      CreateMeeting 
// @Description   This API performs the POST operation on Meeting. It allows you to create Meeting records.
// @Tags          Meeting
// @Accept       json
// @Produce      json
// @Param        data body dto.Meeting false "string collection" 
// @Success      200  {array}   dto.Meeting "Status OK"
// @Success      202  {array}   dto.Meeting "Status Accepted"
// @Failure      404 "Not Found"
// @Router      /CreateMeeting [POST]

// Function to create meeting conversation in TaskMgt service
func createMeetingConversation(meetingID string) error {
	// Call TaskMgt service to create conversation
	url := "http://localhost:8888/TaskMgt/api/meetings/" + meetingID + "/conversation"
	
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	
	resp, err := client.Post(url, "application/json", nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		return fiber.NewError(resp.StatusCode, "Failed to create meeting conversation")
	}
	
	return nil
}

    func CreateMeetingApi(c *fiber.Ctx) error {







    
  
    inputObj := dto.Meeting{}


    if err := c.BodyParser(&inputObj); err != nil {
    		return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }
    
MeetingId, err := functions.IdGenerator("Meetings", "MeetingId", "MEE")
	    if err != nil {
		    return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
	    }
        inputObj.MeetingId = MeetingId
        if err := functions.UniqueCheck(inputObj, "Meetings", []string{ "MeetingId"}) ; err!=nil{
          return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
        }
    
    validate := validator.New()
    if validationErr := validate.Struct(&inputObj); validationErr != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, validationErr.Error())
    }
err = dao.DB_CreateMeeting(&inputObj)
    if err != nil {
        return utils.SendErrorResponse(c, fiber.StatusBadRequest, err.Error())
    }

    // Create conversation for the meeting
    if err := createMeetingConversation(inputObj.MeetingId); err != nil {
        // Log the error but don't fail the meeting creation
        // The meeting was created successfully, conversation creation is optional
        fmt.Printf("Warning: Failed to create conversation for meeting %s: %v\n", inputObj.MeetingId, err)
    }

        return utils.SendSuccessResponse(c)
        
    
}

