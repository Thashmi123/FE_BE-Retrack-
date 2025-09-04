// package apiHandlers

// import (
// 	"TaskMgt/api"
// 	"strings"

// 	"github.com/gofiber/fiber/v2"
// 	"github.com/gofiber/fiber/v2/middleware/cors"
// 	"github.com/gofiber/fiber/v2/middleware/logger"
// 	"github.com/gofiber/fiber/v2/middleware/recover"
// )

// func Router(app *fiber.App) {
// 	app.Use(cors.New())
// 	app.Use(logger.New())
// 	app.Use(recover.New())

	

// 	group := app.Group("/TaskMgt/api")
// 	defaultGroup := app.Group("/")
// 	app.Use(cors.New(cors.Config{
// 		AllowOrigins: "*",
// 		AllowMethods: strings.Join([]string{
// 			fiber.MethodGet,
// 			fiber.MethodPost,
// 			fiber.MethodHead,
// 			fiber.MethodPut,
// 			fiber.MethodDelete,
// 			fiber.MethodPatch,
// 		}, ","),
// 		AllowHeaders: "Origin, Content-Type, Accept",
// 	}))
// 	app.Static("/", "./docs/rapiDoc/build")
// 	DefaultMappings(defaultGroup)
// 	RouteMappings(group)
// }

// func RouteMappings(cg fiber.Router) {
// 	cg.Post("/CreateTask", api.CreateTaskApi)
// 	cg.Put("/UpdateTask", api.UpdateTaskApi)
// 	cg.Put("/ChangeTaskStatus", api.ChangeTaskStatusApi)
// 	cg.Delete("/DeleteTask", api.DeleteTaskApi)
// 	cg.Get("/FindTask", api.FindTaskApi)
// 	cg.Get("/FindallTask", api.FindallTaskApi)
// 	cg.Post("/UploadTask", api.UploadTaskApi)
// 	cg.Get("/DownloadTask", api.DownloadTaskApi)

// 	cg.Get("/swagger", api.SwaggerHandler)

// }

// func DefaultMappings(cg fiber.Router) {
// 	cg.Get("/", func(c *fiber.Ctx) error {
// 		return c.JSON(map[string]string{"message": "TaskMgt-APP2080 service is up and running", "version": "1.0"})
// 	})
// }

package apiHandlers

import (
	"TaskMgt/api"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func Router(app *fiber.App) {
	// Middlewares
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
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))
	app.Use(logger.New())
	app.Use(recover.New())

	// Group routes
	group := app.Group("/TaskMgt/api")
	defaultGroup := app.Group("/")

	// Static files serving (e.g. API docs)
	app.Static("/", "./docs/rapiDoc/build")

	// Setup route mappings
	DefaultMappings(defaultGroup)
	RouteMappings(group)
}

func RouteMappings(cg fiber.Router) {
	cg.Post("/CreateTask", api.CreateTaskApi)
	cg.Put("/UpdateTask", api.UpdateTaskApi)
	cg.Put("/ChangeTaskStatus", api.ChangeTaskStatusApi)
	cg.Delete("/DeleteTask", api.DeleteTaskApi)
	cg.Get("/FindTask", api.FindTaskApi)
	cg.Get("/FindallTask", api.FindallTaskApi)
	cg.Post("/UploadTask", api.UploadTaskApi)
	cg.Get("/DownloadTask", api.DownloadTaskApi)
	// Chat APIs
	cg.Post("/messages", api.SendMessageApi)
	cg.Get("/users/:userId/conversations", api.ListConversationsForUserApi)
	cg.Get("/conversations/:conversationId/messages", api.ListMessagesByConversationApi)
	cg.Post("/conversations/resolve", api.ResolveConversationApi)
	
	// User APIs - Fixed routing
	cg.Get("/users", api.GetAllUsersApi)
	cg.Get("/users/search", api.SearchUsersApi)
	cg.Get("/users/:userId", api.GetUserByIdApi)
	
	cg.Get("/swagger", api.SwaggerHandler)
}

func DefaultMappings(cg fiber.Router) {
	cg.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(map[string]string{
			"message": "TaskMgt-APP2080 service is up and running",
			"version": "1.0",
		})
	})
}

