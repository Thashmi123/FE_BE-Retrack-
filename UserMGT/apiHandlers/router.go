package apiHandlers

import (
	"UserMGT/api"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"strings"
)

func Router(app *fiber.App) {
	app.Use(cors.New())
	app.Use(logger.New())
	app.Use(recover.New())

	group := app.Group("/UserMGT/api")
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
			fiber.MethodOptions,
		}, ","),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: false,
	}))
	app.Static("/", "./docs/rapiDoc/build")
	DefaultMappings(defaultGroup)
	RouteMappings(group)
}

func RouteMappings(cg fiber.Router) {
	cg.Post("/Login", api.LoginUserApi)
	cg.Post("/Register", api.RegisterUserApi)
	cg.Post("/CreateUser", api.CreateUserApi)
	cg.Put("/UpdateUser", api.UpdateUserApi)
	cg.Delete("/DeleteUser", api.DeleteUserApi)
	cg.Get("/FindUser", api.FindUserApi)
	cg.Get("/FindallUser", api.FindallUserApi)
	cg.Post("/UploadUser", api.UploadUserApi)
	cg.Get("/DownloadUser", api.DownloadUserApi)

	cg.Get("/swagger", api.SwaggerHandler)

}

func DefaultMappings(cg fiber.Router) {
	cg.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(map[string]string{"message": "UserMGT-APP2081 service is up and running", "version": "1.0"})
	})
}
