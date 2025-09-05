import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Alert, Spinner } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import WebRTCService from "../../../Services/webrtc.service";
import MediaPermissions from "./MediaPermissions";
import VideoGrid from "./VideoGrid";
import MeetingControls from "./MeetingControls";
import MeetingChat from "./MeetingChat";
import MeetingNotifications from "./MeetingNotifications";
import { useMessage } from "../../../contexts/MessageContext";
import { useUser } from "../../../contexts/UserContext";

const EnhancedMeetingRoom = ({ meetingId, meetingData, onLeaveMeeting }) => {
  // State management
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
  const [connectionQuality, setConnectionQuality] = useState("good");

  // Refs
  const socketRef = useRef(null);
  const notificationIdRef = useRef(0);

  // Contexts
  const { user } = useUser();
  const { setCurrentMessages } = useMessage();

  // Initialize meeting
  useEffect(() => {
    if (meetingId && meetingData) {
      initializeMeeting();
    }

    return () => {
      cleanup();
    };
  }, [meetingId, meetingData]);

  const initializeMeeting = async () => {
    try {
      setMeetingState((prev) => ({ ...prev, isConnecting: true, error: null }));

      // For now, skip WebRTC initialization and go directly to permissions
      // This prevents the loading issue
      setTimeout(() => {
        setMeetingState((prev) => ({
          ...prev,
          isConnecting: false,
          isConnected: true,
        }));
        setUiState((prev) => ({ ...prev, showPermissionsModal: true }));
      }, 1000);

      // TODO: Initialize WebRTC service when ready
      // WebRTCService.initialize(socketRef.current, meetingId, true);
      // setupWebRTCHandlers();
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
      setMeetingState((prev) => ({
        ...prev,
        hasPermissions: true,
        localStream: stream,
        isConnecting: false,
        isConnected: true,
      }));

      setUiState((prev) => ({ ...prev, showPermissionsModal: false }));

      // For now, just show success without WebRTC
      addNotification("success", "Successfully joined the meeting");

      // TODO: Join the room when WebRTC is ready
      // WebRTCService.joinRoom(user?.id || "anonymous");
    } catch (error) {
      console.error("Error after permissions granted:", error);
      setMeetingState((prev) => ({
        ...prev,
        error: "Failed to start meeting after permissions granted",
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
    const newState = WebRTCService.toggleAudio();
    setMeetingState((prev) => ({ ...prev, isMuted: !newState }));
  };

  const handleToggleVideo = () => {
    const newState = WebRTCService.toggleVideo();
    setMeetingState((prev) => ({ ...prev, isVideoEnabled: newState }));
  };

  const handleToggleScreenShare = async () => {
    try {
      if (!meetingState.isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        setMeetingState((prev) => ({ ...prev, isScreenSharing: true }));
        addNotification("screen-share", "Started screen sharing");

        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setMeetingState((prev) => ({ ...prev, isScreenSharing: false }));
          addNotification("screen-share", "Stopped screen sharing");
        };
      } else {
        // Stop screen sharing
        setMeetingState((prev) => ({ ...prev, isScreenSharing: false }));
        addNotification("screen-share", "Stopped screen sharing");
      }
    } catch (error) {
      console.error("Screen share error:", error);
      addNotification("error", "Failed to start screen sharing");
    }
  };

  const handleLeaveMeeting = () => {
    cleanup();
    if (onLeaveMeeting) {
      onLeaveMeeting();
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

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const cleanup = () => {
    WebRTCService.cleanup();
    setMeetingState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      localStream: null,
      participants: [],
    }));
  };

  if (meetingState.error && !meetingState.isConnecting) {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="text-center">
          <Alert color="danger" className="mb-4">
            <h5>Meeting Error</h5>
            <p>{meetingState.error}</p>
          </Alert>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  return (
    <div className="enhanced-meeting-room">
      <Breadcrumbs
        mainTitle="Meeting Room"
        parent="Meeting"
        title="Video Conference"
      />

      <Container fluid className="p-0">
        {/* Main Meeting Interface */}
        <div className="meeting-container position-relative">
          {/* Video Grid */}
          <div className="video-container">
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
          <div className="meeting-controls-container">
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

          {/* Loading Overlay */}
          {meetingState.isConnecting && (
            <div className="meeting-loading-overlay">
              <div className="loading-content text-center text-white">
                <Spinner size="lg" className="mb-3" />
                <h5>Connecting to meeting...</h5>
                <p>Please wait while we set up your video call</p>
              </div>
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
      </Container>

      <style jsx>{`
        .enhanced-meeting-room {
          height: 100vh;
          background: #000;
          overflow: hidden;
        }

        .meeting-container {
          height: 100vh;
          position: relative;
        }

        .video-container {
          height: 100%;
          width: 100%;
          position: relative;
        }

        .meeting-controls-container {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .meeting-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .loading-content {
          text-align: center;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .meeting-controls-container {
            bottom: 10px;
            left: 10px;
            right: 10px;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedMeetingRoom;
