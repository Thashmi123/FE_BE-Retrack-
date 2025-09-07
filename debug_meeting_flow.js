// Comprehensive debugging script for meeting flow
const axios = require("axios");

const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";
const FRONTEND_URL = "http://localhost:3000";

async function debugMeetingFlow() {
  console.log("🔍 Debugging Meeting Flow...\n");

  // Step 1: Check if MeetingMgt service is running
  console.log("1️⃣ Checking MeetingMgt service...");
  try {
    const healthResponse = await axios.get("http://localhost:8887/");
    console.log("✅ MeetingMgt service is running");
    console.log("   Response:", healthResponse.data);
  } catch (error) {
    console.log("❌ MeetingMgt service is NOT running");
    console.log("   Error:", error.message);
    console.log("   💡 Start the service: cd MeetingMgt && go run main.go");
    return;
  }

  // Step 2: Check if meetings exist
  console.log("\n2️⃣ Checking existing meetings...");
  try {
    const meetingsResponse = await axios.get(`${API_BASE_URL}/FindallMeeting`);
    const meetings = meetingsResponse.data?.Meeting || [];

    if (meetings.length === 0) {
      console.log("❌ No meetings found in database");
      console.log(
        "   💡 Create a meeting first using the frontend or run: node create_test_meeting.js"
      );
      return;
    }

    console.log(`✅ Found ${meetings.length} meeting(s):`);
    meetings.forEach((meeting, index) => {
      console.log(`   ${index + 1}. ${meeting.MeetingId} - ${meeting.Title}`);
    });

    // Step 3: Test the first meeting
    const testMeeting = meetings[0];
    console.log(`\n3️⃣ Testing meeting: ${testMeeting.MeetingId}`);

    try {
      const meetingResponse = await axios.get(
        `${API_BASE_URL}/FindMeeting?meetingId=${testMeeting.MeetingId}`
      );
      console.log("✅ Meeting found via API");
      console.log("   Response:", meetingResponse.data);
    } catch (error) {
      console.log("❌ Error fetching meeting via API");
      console.log("   Error:", error.response?.data || error.message);
    }

    // Step 4: Test the frontend URL
    console.log(
      `\n4️⃣ Testing frontend URL: ${FRONTEND_URL}/meeting/${testMeeting.MeetingId}`
    );
    console.log("   💡 Open this URL in your browser to test the meeting room");

    // Step 5: Test attendance endpoints
    console.log("\n5️⃣ Testing attendance endpoints...");
    try {
      const attendanceResponse = await axios.get(
        `${API_BASE_URL}/GetMeetingAttendance?meetingId=${testMeeting.MeetingId}`
      );
      console.log("✅ Attendance endpoint working");
    } catch (error) {
      console.log(
        "❌ Attendance endpoint error:",
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.log("❌ Error fetching meetings");
    console.log("   Error:", error.response?.data || error.message);
  }

  // Step 6: Check React app
  console.log("\n6️⃣ Checking React app...");
  try {
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log("✅ React app is running");
  } catch (error) {
    console.log("❌ React app is NOT running");
    console.log("   Error:", error.message);
    console.log("   💡 Start the app: cd Retrack && npm start");
  }

  console.log("\n🎯 Summary:");
  console.log(
    "   - If all services are running, try opening a meeting URL directly"
  );
  console.log("   - Check browser console for any JavaScript errors");
  console.log(
    "   - Verify the meeting ID format (should be MEE-1, MEE-2, etc.)"
  );
}

debugMeetingFlow();
