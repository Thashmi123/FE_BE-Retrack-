package integrations

import (
	"fmt"
	"log"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type EmailService struct {
	client    *sendgrid.Client
	fromEmail string
	fromName  string
	logoURL   string
}

func NewEmailService() *EmailService {
	apiKey := os.Getenv("SENDGRID_API_KEY")
	if apiKey == "" {
		log.Fatal("SENDGRID_API_KEY environment variable is required")
	}

	fromEmail := os.Getenv("FROM_EMAIL")
	if fromEmail == "" {
		fromEmail = "noreply@taskmgt.com"
	}

	fromName := os.Getenv("FROM_NAME")
	if fromName == "" {
		fromName = "TaskMgt System"
	}

	logo := os.Getenv("LOGO_URL")
	if logo == "" {
		log.Fatal("LOGO_URL environment variable is required")
	}

	return &EmailService{
		client:    sendgrid.NewSendClient(apiKey),
		fromEmail: fromEmail,
		fromName:  fromName,
		logoURL:   logo,
	}
}

func (es *EmailService) send(toEmail, toName, subject, plainText, htmlContent string) error {
	from := mail.NewEmail(es.fromName, es.fromEmail)
	to := mail.NewEmail(toName, toEmail)
	msg := mail.NewSingleEmail(from, subject, to, plainText, htmlContent)

	resp, err := es.client.Send(msg)
	if err != nil {
		return fmt.Errorf("SendGrid error: %v", err)
	}
	if resp.StatusCode >= 400 {
		return fmt.Errorf("SendGrid API error: status %d\n%s", resp.StatusCode, resp.Body)
	}

	log.Printf("✅ Email sent to %s | Subject: %s", toEmail, subject)
	return nil
}

func (es *EmailService) SendTaskCreatedEmail(toEmail, toName, taskTitle, taskId string) error {
	subject := fmt.Sprintf("🆕 New Task Assigned: %s", taskTitle)

	plain := fmt.Sprintf("Hello %s,\n\nYou've been assigned a task:\nTask ID: %s\nTitle: %s\n\nLogin to view your tasks.\n\nTaskMgt System",
		toName, taskId, taskTitle)

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>%s</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #ddd;">
    <div style="text-align: center;">
      <img src="%s" alt="TaskMgt Logo" style="height: 60px; margin-bottom: 20px;" />
    </div>
    <h2 style="text-align: center; color: #333;">🆕 New Task Assigned</h2>
    <p>Hello <strong>%s</strong>,</p>
    <p>You have been assigned a new task:</p>
    <table style="width: 100%%; background-color: #f9f9f9; padding: 12px; border-radius: 6px;">
      <tr><td><strong>Task ID:</strong></td><td>%s</td></tr>
      <tr><td><strong>Title:</strong></td><td>%s</td></tr>
    </table>
    <p style="margin-top: 20px;">Login to your dashboard to view and manage your tasks.</p>
    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">This is an automated email from TaskMgt System. Do not reply.</p>
  </div>
</body>
</html>`, subject, es.logoURL, toName, taskId, taskTitle)

	return es.send(toEmail, toName, subject, plain, html)
}
func (es *EmailService) SendTaskAssignConfirmation(assignerEmail, assignerName, assigneeName, taskTitle, taskId string) error {
	subject := fmt.Sprintf("📤 You Assigned a Task: %s", taskTitle)

	plain := fmt.Sprintf("Hello %s,\n\nYou assigned a task:\nTask ID: %s\nTitle: %s\nAssigned To: %s\n\nTaskMgt System",
		assignerName, taskId, taskTitle, assigneeName)

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>%s</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #ddd;">
    <div style="text-align: center;">
      <img src="%s" alt="TaskMgt Logo" style="height: 60px; margin-bottom: 20px;" />
    </div>
    <h2 style="text-align: center; color: #333;">📤 Task Assigned Successfully</h2>
    <p>Hello <strong>%s</strong>,</p>
    <p>You have successfully assigned a task:</p>
    <table style="width: 100%%; background-color: #f9f9f9; padding: 12px; border-radius: 6px;">
      <tr><td><strong>Task ID:</strong></td><td>%s</td></tr>
      <tr><td><strong>Title:</strong></td><td>%s</td></tr>
      <tr><td><strong>Assigned To:</strong></td><td>%s</td></tr>
    </table>
    <p style="margin-top: 20px;">Visit the system for full task details.</p>
    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">This is an automated email from TaskMgt System. Do not reply.</p>
  </div>
</body>
</html>`, subject, es.logoURL, assignerName, taskId, taskTitle, assigneeName)

	return es.send(assignerEmail, assignerName, subject, plain, html)
}
func (es *EmailService) SendTaskStatusUpdatedEmail(toEmail, toName, taskTitle, taskId, oldStatus, newStatus string) error {
	subject := fmt.Sprintf("🔄 Task Updated: %s (Now %s)", taskTitle, newStatus)

	plain := fmt.Sprintf("Hello %s,\n\nTask status changed:\nTask ID: %s\nTitle: %s\nOld Status: %s\nNew Status: %s\n\nTaskMgt System",
		toName, taskId, taskTitle, oldStatus, newStatus)

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>%s</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #ddd;">
    <div style="text-align: center;">
      <img src="%s" alt="TaskMgt Logo" style="height: 60px; margin-bottom: 20px;" />
    </div>
    <h2 style="text-align: center; color: #333;">🔄 Task Status Updated</h2>
    <p>Hello <strong>%s</strong>,</p>
    <p>The status of a task you're involved in has changed.</p>
    <table style="width: 100%%; background-color: #f9f9f9; padding: 12px; border-radius: 6px;">
      <tr><td><strong>Task ID:</strong></td><td>%s</td></tr>
      <tr><td><strong>Title:</strong></td><td>%s</td></tr>
      <tr><td><strong>Old Status:</strong></td><td>%s</td></tr>
      <tr><td><strong>New Status:</strong></td><td style="color: %s;"><strong>%s</strong></td></tr>
    </table>
    <p style="margin-top: 20px;">View your task history in the dashboard.</p>
    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">This is an automated email from TaskMgt System. Do not reply.</p>
  </div>
</body>
</html>`, subject, es.logoURL, toName, taskId, taskTitle, oldStatus, getStatusColor(newStatus), newStatus)

	return es.send(toEmail, toName, subject, plain, html)
}
func getStatusColor(status string) string {
	switch status {
	case "Completed":
		return "#28a745"
	case "In Progress":
		return "#007bff"
	case "Pending":
		return "#ffc107"
	case "Cancelled":
		return "#dc3545"
	default:
		return "#6c757d"
	}
}
