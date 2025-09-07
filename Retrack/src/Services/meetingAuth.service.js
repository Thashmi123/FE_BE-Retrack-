import axios from "axios";
import { useUser } from "../contexts/UserContext";

const API_BASE_URL = "http://localhost:8887/MeetingMgt/api";

class MeetingAuthService {
  constructor() {
    this.currentAttendance = null;
    this.isLoggedIn = false;
  }

  // Authenticate user and join meeting with proper backend integration
  async authenticateAndJoinMeeting(meetingId, userData = null) {
    try {
      console.log("🔐 Authenticating user for meeting:", meetingId);

      // Get user data from context or localStorage
      const user = userData || this.getCurrentUser();

      if (!user) {
        throw new Error("User not authenticated. Please log in first.");
      }

      // First, verify the meeting exists
      const meetingResponse = await axios.get(
        `${API_BASE_URL}/FindMeeting?meetingId=${meetingId}`
      );

      const meeting = this.extractMeetingData(meetingResponse.data);
      if (!meeting) {
        throw new Error("Meeting not found");
      }

      // Create attendance data for backend
      const attendanceData = {
        MeetingId: meetingId,
        UserId: user.id || user.userId || "anonymous",
        UserName: user.name || user.userName || "Unknown User",
        UserEmail: user.email || user.userEmail || "",
      };

      // Join meeting through backend API
      const joinResponse = await axios.post(
        `${API_BASE_URL}/JoinMeeting`,
        attendanceData
      );

      this.currentAttendance = joinResponse.data.attendance;
      this.isLoggedIn = true;

      console.log("✅ Successfully authenticated and joined meeting");
      console.log("   Attendance ID:", this.currentAttendance.AttendanceId);
      console.log("   Join Time:", this.currentAttendance.JoinTime);

      return {
        success: true,
        meeting: meeting,
        attendance: this.currentAttendance,
        message: "Successfully joined meeting",
      };
    } catch (error) {
      console.error("❌ Authentication failed:", error);

      // Return error details for fallback handling
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  }

  // Leave meeting and update attendance
  async leaveMeeting() {
    if (!this.currentAttendance) {
      console.log("No active attendance to update");
      return;
    }

    try {
      const leaveData = {
        AttendanceId: this.currentAttendance.AttendanceId,
        LeaveTime: new Date().toTimeString().split(" ")[0],
        Status: "left",
      };

      await axios.post(`${API_BASE_URL}/LeaveMeeting`, leaveData);

      console.log("✅ Successfully left meeting");
      this.currentAttendance = null;
      this.isLoggedIn = false;
    } catch (error) {
      console.error("❌ Error leaving meeting:", error);
    }
  }

  // Get meeting attendance summary
  async getMeetingAttendance(meetingId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/GetMeetingAttendance?meetingId=${meetingId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting meeting attendance:", error);
      return null;
    }
  }

  // Get current user from context or localStorage
  getCurrentUser() {
    // Try to get from localStorage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.warn("Invalid user data in localStorage");
      }
    }

    // Fallback to anonymous user
    return {
      id: "anonymous-" + Date.now(),
      name: "Anonymous User",
      email: "anonymous@localhost.com",
    };
  }

  // Extract meeting data from API response
  extractMeetingData(responseData) {
    if (!responseData) return null;

    // Handle different response formats
    if (
      responseData.data &&
      typeof responseData.data === "object" &&
      !Array.isArray(responseData.data)
    ) {
      return responseData.data;
    } else if (
      Array.isArray(responseData.data) &&
      responseData.data.length > 0
    ) {
      return responseData.data[0];
    } else if (responseData.MeetingId) {
      return responseData;
    }

    return null;
  }

  // Check if user is currently in a meeting
  isUserInMeeting() {
    return this.isLoggedIn && this.currentAttendance !== null;
  }

  // Get current attendance info
  getCurrentAttendance() {
    return this.currentAttendance;
  }

  // Reset authentication state
  reset() {
    this.currentAttendance = null;
    this.isLoggedIn = false;
  }
}

export default new MeetingAuthService();
