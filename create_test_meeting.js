// Script to create a test meeting
const axios = require("axios");

const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";

async function createTestMeeting() {
  try {
    console.log("Creating test meeting...");

    const meetingData = {
      Title: "Test Meeting for MEE-4",
      Description:
        "This is a test meeting created to verify the meeting system",
      Date: new Date().toISOString().split("T")[0], // Today's date
      StartTime: "14:00:00",
      EndTime: "15:00:00",
      Location: "Virtual Room",
      Participants: "Test User",
    };

    const response = await axios.post(
      `${API_BASE_URL}/CreateMeeting`,
      meetingData
    );
    console.log("✅ Meeting created successfully!");
    console.log("Response:", response.data);

    // Now test getting all meetings
    console.log("\nFetching all meetings...");
    const meetingsResponse = await axios.get(`${API_BASE_URL}/FindallMeeting`);
    console.log("Available meetings:", meetingsResponse.data);
  } catch (error) {
    console.error(
      "❌ Error creating meeting:",
      error.response?.data || error.message
    );

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure MeetingMgt service is running on port 8887");
      console.log("Run: cd MeetingMgt && go run main.go");
    }
  }
}

createTestMeeting();
