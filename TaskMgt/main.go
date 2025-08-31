package main

import (
	"TaskMgt/apiHandlers"
	"TaskMgt/dbConfig"
	"TaskMgt/integrations"
	"errors"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"log"
	"net"
)

// @title          TaskMgt API Documentation
// @version        1.0
// @description    Welcome to the comprehensive API documentation for TaskMgt! Here, you'll find everything you need to know about using the application, from getting started to advanced features. Happy exploring!
// @contact.name   API Support
// @Security ApiKeyAuth
// @contact.url   https://evolza.io
// @contact.email  cgaas@evolza.io
// @license.name  Evolza
// @license.url   http://evolza.io
// @BasePath  /TaskMgt/api
func init() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Cannot load environment file")
	}
	integrations.SetEnvironmentVariables()
}

func main() {
	fmt.Println("Starting application")

	app := fiber.New(fiber.Config{
		AppName:   "TaskMgt",
		BodyLimit: 4000 * 1024,
	})

	// Connect To Database
	dbConfig.ConnectToMongoDB()

	//Remove Pre-Generated Outs
	dbConfig.RemoveGeneratedOuts()

	// Define the API routes
	apiHandlers.Router(app)

	// Start the server
	log.Fatal(app.Listen(":8888"))
}

func externalIP() (string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}
		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return "", err
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
			return ip.String(), nil
		}
	}
	return "", errors.New("are you connected to the network")
}
