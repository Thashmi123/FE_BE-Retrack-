import React, { Fragment, useContext, useEffect } from "react";
import { LI, UL } from "../../../../AbstractElements";
import ChatAppContext from "../../../../_helper/Chat";

const ChatMessage = () => {
  const {
    selectedUserr,
    currentUserr,
    currentMessages,
    loading,
    fetchChatMemberAsyn,
    fetchChatAsyn,
  } = useContext(ChatAppContext);

  useEffect(() => {
    fetchChatMemberAsyn();
    fetchChatAsyn();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const container = document.querySelector(".chat-history");
    if (container && currentMessages.length > 0) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }, [currentMessages]);

  // Generate avatar initials from name
  const getAvatarInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on user ID
  const getAvatarColor = (userId) => {
    const colors = [
      "#007bff",
      "#28a745",
      "#dc3545",
      "#ffc107",
      "#17a2b8",
      "#6f42c1",
    ];
    const index = userId ? userId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const messagesToShow =
    currentMessages && currentMessages.length > 0 ? currentMessages : [];
  const isMeetingChat =
    selectedUserr?.id === "USR-6" || selectedUserr?.name === "The Meeting Chat";

  return (
    <Fragment>
      {loading ? (
        <div
          className="loading d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : selectedUserr && currentUserr ? (
        <div className="chat-history chat-msg-box custom-scrollbar">
          {isMeetingChat && (
            <div className="meeting-chat-header p-3 bg-warning bg-opacity-10 border-bottom">
              <div className="d-flex align-items-center">
                <i className="fa fa-users text-warning me-2"></i>
                <h6 className="mb-0 text-warning">🏢 Meeting Chat Room</h6>
              </div>
              <small className="text-muted">
                All messages sent to the meeting room
              </small>
            </div>
          )}
          <UL attrUL={{ className: "simple-list" }}>
            {messagesToShow.length > 0 ? (
              messagesToShow.map((item, index) => {
                const isCurrentUser = item.sender === currentUserr.id;

                // For meeting chat, use senderName if available, otherwise get from context
                let senderName, avatarInitials, avatarColor;

                if (isMeetingChat) {
                  senderName =
                    item.senderName ||
                    (isCurrentUser ? currentUserr.name : `User ${item.sender}`);
                  avatarInitials = getAvatarInitials(senderName);
                  avatarColor = getAvatarColor(item.sender);
                } else {
                  const participator = isCurrentUser
                    ? currentUserr
                    : selectedUserr;
                  senderName = participator?.name;
                  avatarInitials = getAvatarInitials(participator?.name);
                  avatarColor = getAvatarColor(participator?.id);
                }

                return (
                  <LI
                    attrLI={{ className: "clearfix border-0" }}
                    key={item.id || index}
                  >
                    <div
                      className={`message ${
                        isCurrentUser
                          ? "other-message pull-right"
                          : "my-message"
                      } ${isMeetingChat ? "meeting-message" : ""}`}
                    >
                      <div
                        className={`rounded-circle ${
                          isCurrentUser ? "float-end" : "float-start"
                        } chat-user-img d-flex align-items-center justify-content-center`}
                        style={{
                          width: "30px",
                          height: "30px",
                          backgroundColor: avatarColor,
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {avatarInitials}
                      </div>
                      <div className="message-data text-end">
                        {isMeetingChat && !isCurrentUser && (
                          <div className="sender-name text-muted small mb-1">
                            {senderName}
                          </div>
                        )}
                        <span className="message-data-time">{item.time}</span>
                        {item.status && (
                          <span
                            className={`message-status ms-2 ${
                              item.status ? "text-success" : "text-muted"
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="message-text">{item.text}</div>
                    </div>
                  </LI>
                );
              })
            ) : (
              <div className="text-center p-4">
                <div
                  className="mb-3"
                  style={{ fontSize: "48px", color: "#6c757d" }}
                >
                  {isMeetingChat ? "🏢" : "💬"}
                </div>
                <p className="text-muted">
                  {isMeetingChat
                    ? "No messages in the meeting room yet. Be the first to send a message!"
                    : `Start a conversation with ${selectedUserr?.name}`}
                </p>
              </div>
            )}
          </UL>
        </div>
      ) : (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <div className="text-center">
            <div
              className="mb-3"
              style={{ fontSize: "48px", color: "#6c757d" }}
            >
              💬
            </div>
            <p className="text-muted">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      )}
    </Fragment>
  );
};
export default ChatMessage;
