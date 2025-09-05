import React, { useState, useEffect, useRef } from "react";
import { Card, CardBody, Badge, Spinner } from "reactstrap";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Star,
  Wifi,
  WifiOff,
} from "react-feather";

const VideoGrid = ({
  participants = [],
  localStream = null,
  isLocalAudioEnabled = true,
  isLocalVideoEnabled = true,
  isLocalMuted = false,
  onParticipantClick,
  className = "",
}) => {
  const [gridLayout, setGridLayout] = useState("grid");
  const [speakerView, setSpeakerView] = useState(null);
  const videoRefs = useRef({});
  const [connectionStates, setConnectionStates] = useState({});

  // Calculate grid layout based on participant count
  useEffect(() => {
    const totalParticipants = participants.length + (localStream ? 1 : 0);

    if (totalParticipants <= 1) {
      setGridLayout("single");
    } else if (totalParticipants <= 2) {
      setGridLayout("grid-1x2");
    } else if (totalParticipants <= 4) {
      setGridLayout("grid-2x2");
    } else if (totalParticipants <= 6) {
      setGridLayout("grid-2x3");
    } else if (totalParticipants <= 9) {
      setGridLayout("grid-3x3");
    } else {
      setGridLayout("grid-4x4");
    }
  }, [participants.length, localStream]);

  // Set up video elements
  useEffect(() => {
    // Set up local video
    if (localStream && videoRefs.current.local) {
      videoRefs.current.local.srcObject = localStream;
    }

    // Set up participant videos
    participants.forEach((participant) => {
      if (participant.stream && videoRefs.current[participant.id]) {
        videoRefs.current[participant.id].srcObject = participant.stream;
      }
    });
  }, [participants, localStream]);

  const handleParticipantClick = (participantId) => {
    if (onParticipantClick) {
      onParticipantClick(participantId);
    }

    // Toggle speaker view
    if (speakerView === participantId) {
      setSpeakerView(null);
    } else {
      setSpeakerView(participantId);
    }
  };

  const getGridClasses = () => {
    const baseClasses = "video-grid";

    switch (gridLayout) {
      case "single":
        return `${baseClasses} single-view`;
      case "grid-1x2":
        return `${baseClasses} grid-1x2`;
      case "grid-2x2":
        return `${baseClasses} grid-2x2`;
      case "grid-2x3":
        return `${baseClasses} grid-2x3`;
      case "grid-3x3":
        return `${baseClasses} grid-3x3`;
      case "grid-4x4":
        return `${baseClasses} grid-4x4`;
      default:
        return `${baseClasses} grid-2x2`;
    }
  };

  const getConnectionQuality = (participantId) => {
    return connectionStates[participantId] || "good";
  };

  const getConnectionIcon = (quality) => {
    switch (quality) {
      case "excellent":
        return <Wifi className="text-success" size={12} />;
      case "good":
        return <Wifi className="text-success" size={12} />;
      case "poor":
        return <Wifi className="text-warning" size={12} />;
      case "bad":
        return <WifiOff className="text-danger" size={12} />;
      default:
        return <Wifi className="text-muted" size={12} />;
    }
  };

  const VideoTile = ({
    participant,
    isLocal = false,
    isSpeaker = false,
    className = "",
  }) => {
    const videoId = isLocal ? "local" : participant.id;
    const isAudioEnabled = isLocal
      ? isLocalAudioEnabled
      : participant.audioEnabled;
    const isVideoEnabled = isLocal
      ? isLocalVideoEnabled
      : participant.videoEnabled;
    const isMuted = isLocal ? isLocalMuted : participant.isMuted;
    const isHost = participant?.isHost || false;

    return (
      <Card
        className={`video-tile ${isSpeaker ? "speaker-view" : ""} ${className}`}
        onClick={() => !isLocal && handleParticipantClick(participant.id)}
        style={{ cursor: isLocal ? "default" : "pointer" }}
      >
        <CardBody className="p-0 position-relative">
          {/* Video Element */}
          <div className="video-container">
            {isVideoEnabled ? (
              <video
                ref={(el) => (videoRefs.current[videoId] = el)}
                autoPlay
                muted={isLocal}
                playsInline
                className="video-element"
              />
            ) : (
              <div className="video-placeholder">
                <div className="avatar-placeholder">
                  <span className="initials">
                    {isLocal
                      ? "You"
                      : (participant.name || "User").charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Overlay Information */}
          <div className="video-overlay">
            {/* Top Bar */}
            <div className="video-top-bar d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {isHost && <Star className="text-warning me-1" size={14} />}
                <span className="participant-name">
                  {isLocal ? "You" : participant.name || "Unknown User"}
                </span>
              </div>

              <div className="d-flex align-items-center">
                {getConnectionIcon(getConnectionQuality(participant.id))}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="video-bottom-bar d-flex justify-content-between align-items-center">
              <div className="audio-video-indicators">
                {/* Audio Indicator */}
                <div
                  className={`indicator ${
                    !isAudioEnabled || isMuted ? "muted" : "active"
                  }`}
                >
                  {!isAudioEnabled || isMuted ? (
                    <MicOff size={14} />
                  ) : (
                    <Mic size={14} />
                  )}
                </div>

                {/* Video Indicator */}
                <div
                  className={`indicator ${
                    !isVideoEnabled ? "muted" : "active"
                  }`}
                >
                  {!isVideoEnabled ? (
                    <VideoOff size={14} />
                  ) : (
                    <Video size={14} />
                  )}
                </div>
              </div>

              {/* Connection Status */}
              <div className="connection-status">
                {participant.isConnecting && (
                  <Spinner size="sm" color="light" />
                )}
              </div>
            </div>
          </div>

          {/* Speaker View Badge */}
          {isSpeaker && (
            <div className="speaker-badge">
              <Badge color="primary">Speaking</Badge>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  // Render speaker view (single large video)
  if (speakerView) {
    const speaker = participants.find((p) => p.id === speakerView);
    if (speaker) {
      return (
        <div className={`video-grid speaker-mode ${className}`}>
          <div className="speaker-main">
            <VideoTile
              participant={speaker}
              isSpeaker={true}
              className="speaker-tile"
            />
          </div>

          <div className="speaker-thumbnails">
            {/* Local video thumbnail */}
            {localStream && (
              <VideoTile
                participant={{}}
                isLocal={true}
                className="thumbnail-tile"
              />
            )}

            {/* Other participants as thumbnails */}
            {participants
              .filter((p) => p.id !== speakerView)
              .map((participant) => (
                <VideoTile
                  key={participant.id}
                  participant={participant}
                  className="thumbnail-tile"
                />
              ))}
          </div>
        </div>
      );
    }
  }

  // Render grid view
  return (
    <>
      <div className={`${getGridClasses()} ${className}`}>
        {/* Local video */}
        {localStream && (
          <VideoTile participant={{}} isLocal={true} className="local-video" />
        )}

        {/* Participant videos */}
        {participants.map((participant) => (
          <VideoTile key={participant.id} participant={participant} />
        ))}
      </div>

      <style jsx>{`
        .video-grid {
          display: grid;
          gap: 8px;
          height: 100%;
          width: 100%;
          padding: 8px;
        }

        .single-view {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
        }

        .grid-1x2 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr;
        }

        .grid-2x2 {
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .grid-2x3 {
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .grid-3x3 {
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr;
        }

        .grid-4x4 {
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr 1fr;
        }

        .video-tile {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .video-tile:hover {
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.02);
        }

        .video-tile.speaker-view {
          border-color: var(--bs-primary);
          box-shadow: 0 0 20px rgba(0, 123, 255, 0.5);
        }

        .video-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 200px;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #000;
        }

        .video-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .initials {
          font-size: 24px;
          font-weight: 600;
          color: white;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.7) 0%,
            transparent 20%,
            transparent 80%,
            rgba(0, 0, 0, 0.7) 100%
          );
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .video-tile:hover .video-overlay {
          opacity: 1;
        }

        .video-top-bar {
          color: white;
          font-size: 14px;
          font-weight: 500;
        }

        .video-bottom-bar {
          color: white;
          font-size: 12px;
        }

        .participant-name {
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }

        .audio-video-indicators {
          display: flex;
          gap: 8px;
        }

        .indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .indicator svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .indicator.active {
          background: rgba(40, 167, 69, 0.8);
          color: white;
        }

        .indicator.muted {
          background: rgba(220, 53, 69, 0.8);
          color: white;
        }

        .connection-status {
          display: flex;
          align-items: center;
        }

        .speaker-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
        }

        .speaker-mode {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .speaker-main {
          flex: 1;
          margin-bottom: 8px;
        }

        .speaker-thumbnails {
          display: flex;
          gap: 8px;
          height: 120px;
          overflow-x: auto;
        }

        .thumbnail-tile {
          min-width: 160px;
          height: 100%;
        }

        .local-video {
          border: 2px solid #28a745;
        }

        .local-video::before {
          content: "You";
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(40, 167, 69, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .video-grid {
            padding: 4px;
            gap: 4px;
          }

          .grid-2x3,
          .grid-3x3,
          .grid-4x4 {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(auto-fit, minmax(150px, 1fr));
          }

          .speaker-thumbnails {
            height: 80px;
          }

          .thumbnail-tile {
            min-width: 120px;
          }
        }
      `}</style>
    </>
  );
};

export default VideoGrid;
