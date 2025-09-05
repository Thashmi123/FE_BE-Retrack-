package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Test SSE connection and message sending
func main() {
	baseURL := "http://localhost:8080"
	
	// Test 1: Send a message
	fmt.Println("Testing message sending...")
	messageData := map[string]string{
		"senderId":   "user1",
		"receiverId": "user2",
		"text":       "Hello from test!",
	}
	
	jsonData, _ := json.Marshal(messageData)
	resp, err := http.Post(baseURL+"/TaskMgt/api/messages", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error sending message: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Message sent. Response: %s\n", string(body))
	
	// Test 2: Connect to SSE
	fmt.Println("\nTesting SSE connection...")
	client := &http.Client{Timeout: 0}
	req, _ := http.NewRequest("GET", baseURL+"/sse/chat?userId=user1", nil)
	
	resp, err = client.Do(req)
	if err != nil {
		fmt.Printf("Error connecting to SSE: %v\n", err)
		return
	}
	defer resp.Body.Close()
	
	fmt.Println("Connected to SSE stream. Listening for messages...")
	
	// Read SSE stream
	buffer := make([]byte, 1024)
	for {
		n, err := resp.Body.Read(buffer)
		if err != nil {
			if err == io.EOF {
				fmt.Println("SSE stream ended")
				break
			}
			fmt.Printf("Error reading SSE: %v\n", err)
			break
		}
		
		data := string(buffer[:n])
		fmt.Printf("Received SSE data: %s\n", data)
		
		// Check if it's a message
		if len(data) > 6 && data[:6] == "data: " {
			var message map[string]interface{}
			if err := json.Unmarshal([]byte(data[6:]), &message); err == nil {
				if msgType, ok := message["type"].(string); ok {
					if msgType == "connected" {
						fmt.Println("✅ SSE connection established")
					} else if msgType == "heartbeat" {
						fmt.Println("💓 Heartbeat received")
					} else if message["id"] != nil {
						fmt.Printf("📨 New message received: %+v\n", message)
					}
				}
			}
		}
		
		time.Sleep(100 * time.Millisecond)
	}
}
