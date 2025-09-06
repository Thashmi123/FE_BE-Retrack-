package apiHandlers

import (
	"MeetingMgt/api"
	"strings"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func Router(app *fiber.App) {
	app.Use(cors.New())
	app.Use(logger.New())
	app.Use(recover.New())

	group := app.Group("/MeetingMgt/api")
	defaultGroup := app.Group("/")
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: strings.Join([]string{
			fiber.MethodGet,
			fiber.MethodPost,
			fiber.MethodHead,
			fiber.MethodPut,
			fiber.MethodDelete,
			fiber.MethodPatch,
		}, ","),
		AllowHeaders: "Origin, Content-Type, Accept",
	}))
	app.Static("/", "./docs/rapiDoc/build")
	DefaultMappings(defaultGroup)
	RouteMappings(group)
}

func RouteMappings(cg fiber.Router) {
cg.Post("/CreateMeeting", api.CreateMeetingApi)
cg.Put("/UpdateMeeting", api.UpdateMeetingApi)
cg.Delete("/DeleteMeeting", api.DeleteMeetingApi)
cg.Get("/FindMeeting", api.FindMeetingApi)
cg.Get("/FindallMeeting", api.FindallMeetingApi)
cg.Post("/UploadMeeting", api.UploadMeetingApi)
cg.Get("/DownloadMeeting", api.DownloadMeetingApi)
cg.Post("/CreateAttendance", api.CreateAttendanceApi)
cg.Put("/UpdateAttendance", api.UpdateAttendanceApi)
cg.Delete("/DeleteAttendance", api.DeleteAttendanceApi)
cg.Get("/FindAttendance", api.FindAttendanceApi)
cg.Get("/FindallAttendance", api.FindallAttendanceApi)
cg.Post("/UploadAttendance", api.UploadAttendanceApi)
cg.Get("/DownloadAttendance", api.DownloadAttendanceApi)

// New attendance tracking endpoints
cg.Post("/JoinMeeting", api.JoinMeetingApi)
cg.Post("/LeaveMeeting", api.LeaveMeetingApi)
cg.Get("/GetMeetingAttendance", api.GetMeetingAttendanceApi)
cg.Get("/GetUserAttendance", api.GetUserAttendanceApi)

cg.Get("/swagger", api.SwaggerHandler)

}

func DefaultMappings(cg fiber.Router) {
	cg.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(map[string]string{"message": "MeetingMgt-APP2082 service is up and running", "version": "1.0"})
	})
}