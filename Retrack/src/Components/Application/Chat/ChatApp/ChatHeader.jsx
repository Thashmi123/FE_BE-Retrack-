import React, { Fragment, useContext, useEffect, useState } from "react";
import { UL, LI } from "../../../../AbstractElements";
import ChatAppContext from "../../../../_helper/Chat";
import { useUser } from "../../../../contexts/UserContext";
import UserService from "../../../../Services/user.service";
import {
  AlignJustify,
  Headphones,
  Paperclip,
  Search,
  Video,
} from "react-feather";
import { useLocation } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUserr, currentUserr, setMenuToggle, menuToggle } =
    useContext(ChatAppContext);
  const { user, getCurrentUserId } = useUser();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from multiple sources
  useEffect(() => {
    const userId = getCurrentUserId
      ? getCurrentUserId()
      : UserService.getCurrentUserId();
    setCurrentUserId(userId);
  }, [user, getCurrentUserId]);

  const chatMenuToggle = () => {
    setMenuToggle(!menuToggle);
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

  // Generate avatar color based on user name
  const getAvatarColor = (name) => {
    const colors = [
      "#007bff",
      "#28a745",
      "#dc3545",
      "#ffc107",
      "#17a2b8",
      "#6f42c1",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Use logged-in user info from UserContext with localStorage fallback
  const loggedInUser = user || currentUserr;
  const userName = loggedInUser
    ? loggedInUser.name ||
      loggedInUser.Name ||
      `${loggedInUser.FirstName || ""} ${loggedInUser.LastName || ""}`.trim() ||
      loggedInUser.username ||
      "Current User"
    : "Guest User";
  const userStatus = loggedInUser ? "Online" : "Offline";
  const avatarInitials = getAvatarInitials(userName);
  const avatarColor = getAvatarColor(userName);

  // Display current user ID for debugging (can be removed in production)
  const displayUserId =
    currentUserId || loggedInUser?.id || loggedInUser?.userId || "Unknown";

  // Show conversation info if a user is selected
  const conversationInfo = selectedUserr
    ? {
        name: selectedUserr.name,
        status: selectedUserr.online ? "Online" : "Offline",
        isMeetingChat:
          selectedUserr.id === "USR-6" ||
          selectedUserr.name === "The Meeting Chat",
      }
    : null;

  return (
    <Fragment>
      <div className="chat-header clearfix d-flex align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          {/* Logged-in user info */}
          <div className="d-flex align-items-center me-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: avatarColor,
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {avatarInitials}
            </div>
            <div className="about">
              <div
                className="name text-primary fw-semibold"
                style={{ fontSize: "14px" }}
              >
                {userName}
              </div>
              <div
                className="status digits text-success"
                style={{ fontSize: "12px" }}
              >
                {userStatus} • ID: {displayUserId}
              </div>
            </div>
          </div>

          {/* Conversation info if user is selected */}
          {conversationInfo && (
            <>
              <div
                className={`mx-3 ${
                  conversationInfo.isMeetingChat ? "text-warning" : "text-muted"
                }`}
              >
                <i
                  className={`fa ${
                    conversationInfo.isMeetingChat ? "fa-users" : "fa-comments"
                  }`}
                ></i>
              </div>
              <div className="about">
                <div
                  className={`name fw-semibold ${
                    conversationInfo.isMeetingChat ? "text-warning" : ""
                  }`}
                >
                  {conversationInfo.isMeetingChat ? (
                    <>
                      🏢 Meeting Chat Room
                      {location.state3 ? (
                        <span className="font-primary f-12"> (Typing...)</span>
                      ) : (
                        ""
                      )}
                    </>
                  ) : (
                    <>
                      Chatting with {conversationInfo.name}
                      {location.state3 ? (
                        <span className="font-primary f-12"> (Typing...)</span>
                      ) : (
                        ""
                      )}
                    </>
                  )}
                </div>
                <div className="status digits">
                  <span
                    className={`badge ${
                      conversationInfo.isMeetingChat
                        ? "bg-warning"
                        : conversationInfo.status === "Online"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {conversationInfo.isMeetingChat
                      ? "Meeting Room"
                      : conversationInfo.status}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <UL
          attrUL={{
            className:
              "simple-list list-inline float-start float-sm-end chat-menu-icons d-flex flex-row",
          }}
        >
          <LI attrLI={{ className: "list-inline-item border-0" }}>
            <a href="#javascript">
              <Search />
            </a>
          </LI>
          <LI attrLI={{ className: "list-inline-item border-0" }}>
            <a href="#javascript">
              <Paperclip />
            </a>
          </LI>
          <LI attrLI={{ className: "list-inline-item border-0" }}>
            <a href="#javascript">
              <Headphones />
            </a>
          </LI>
          <LI attrLI={{ className: "list-inline-item border-0" }}>
            <a href="#javascript">
              <Video />
            </a>
          </LI>
          <LI attrLI={{ className: "list-inline-item toogle-bar border-0" }}>
            <a href="#javascript">
              <AlignJustify onClick={() => chatMenuToggle()} />
            </a>
          </LI>
        </UL>
      </div>
    </Fragment>
  );
};
export default ChatHeader;
