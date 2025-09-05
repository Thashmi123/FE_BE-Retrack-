import React, { Fragment, useContext } from "react";
import ChatAppContext from "../../../../_helper/Chat";
import { LI, UL } from "../../../../AbstractElements";
import SearchChatList from "./SearchChatList";
import CurrentUser from "./CurrentUser";

const ChatStatus = () => {
  const {
    selectedUserr,
    memberss,
    currentUserr,
    conversations,
    loading,
    changeChat,
    createNewChatAsyn,
    unreadCounts,
    getUnreadCount,
    getMeetingChatUser,
    startMeetingChat,
  } = useContext(ChatAppContext);

  const changeChatClick = async (e, selectedUserId) => {
    if (!currentUserr) return;

    try {
      await changeChat(selectedUserId);
    } catch (error) {
      console.error("Error changing chat:", error);
    }
  };

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

  var activeChat = 0;
  if (selectedUserr != null) activeChat = selectedUserr.id;

  return (
    <Fragment>
      <div className="chat-box">
        <div className="chat-left-aside">
          <CurrentUser />
          <div className="people-list" id="people-list">
            <SearchChatList />

            {/* Meeting Chat Button */}
            <div className="meeting-chat-section mb-3">
              <button
                className="btn btn-warning w-100 d-flex align-items-center justify-content-center"
                onClick={startMeetingChat}
                style={{
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <i className="fa fa-users me-2"></i>
                <span>🏢 Meeting Chat</span>
              </button>
              <small className="text-muted d-block text-center mt-1">
                Join the common meeting room
              </small>
            </div>

            {loading ? (
              <div className="text-center p-3">
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading conversations...</p>
              </div>
            ) : memberss && memberss.length > 0 ? (
              <UL attrUL={{ className: "simple-list list custom-scrollbar" }}>
                {memberss
                  .filter((x) => currentUserr && x.id !== currentUserr.id)
                  .map((item) => {
                    // Find if there's a conversation with this user
                    const hasConversation = conversations.some(
                      (conv) =>
                        (conv.userA === currentUserr?.id &&
                          conv.userB === item.id) ||
                        (conv.userB === currentUserr?.id &&
                          conv.userA === item.id)
                    );

                    // Find the conversation ID for this user
                    const conversation = conversations.find(
                      (conv) =>
                        (conv.userA === currentUserr?.id &&
                          conv.userB === item.id) ||
                        (conv.userB === currentUserr?.id &&
                          conv.userA === item.id)
                    );

                    // Get unread count for this conversation
                    const unreadCount = conversation
                      ? getUnreadCount(conversation.id)
                      : 0;

                    const avatarInitials = getAvatarInitials(item.name);
                    const avatarColor = getAvatarColor(item.id);

                    return (
                      <LI
                        attrLI={{
                          style: {
                            backgroundColor: "transparent",
                            cursor: "pointer",
                          },
                          className: `clearfix border-0 p-2 chat-list-item ${
                            activeChat === item.id ? "active" : ""
                          } ${hasConversation ? "has-conversation" : ""} ${
                            unreadCount > 0 ? "has-unread" : ""
                          }`,
                          onClick: (e) => changeChatClick(e, item.id),
                        }}
                        key={item.id}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3 user-avatar"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: avatarColor,
                              color: "white",
                              fontSize: "14px",
                              fontWeight: "bold",
                              position: "relative",
                            }}
                          >
                            {avatarInitials}
                            <div
                              className={`position-absolute rounded-circle online-indicator ${
                                item.online === true ? "online" : "offline"
                              }`}
                            ></div>
                          </div>
                          <div className="flex-grow-1 user-info">
                            <div className="fw-semibold user-name">
                              <span>{item.name}</span>
                              {unreadCount > 0 && (
                                <span className="unread-badge">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="text-muted small">{item.email}</div>
                          </div>
                        </div>
                      </LI>
                    );
                  })}
              </UL>
            ) : (
              <div className="text-center p-3">
                <div
                  className="mb-2"
                  style={{ fontSize: "32px", color: "#6c757d" }}
                >
                  👥
                </div>
                <p className="text-muted">No users available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default ChatStatus;
