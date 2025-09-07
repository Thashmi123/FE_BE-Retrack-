// Script to find existing meetings
const axios = require("axios");

const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";

async function findExistingMeetings() {
  try {
    console.log("Fetching existing meetings...");

    const response = await axios.get(`${API_BASE_URL}/FindallMeeting`);
    console.log("✅ Successfully connected to MeetingMgt service");

    const meetings = response.data?.Meeting || [];

    if (meetings.length === 0) {
      console.log("❌ No meetings found in database");
      console.log("💡 You need to create a meeting first");
      console.log("   - Go to Meeting Management page in the frontend");
      console.log("   - Or run: node create_test_meeting.js");
    } else {
      console.log(`✅ Found ${meetings.length} meeting(s):`);
      meetings.forEach((meeting, index) => {
        console.log(`\n${index + 1}. Meeting ID: ${meeting.MeetingId}`);
        console.log(`   Title: ${meeting.Title}`);
        console.log(`   Date: ${meeting.Date}`);
        console.log(`   Time: ${meeting.StartTime} - ${meeting.EndTime}`);
        console.log(
          `   URL: http://localhost:3000/meeting/${meeting.MeetingId}`
        );
      });

      // Test the first meeting
      if (meetings.length > 0) {
        const firstMeeting = meetings[0];
        console.log(`\n🧪 Testing meeting: ${firstMeeting.MeetingId}`);

        try {
          const testResponse = await axios.get(
            `${API_BASE_URL}/FindMeeting?meetingId=${firstMeeting.MeetingId}`
          );
          console.log("✅ Meeting found via API:", testResponse.data);
        } catch (testError) {
          console.log("❌ Error testing meeting:", testError.response?.data);
        }
      }
    }
  } catch (error) {
    console.error(
      "❌ Error fetching meetings:",
      error.response?.data || error.message
    );

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure MeetingMgt service is running on port 8887");
      console.log("Run: cd MeetingMgt && go run main.go");
    }
  }
}

findExistingMeetings();
