// Comprehensive test script for the new meeting authentication system
const axios = require("axios");

const FRONTEND_URL = "http://localhost:3000";
const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";

async function testMeetingAuthSystem() {
  console.log("🚀 Testing New Meeting Authentication System\n");

  // Test cases for different scenarios
  const testCases = [
    {
      name: "Backend Integrated - Valid Meeting",
      meetingId: "MEE-1",
      description: "Tests proper backend integration with existing meeting",
      expectedBehavior: "Should authenticate user and track attendance",
    },
    {
      name: "Backend Integrated - New Meeting",
      meetingId: "MEE-" + Date.now(),
      description: "Tests backend integration with non-existent meeting",
      expectedBehavior: "Should fallback to MVP local test meeting",
    },
    {
      name: "Backend Unavailable - MVP Fallback",
      meetingId: "TEST-" + Date.now(),
      description: "Tests MVP fallback when backend is down",
      expectedBehavior: "Should create local test meeting",
    },
    {
      name: "Invalid Format - Error Handling",
      meetingId: "INVALID",
      description: "Tests error handling for invalid meeting ID format",
      expectedBehavior: "Should show proper error message",
    },
  ];

  console.log("📋 Test Cases:");
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Meeting ID: ${testCase.meetingId}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   Expected: ${testCase.expectedBehavior}`);
    console.log(`   URL: ${FRONTEND_URL}/meeting/${testCase.meetingId}`);
  });

  console.log("\n🎯 How to Test:");
  console.log("1. Start your React app: cd Retrack && npm start");
  console.log("2. Optionally start backend: cd MeetingMgt && go run main.go");
  console.log("3. Open the URLs above in your browser");
  console.log("4. Observe the behavior and check console logs");

  console.log("\n✨ New Features:");
  console.log("- ✅ Backend-integrated authentication");
  console.log("- ✅ Proper attendance tracking");
  console.log("- ✅ MVP fallback when backend unavailable");
  console.log("- ✅ Visual indicators for auth status");
  console.log("- ✅ No sample attendance display");
  console.log("- ✅ Proper error handling");

  console.log("\n🔍 What to Look For:");
  console.log("- 'AUTHENTICATED' badge for backend-integrated meetings");
  console.log("- 'LOCAL TEST' badge for MVP fallback meetings");
  console.log("- Console logs showing authentication process");
  console.log("- Attendance tracking in backend (if available)");
  console.log("- Proper error messages for invalid inputs");

  console.log("\n📊 Backend Integration Benefits:");
  console.log("- Real attendance tracking");
  console.log("- User authentication");
  console.log("- Meeting validation");
  console.log("- Proper data persistence");
  console.log("- Analytics and reporting");

  console.log("\n🛡️ MVP Fallback Benefits:");
  console.log("- Works without backend");
  console.log("- Immediate testing capability");
  console.log("- No setup required");
  console.log("- Full meeting functionality");
  console.log("- Clear visual indicators");

  // Test backend availability
  console.log("\n🔧 Backend Status Check:");
  try {
    const healthResponse = await axios.get("http://localhost:8887/");
    console.log("✅ Backend is running - full integration available");

    // Try to create a test meeting
    try {
      const meetingData = {
        Title: "Auth System Test Meeting",
        Description: "Test meeting for authentication system",
        Date: new Date().toISOString().split("T")[0],
        StartTime: "10:00:00",
        EndTime: "11:00:00",
        Location: "Test Environment",
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
      const meetingId =
        response.data?.MeetingId || response.data?.data?.MeetingId;

      if (meetingId) {
        console.log(`✅ Test meeting created: ${meetingId}`);
        console.log(`   Test URL: ${FRONTEND_URL}/meeting/${meetingId}`);
      }
    } catch (error) {
      console.log("⚠️ Could not create test meeting:", error.message);
    }
  } catch (error) {
    console.log("❌ Backend is not running - MVP fallback will be used");
    console.log(
      "   To enable full integration: cd MeetingMgt && go run main.go"
    );
  }
}

testMeetingAuthSystem();
