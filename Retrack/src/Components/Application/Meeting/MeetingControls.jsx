import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  Tooltip,
} from "reactstrap";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Share,
  MoreVertical,
  Volume2,
  VolumeX,
  Monitor,
} from "react-feather";

const MeetingControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isMuted,
  isConnected,
  participantCount = 0,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveMeeting,
  onOpenSettings,
  onOpenChat,
  onOpenParticipants,
  className = "",
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState({});

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleToggleAudio = () => {
    onToggleAudio();
    showTemporaryTooltip("audio");
  };

  const handleToggleVideo = () => {
    onToggleVideo();
    showTemporaryTooltip("video");
  };

  const handleToggleScreenShare = () => {
    onToggleScreenShare();
    showTemporaryTooltip("screen");
  };

  const showTemporaryTooltip = (type) => {
    setShowTooltip((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setShowTooltip((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const getAudioButton = () => {
    const isAudioMuted = !isAudioEnabled || isMuted;
    return (
      <Button
        id="audio-btn"
        color={isAudioMuted ? "danger" : "light"}
        className={`meeting-control-btn ${
          isAudioMuted ? "btn-danger" : "btn-light"
        }`}
        onClick={handleToggleAudio}
        disabled={!isConnected}
      >
        {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </Button>
    );
  };

  const getVideoButton = () => {
    return (
      <Button
        id="video-btn"
        color={isVideoEnabled ? "light" : "danger"}
        className={`meeting-control-btn ${
          isVideoEnabled ? "btn-light" : "btn-danger"
        }`}
        onClick={handleToggleVideo}
        disabled={!isConnected}
      >
        {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </Button>
    );
  };

  const getScreenShareButton = () => {
    return (
      <Button
        id="screen-btn"
        color={isScreenSharing ? "primary" : "light"}
        className={`meeting-control-btn ${
          isScreenSharing ? "btn-primary" : "btn-light"
        }`}
        onClick={handleToggleScreenShare}
        disabled={!isConnected}
        style={{
          position: "relative",
        }}
      >
        <Monitor size={20} />
        {isScreenSharing && (
          <div
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "8px",
              height: "8px",
              backgroundColor: "#28a745",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
        )}
      </Button>
    );
  };

  const getLeaveButton = () => {
    return (
      <Button
        id="leave-btn"
        color="danger"
        className="meeting-control-btn btn-danger"
        onClick={onLeaveMeeting}
      >
        <PhoneOff size={20} />
      </Button>
    );
  };

  return (
    <div className={`meeting-controls ${className}`}>
      <div className="d-flex justify-content-center align-items-center">
        {/* Main Control Buttons */}
        <ButtonGroup className="me-3">
          {/* Audio Control */}
          <Tooltip
            placement="top"
            isOpen={showTooltip.audio}
            target="audio-btn"
            toggle={() => {}}
          >
            {isAudioEnabled && !isMuted
              ? "Mute Microphone"
              : "Unmute Microphone"}
          </Tooltip>
          {getAudioButton()}

          {/* Video Control */}
          <Tooltip
            placement="top"
            isOpen={showTooltip.video}
            target="video-btn"
            toggle={() => {}}
          >
            {isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
          </Tooltip>
          {getVideoButton()}

          {/* Screen Share Control */}
          <Tooltip
            placement="top"
            isOpen={showTooltip.screen}
            target="screen-btn"
            toggle={() => {}}
          >
            {isScreenSharing ? "Stop Screen Sharing" : "Share Screen"}
          </Tooltip>
          {getScreenShareButton()}
        </ButtonGroup>

        {/* Secondary Controls */}
        <ButtonGroup className="me-3">
          {/* Participants */}
          <Button
            id="participants-btn"
            color="light"
            className="meeting-control-btn btn-light position-relative"
            onClick={onOpenParticipants}
            disabled={!isConnected}
          >
            <Users size={20} />
            {participantCount > 0 && (
              <Badge
                color="primary"
                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{ fontSize: "0.7rem" }}
              >
                {participantCount}
              </Badge>
            )}
          </Button>

          {/* Chat */}
          <Button
            id="chat-btn"
            color="light"
            className="meeting-control-btn btn-light"
            onClick={onOpenChat}
            disabled={!isConnected}
          >
            <MessageSquare size={20} />
          </Button>
        </ButtonGroup>

        {/* More Options Dropdown */}
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle
            id="more-btn"
            color="light"
            className="meeting-control-btn btn-light"
            disabled={!isConnected}
          >
            <MoreVertical size={20} />
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem onClick={onOpenSettings}>
              <Settings
                size={16}
                className="me-2"
                style={{ width: "16px", height: "16px" }}
              />
              Settings
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <Share
                size={16}
                className="me-2"
                style={{ width: "16px", height: "16px" }}
              />
              Invite People
            </DropdownItem>
            <DropdownItem>
              <Volume2
                size={16}
                className="me-2"
                style={{ width: "16px", height: "16px" }}
              />
              Audio Settings
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem className="text-danger">
              <PhoneOff
                size={16}
                className="me-2"
                style={{ width: "16px", height: "16px" }}
              />
              Leave Meeting
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Leave Meeting Button */}
        <div className="ms-3">{getLeaveButton()}</div>
      </div>

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="text-center mt-2">
          <Badge color="warning" className="pulse-animation">
            Connecting...
          </Badge>
        </div>
      )}

      {/* Audio/Video Status Indicators */}
      <div className="d-flex justify-content-center mt-2">
        {!isAudioEnabled && (
          <Badge color="danger" className="me-2">
            <MicOff
              size={12}
              className="me-1"
              style={{ width: "12px", height: "12px" }}
            />
            Audio Off
          </Badge>
        )}
        {!isVideoEnabled && (
          <Badge color="danger" className="me-2">
            <VideoOff
              size={12}
              className="me-1"
              style={{ width: "12px", height: "12px" }}
            />
            Video Off
          </Badge>
        )}
        {isScreenSharing && (
          <Badge color="primary">
            <Monitor
              size={12}
              className="me-1"
              style={{ width: "12px", height: "12px" }}
            />
            Screen Sharing
          </Badge>
        )}
      </div>

      <style jsx>{`
        .meeting-controls {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 50px;
          padding: 12px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .meeting-control-btn {
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: all 0.3s ease;
          position: relative;
          font-size: 0;
        }

        .meeting-control-btn svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .meeting-control-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .meeting-control-btn:active {
          transform: scale(0.95);
        }

        .meeting-control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-danger {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4dabf7, #339af0);
          color: white;
        }

        .btn-light {
          background: rgba(255, 255, 255, 0.9);
          color: var(--bs-body-color);
        }

        .btn-light:hover {
          background: rgba(255, 255, 255, 1);
        }

        .pulse-animation {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MeetingControls;
