import React, { useState, useEffect } from "react";
import { Toast, ToastHeader, ToastBody, Container } from "reactstrap";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
  UserPlus,
  UserMinus,
} from "react-feather";

const MeetingNotifications = ({
  notifications = [],
  onRemoveNotification,
  className = "",
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (notificationId) => {
    setVisibleNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
    if (onRemoveNotification) {
      onRemoveNotification(notificationId);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "audio-muted":
        return <MicOff className="text-danger" size={16} />;
      case "audio-unmuted":
        return <Mic className="text-success" size={16} />;
      case "video-off":
        return <VideoOff className="text-danger" size={16} />;
      case "video-on":
        return <Video className="text-success" size={16} />;
      case "user-joined":
        return <UserPlus className="text-success" size={16} />;
      case "user-left":
        return <UserMinus className="text-warning" size={16} />;
      case "connection-poor":
        return <Wifi className="text-warning" size={16} />;
      case "connection-lost":
        return <WifiOff className="text-danger" size={16} />;
      case "connection-restored":
        return <Wifi className="text-success" size={16} />;
      default:
        return null;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "audio-muted":
      case "video-off":
      case "connection-lost":
        return "danger";
      case "audio-unmuted":
      case "video-on":
      case "user-joined":
      case "connection-restored":
        return "success";
      case "user-left":
      case "connection-poor":
        return "warning";
      default:
        return "info";
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case "audio-muted":
        return "Microphone Muted";
      case "audio-unmuted":
        return "Microphone Unmuted";
      case "video-off":
        return "Camera Turned Off";
      case "video-on":
        return "Camera Turned On";
      case "user-joined":
        return "Participant Joined";
      case "user-left":
        return "Participant Left";
      case "connection-poor":
        return "Poor Connection";
      case "connection-lost":
        return "Connection Lost";
      case "connection-restored":
        return "Connection Restored";
      default:
        return "Notification";
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className={`meeting-notifications ${className}`}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1060,
      }}
    >
      {visibleNotifications.map((notification) => (
        <Toast
          key={notification.id}
          isOpen={true}
          className={`notification-toast border-0 shadow-sm`}
          style={{
            minWidth: "300px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: `2px solid var(--bs-${getNotificationColor(
              notification.type
            )}-border-subtle)`,
          }}
        >
          <ToastHeader
            className={`bg-${getNotificationColor(
              notification.type
            )}-subtle text-${getNotificationColor(
              notification.type
            )}-emphasis border-0`}
            close={
              <button
                type="button"
                className="btn-close"
                onClick={() => handleDismiss(notification.id)}
                aria-label="Close"
              />
            }
          >
            <div className="d-flex align-items-center">
              {getNotificationIcon(notification.type)}
              <span className="ms-2 fw-semibold">
                {getNotificationTitle(notification.type)}
              </span>
            </div>
          </ToastHeader>

          <ToastBody className="py-2">
            <div className="d-flex align-items-center">
              {notification.userName && (
                <div className="me-2">
                  <div
                    className={`avatar-sm bg-${getNotificationColor(
                      notification.type
                    )}-subtle rounded-circle d-flex align-items-center justify-content-center`}
                  >
                    <span
                      className={`text-${getNotificationColor(
                        notification.type
                      )}-emphasis fw-bold`}
                    >
                      {notification.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex-grow-1">
                <p className="mb-1 fw-medium">
                  {notification.userName || "Someone"}
                </p>
                <p className="mb-0 small text-muted">
                  {notification.message || getDefaultMessage(notification.type)}
                </p>
                {notification.timestamp && (
                  <small className="text-muted">
                    {formatTime(notification.timestamp)}
                  </small>
                )}
              </div>
            </div>
          </ToastBody>
        </Toast>
      ))}
    </div>
  );
};

const getDefaultMessage = (type) => {
  switch (type) {
    case "audio-muted":
      return "muted their microphone";
    case "audio-unmuted":
      return "unmuted their microphone";
    case "video-off":
      return "turned off their camera";
    case "video-on":
      return "turned on their camera";
    case "user-joined":
      return "joined the meeting";
    case "user-left":
      return "left the meeting";
    case "connection-poor":
      return "is experiencing poor connection";
    case "connection-lost":
      return "lost connection";
    case "connection-restored":
      return "connection restored";
    default:
      return "notification";
  }
};

const formatTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = (now - time) / 1000;

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  } else {
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

export default MeetingNotifications;
