// Simple script to create a test meeting for testing the meeting join flow
const axios = require("axios");

const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";

async function createTestMeeting() {
  console.log("🔧 Creating test meeting...\n");

  try {
    // Check if MeetingMgt service is running
    console.log("1️⃣ Checking MeetingMgt service...");
    const healthResponse = await axios.get("http://localhost:8887/");
    console.log("✅ MeetingMgt service is running");

    // Create a test meeting
    console.log("\n2️⃣ Creating test meeting...");
    const meetingData = {
      Title: "Test Meeting - Join Flow",
      Description:
        "This is a test meeting to verify the join flow works properly",
      Date: new Date().toISOString().split("T")[0], // Today's date
      StartTime: "10:00:00",
      EndTime: "11:00:00",
      Location: "Virtual Meeting Room",
      MeetingType: "video",
      Status: "scheduled",
      CreatedBy: "test-user",
      UserName: "Test User",
      UserEmail: "test@example.com",
    };

    const response = await axios.post(
      `${API_BASE_URL}/CreateMeeting`,
      meetingData
    );
    console.log("✅ Test meeting created successfully");
    console.log(
      "   Meeting ID:",
      response.data?.MeetingId || response.data?.data?.MeetingId
    );
    console.log("   Meeting Title:", meetingData.Title);

    // Get the meeting ID for the URL
    const meetingId =
      response.data?.MeetingId || response.data?.data?.MeetingId;
    if (meetingId) {
      console.log(`\n3️⃣ Test the meeting join flow:`);
      console.log(
        `   Frontend URL: http://localhost:3000/meeting/${meetingId}`
      );
      console.log(
        `   API URL: ${API_BASE_URL}/FindMeeting?meetingId=${meetingId}`
      );
    }

    console.log(
      "\n🎯 Meeting created successfully! You can now test the join flow."
    );
  } catch (error) {
    console.log("❌ Error creating test meeting");
    console.log("   Error:", error.response?.data || error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the MeetingMgt service is running:");
      console.log("   cd MeetingMgt && go run main.go");
    }
  }
}

createTestMeeting();
