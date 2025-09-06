// Test script to verify attendance endpoints are working
const axios = require("axios");

const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";

async function testEndpoints() {
  console.log("Testing MeetingMgt attendance endpoints...");

  try {
    // Test 1: Check if service is running
    console.log("\n1. Testing service health...");
    const healthResponse = await axios.get("http://localhost:8887/");
    console.log("✅ Service is running:", healthResponse.data);

    // Test 2: Test existing endpoint
    console.log("\n2. Testing existing FindallMeeting endpoint...");
    const meetingsResponse = await axios.get(`${API_BASE_URL}/FindallMeeting`);
    console.log("✅ FindallMeeting works:", meetingsResponse.status);

    // Test 3: Test new GetMeetingAttendance endpoint
    console.log("\n3. Testing GetMeetingAttendance endpoint...");
    try {
      const attendanceResponse = await axios.get(
        `${API_BASE_URL}/GetMeetingAttendance?meetingId=test123`
      );
      console.log("✅ GetMeetingAttendance works:", attendanceResponse.status);
    } catch (error) {
      console.log(
        "❌ GetMeetingAttendance failed:",
        error.response?.status,
        error.response?.statusText
      );
      console.log("Error details:", error.response?.data);
    }

    // Test 4: Test new JoinMeeting endpoint
    console.log("\n4. Testing JoinMeeting endpoint...");
    try {
      const joinResponse = await axios.post(`${API_BASE_URL}/JoinMeeting`, {
        MeetingId: "test123",
        UserId: "testuser",
        UserName: "Test User",
        UserEmail: "test@example.com",
      });
      console.log("✅ JoinMeeting works:", joinResponse.status);
    } catch (error) {
      console.log(
        "❌ JoinMeeting failed:",
        error.response?.status,
        error.response?.statusText
      );
      console.log("Error details:", error.response?.data);
    }
  } catch (error) {
    console.log("❌ Service connection failed:", error.message);
    console.log("Make sure MeetingMgt service is running on port 8887");
  }
}

testEndpoints();
