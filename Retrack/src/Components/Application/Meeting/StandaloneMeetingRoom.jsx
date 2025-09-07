import React, { useState, useEffect, useRef } from "react";
import { Container, Alert, Spinner, Button } from "reactstrap";
import { ArrowLeft, Video, Users } from "react-feather";
import { useParams } from "react-router-dom";
import WebRTCService from "../../../Services/webrtc.service";
import MediaPermissions from "./MediaPermissions";
import VideoGrid from "./VideoGrid";
import MeetingControls from "./MeetingControls";
import MeetingChat from "./MeetingChat";
import MeetingNotifications from "./MeetingNotifications";
import { useMessage } from "../../../contexts/MessageContext";
import { useUser } from "../../../contexts/UserContext";
import MeetingService from "../../../Services/meeting.service";
import MeetingAuthService from "../../../Services/meetingAuth.service";

const StandaloneMeetingRoom = () => {
  // Get meeting ID from URL params
  const { meetingId } = useParams();
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Meeting state
  const [meetingState, setMeetingState] = useState({
    isConnected: false,
    isConnecting: false,
    hasPermissions: false,
    localStream: null,
    participants: [],
    isAudioEnabled: true,
    isVideoEnabled: true,
    isMuted: false,
    isScreenSharing: false,
    error: null,
  });

  const [uiState, setUiState] = useState({
    showPermissionsModal: false,
    showChat: false,
    showParticipants: false,
    showSettings: false,
    isChatMinimized: false,
  });

  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);

  // Contexts
  const { user } = useUser();
  const { setCurrentMessages } = useMessage();

  // Load meeting data
  useEffect(() => {
    console.log("StandaloneMeetingRoom mounted with meetingId:", meetingId);
    if (meetingId) {
      loadMeetingData();
    } else {
      setError("No meeting ID found in URL");
      setLoading(false);
    }
  }, [meetingId]);

  const loadMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!meetingId) {
        setError("No meeting ID provided. Please check the URL.");
        return;
      }

      console.log("🔍 Authenticating and loading meeting with ID:", meetingId);

      // Use the new authentication service
      const authResult = await MeetingAuthService.authenticateAndJoinMeeting(
        meetingId,
        user
      );

      if (authResult.success) {
        console.log("✅ Successfully authenticated and joined meeting");
        setMeetingData(authResult.meeting);
        initializeMeeting(authResult.meeting);
      } else {
        // Check if it's a 404 (meeting not found) or other error
        if (authResult.status === 404) {
          console.log("⚠️ Meeting not found, trying MVP fallback");
          createLocalTestMeeting();
        } else if (authResult.status === 400) {
          setError("Invalid meeting ID format. Please check the meeting ID.");
        } else if (
          authResult.error?.includes("ECONNREFUSED") ||
          authResult.error?.includes("Network Error")
        ) {
          console.log("⚠️ Backend unavailable, using MVP fallback");
          createLocalTestMeeting();
        } else {
          console.log("⚠️ Authentication failed, using MVP fallback");
          createLocalTestMeeting();
        }
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      console.log("⚠️ Using MVP fallback due to unexpected error");
      createLocalTestMeeting();
    } finally {
      setLoading(false);
    }
  };

  // MVP Fallback function
  const createLocalTestMeeting = () => {
    console.log("🔄 Creating local test meeting for MVP");
    const localMeetingData = {
      MeetingId: meetingId,
      Title: `Local Test Meeting (${meetingId})`,
      Description: "This is a local test meeting created for MVP testing",
      Date: new Date().toISOString().split("T")[0],
      StartTime: new Date().toTimeString().split(" ")[0],
      EndTime: new Date(Date.now() + 60 * 60 * 1000)
        .toTimeString()
        .split(" ")[0], // 1 hour later
      Location: "Local Test Environment",
      MeetingType: "video",
      Status: "active",
      CreatedBy: "local-test",
      UserName: "Test User",
      UserEmail: "test@localhost.com",
    };

    setMeetingData(localMeetingData);
    initializeMeeting(localMeetingData);
  };

  const initializeMeeting = (meeting) => {
    try {
      setMeetingState((prev) => ({ ...prev, isConnecting: true, error: null }));

      // Initialize WebRTC service without socket for now (standalone mode)
      WebRTCService.initialize(null, meetingId, true);
      setupWebRTCHandlers();

      // Simplified initialization - go directly to permissions
      setTimeout(() => {
        setMeetingState((prev) => ({
          ...prev,
          isConnecting: false,
          isConnected: true,
        }));

        // Show permissions modal immediately
        setUiState((prev) => ({ ...prev, showPermissionsModal: true }));
      }, 500);
    } catch (error) {
      console.error("Error initializing meeting:", error);
      setMeetingState((prev) => ({
        ...prev,
        error: "Failed to initialize meeting. Please try again.",
        isConnecting: false,
      }));
    }
  };

  const setupWebRTCHandlers = () => {
    WebRTCService.setOnUserJoined((userId) => {
      addNotification(
        "user-joined",
        `User ${userId} joined the meeting`,
        userId
      );
      setMeetingState((prev) => ({
        ...prev,
        participants: [
          ...prev.participants,
          {
            id: userId,
            name: `User ${userId}`,
            stream: null,
            audioEnabled: true,
            videoEnabled: true,
            isMuted: false,
            isConnecting: true,
          },
        ],
      }));
    });

    WebRTCService.setOnUserLeft((userId) => {
      addNotification("user-left", `User ${userId} left the meeting`, userId);
      setMeetingState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.id !== userId),
      }));
    });

    WebRTCService.setOnRemoteStream((userId, stream) => {
      setMeetingState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === userId ? { ...p, stream, isConnecting: false } : p
        ),
      }));
    });

    WebRTCService.setOnError((error) => {
      console.error("WebRTC Error:", error);
      addNotification("connection-lost", "Connection error occurred");
      setMeetingState((prev) => ({ ...prev, error: error.message }));
    });

    WebRTCService.setOnConnectionStateChange((userId, state) => {
      if (state === "connected") {
        setMeetingState((prev) => ({
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === userId ? { ...p, isConnecting: false } : p
          ),
        }));
      }
    });

    WebRTCService.setOnUserMuted((userId, type, muted) => {
      const action = muted ? "muted" : "unmuted";
      const mediaType = type === "audio" ? "microphone" : "camera";
      addNotification(
        `${type}-${muted ? "muted" : "unmuted"}`,
        `${action} their ${mediaType}`,
        userId
      );
    });
  };

  const handlePermissionsGranted = async (stream) => {
    try {
      // Initialize WebRTC service with the stream
      WebRTCService.localStream = stream;
      WebRTCService.audioTrack = stream.getAudioTracks()[0];
      WebRTCService.videoTrack = stream.getVideoTracks()[0];

      // Update meeting state
      setMeetingState((prev) => ({
        ...prev,
        hasPermissions: true,
        localStream: stream,
        isConnecting: false,
        isConnected: true,
        isAudioEnabled: !!WebRTCService.audioTrack,
        isVideoEnabled: !!WebRTCService.videoTrack,
        isMuted: false,
      }));

      // Close permissions modal
      setUiState((prev) => ({ ...prev, showPermissionsModal: false }));

      // Show success notification
      addNotification("success", "Successfully joined the meeting");

      // Join the room
      WebRTCService.joinRoom(user?.id || "anonymous");
    } catch (error) {
      console.error("Error after permissions granted:", error);
      setMeetingState((prev) => ({
        ...prev,
        error: "Failed to start meeting after permissions granted",
        isConnecting: false,
      }));
    }
  };

  const handlePermissionsDenied = () => {
    setMeetingState((prev) => ({
      ...prev,
      error: "Camera and microphone access required to join meeting",
      isConnecting: false,
    }));
    setUiState((prev) => ({ ...prev, showPermissionsModal: false }));
  };

  const handleToggleAudio = () => {
    if (WebRTCService.audioTrack) {
      const newState = WebRTCService.toggleAudio();
      setMeetingState((prev) => ({
        ...prev,
        isMuted: !newState,
        isAudioEnabled: newState,
      }));
      addNotification(
        "audio-toggle",
        newState ? "Microphone unmuted" : "Microphone muted"
      );
    }
  };

  const handleToggleVideo = () => {
    if (WebRTCService.videoTrack) {
      const newState = WebRTCService.toggleVideo();
      setMeetingState((prev) => ({
        ...prev,
        isVideoEnabled: newState,
      }));
      addNotification(
        "video-toggle",
        newState ? "Camera turned on" : "Camera turned off"
      );
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      if (!meetingState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        setMeetingState((prev) => ({ ...prev, isScreenSharing: true }));
        addNotification("screen-share", "Started screen sharing");

        screenStream.getVideoTracks()[0].onended = () => {
          setMeetingState((prev) => ({ ...prev, isScreenSharing: false }));
          addNotification("screen-share", "Stopped screen sharing");
        };
      } else {
        setMeetingState((prev) => ({ ...prev, isScreenSharing: false }));
        addNotification("screen-share", "Stopped screen sharing");
      }
    } catch (error) {
      console.error("Screen share error:", error);
      addNotification("error", "Failed to start screen sharing");
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      // If user was properly authenticated, update attendance
      if (MeetingAuthService.isUserInMeeting()) {
        await MeetingAuthService.leaveMeeting();
        console.log("✅ Attendance updated for meeting leave");
      }
    } catch (error) {
      console.error("❌ Error updating attendance on leave:", error);
    } finally {
      // Cleanup WebRTC and close window
      WebRTCService.cleanup();
      window.close();
    }
  };

  const handleOpenChat = () => {
    setUiState((prev) => ({
      ...prev,
      showChat: true,
      isChatMinimized: false,
    }));
  };

  const handleCloseChat = () => {
    setUiState((prev) => ({ ...prev, showChat: false }));
  };

  const handleMinimizeChat = () => {
    setUiState((prev) => ({ ...prev, isChatMinimized: !prev.isChatMinimized }));
  };

  const handleOpenParticipants = () => {
    setUiState((prev) => ({
      ...prev,
      showParticipants: !prev.showParticipants,
    }));
  };

  const handleOpenSettings = () => {
    setUiState((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  };

  const addNotification = (type, message, userId = null) => {
    const notification = {
      id: ++notificationIdRef.current,
      type,
      message,
      userId,
      userName: userId ? `User ${userId}` : null,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // Sync media states when WebRTC service changes
  useEffect(() => {
    if (WebRTCService.localStream) {
      const mediaStates = WebRTCService.getMediaStates();
      setMeetingState((prev) => ({
        ...prev,
        isAudioEnabled: mediaStates.audioEnabled,
        isVideoEnabled: mediaStates.videoEnabled,
        isMuted: mediaStates.isMuted,
      }));
    }
  }, [WebRTCService.localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      WebRTCService.cleanup();
    };
  }, []);

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <Spinner size="lg" className="mb-3" />
          <h5>Loading meeting...</h5>
          <p>Please wait while we prepare your meeting room</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <Alert color="danger" className="mb-4">
            <h5>Meeting Error</h5>
            <p>{error}</p>
          </Alert>
          <Button color="primary" onClick={() => window.close()}>
            <ArrowLeft className="me-2" size={16} />
            Close Window
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .meeting-controls-container {
            animation: slideUp 0.5s ease-out;
          }
          
          .meeting-header {
            animation: fadeIn 0.6s ease-out;
          }
          
          .video-container {
            transition: all 0.3s ease;
          }
          
          .standalone-meeting-room * {
            box-sizing: border-box;
          }
        `}
      </style>
      <div
        className="standalone-meeting-room"
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Meeting Header */}
        <div
          className="meeting-header d-flex justify-content-between align-items-center p-3"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.3s ease",
          }}
        >
          <div className="d-flex align-items-center">
            <Button
              color="outline-light"
              size="sm"
              onClick={handleLeaveMeeting}
              className="me-3"
              style={{
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.borderColor = "rgba(255,255,255,0.6)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.borderColor = "rgba(255,255,255,0.3)";
              }}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h5 className="text-white mb-0" style={{ fontWeight: "600" }}>
                {meetingData?.Title || "Meeting"}
                {meetingData?.CreatedBy === "local-test" && (
                  <span
                    className="badge bg-warning text-dark ms-2"
                    style={{ fontSize: "0.7rem" }}
                  >
                    LOCAL TEST
                  </span>
                )}
                {MeetingAuthService.isUserInMeeting() &&
                  meetingData?.CreatedBy !== "local-test" && (
                    <span
                      className="badge bg-success text-white ms-2"
                      style={{ fontSize: "0.7rem" }}
                    >
                      AUTHENTICATED
                    </span>
                  )}
              </h5>
              <small className="text-light" style={{ opacity: 0.8 }}>
                {meetingData?.Date} • {meetingData?.StartTime} -{" "}
                {meetingData?.EndTime}
                {meetingData?.CreatedBy === "local-test" && (
                  <span className="text-warning ms-2">
                    • Local Testing Mode
                  </span>
                )}
                {MeetingAuthService.isUserInMeeting() &&
                  meetingData?.CreatedBy !== "local-test" && (
                    <span className="text-success ms-2">
                      • Backend Integrated
                    </span>
                  )}
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center text-light">
            <div
              className="d-flex align-items-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Users className="me-2" size={16} />
              <span style={{ fontWeight: "500" }}>
                {meetingState.participants.length + 1} participants
              </span>
            </div>
          </div>
        </div>

        {/* Main Meeting Interface */}
        <div
          className="meeting-container position-relative"
          style={{
            height: "calc(100vh - 80px)",
            background: "rgba(0,0,0,0.1)",
            borderRadius: "0",
            overflow: "hidden",
          }}
        >
          {/* Video Grid */}
          <div
            className="video-container h-100"
            style={{ position: "relative" }}
          >
            <VideoGrid
              participants={meetingState.participants}
              localStream={meetingState.localStream}
              isLocalAudioEnabled={meetingState.isAudioEnabled}
              isLocalVideoEnabled={meetingState.isVideoEnabled}
              isLocalMuted={meetingState.isMuted}
              onParticipantClick={(participantId) => {
                console.log("Participant clicked:", participantId);
              }}
            />
          </div>

          {/* Meeting Controls */}
          <div
            className="meeting-controls-container position-absolute"
            style={{
              bottom: "30px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              transition: "all 0.3s ease",
            }}
          >
            <MeetingControls
              isAudioEnabled={meetingState.isAudioEnabled}
              isVideoEnabled={meetingState.isVideoEnabled}
              isScreenSharing={meetingState.isScreenSharing}
              isMuted={meetingState.isMuted}
              isConnected={meetingState.isConnected}
              participantCount={meetingState.participants.length}
              onToggleAudio={handleToggleAudio}
              onToggleVideo={handleToggleVideo}
              onToggleScreenShare={handleToggleScreenShare}
              onLeaveMeeting={handleLeaveMeeting}
              onOpenSettings={handleOpenSettings}
              onOpenChat={handleOpenChat}
              onOpenParticipants={handleOpenParticipants}
            />
          </div>

          {/* Enhanced Loading Overlay */}
          {meetingState.isConnecting && (
            <div
              className="meeting-loading-overlay position-absolute"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                backdropFilter: "blur(5px)",
              }}
            >
              <div className="loading-content text-center text-white">
                <div
                  className="mb-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    border: "4px solid rgba(255,255,255,0.3)",
                    borderTop: "4px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto",
                  }}
                />
                <h4 style={{ fontWeight: "600", marginBottom: "10px" }}>
                  {meetingState.hasPermissions
                    ? "Connecting to meeting..."
                    : "Preparing your meeting room..."}
                </h4>
                <p style={{ opacity: 0.8, fontSize: "16px" }}>
                  {meetingState.hasPermissions
                    ? "Setting up video and audio connections..."
                    : "Please wait while we prepare everything for you"}
                </p>
              </div>
            </div>
          )}

          {/* Connection Status Indicator */}
          {meetingState.isConnected && !meetingState.isConnecting && (
            <div
              className="connection-status position-absolute"
              style={{
                top: "20px",
                right: "20px",
                background: "rgba(0,255,0,0.2)",
                border: "1px solid rgba(0,255,0,0.5)",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "#00ff00",
                fontSize: "14px",
                fontWeight: "500",
                zIndex: 15,
                animation: "fadeIn 0.5s ease-in",
              }}
            >
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#00ff00",
                    borderRadius: "50%",
                    marginRight: "8px",
                    animation: "pulse 2s infinite",
                  }}
                />
                Connected
              </div>
            </div>
          )}

          {/* Debug Panel - Only show in development */}
          {process.env.NODE_ENV === "development" && (
            <div
              className="debug-panel position-absolute"
              style={{
                top: "20px",
                left: "20px",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "12px",
                zIndex: 15,
                maxWidth: "300px",
              }}
            >
              <div>
                <strong>Debug Info:</strong>
              </div>
              <div>Audio: {meetingState.isAudioEnabled ? "ON" : "OFF"}</div>
              <div>Video: {meetingState.isVideoEnabled ? "ON" : "OFF"}</div>
              <div>Muted: {meetingState.isMuted ? "YES" : "NO"}</div>
              <div>
                Stream: {meetingState.localStream ? "Available" : "None"}
              </div>
              <div>
                Audio Track: {WebRTCService.audioTrack ? "Available" : "None"}
              </div>
              <div>
                Video Track: {WebRTCService.videoTrack ? "Available" : "None"}
              </div>
              <div>
                Auth Status:{" "}
                {MeetingAuthService.isUserInMeeting()
                  ? "AUTHENTICATED"
                  : "NOT AUTHENTICATED"}
              </div>
              <div>
                Mode:{" "}
                {meetingData?.CreatedBy === "local-test"
                  ? "LOCAL TEST"
                  : "BACKEND INTEGRATED"}
              </div>
              {MeetingAuthService.getCurrentAttendance() && (
                <div>
                  Attendance ID:{" "}
                  {MeetingAuthService.getCurrentAttendance().AttendanceId}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {uiState.showChat && (
          <MeetingChat
            isOpen={uiState.showChat}
            onClose={handleCloseChat}
            onMinimize={handleMinimizeChat}
            isMinimized={uiState.isChatMinimized}
            meetingId={meetingId}
            participants={meetingState.participants}
          />
        )}

        {/* Notifications */}
        <MeetingNotifications
          notifications={notifications}
          onRemoveNotification={removeNotification}
        />

        {/* Media Permissions Modal */}
        <MediaPermissions
          isOpen={uiState.showPermissionsModal}
          onPermissionGranted={handlePermissionsGranted}
          onPermissionDenied={handlePermissionsDenied}
          onClose={() =>
            setUiState((prev) => ({ ...prev, showPermissionsModal: false }))
          }
        />
      </div>
    </>
  );
};

export default StandaloneMeetingRoom;
