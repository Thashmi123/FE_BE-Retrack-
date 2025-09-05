import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Badge,
} from "reactstrap";
import { H5 } from "../../../AbstractElements";
import { useMessage } from "../../../contexts/MessageContext";
import { useUser } from "../../../contexts/UserContext";
import UserService from "../../../Services/user.service";
import { Link } from "react-router-dom";
import ChatAppContext from "../../../_helper/Chat";

const RecentChatsWidget = () => {
  const { conversations, getUnreadCount } = useMessage();
  const { user } = useUser();
  const { allMemberss, currentUserr, getMeetingChatUser, startMeetingChat } =
    useContext(ChatAppContext);
  const [recentChats, setRecentChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const loggedInUser = user || currentUserr;

  // Load all users from UserMGT API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await UserService.getAllUsers();
        if (response.success && response.users) {
          setAllUsers(response.users);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (conversations && conversations.length > 0) {
      // Filter out meeting chat conversations and sort by most recent activity
      const meetingChatUser = getMeetingChatUser();
      const filteredConversations = conversations.filter((conv) => {
        if (!meetingChatUser) return true;
        // Filter out conversations with meeting chat user
        return !(
          (conv.userA === currentUserr?.id &&
            conv.userB === meetingChatUser.id) ||
          (conv.userB === currentUserr?.id && conv.userA === meetingChatUser.id)
        );
      });

      // Sort conversations by most recent activity and take first 5
      const sortedChats = [...filteredConversations]
        .sort(
          (a, b) =>
            new Date(b.CreatedAt || b.createdAt) -
            new Date(a.CreatedAt || a.createdAt)
        )
        .slice(0, 5);

      setRecentChats(sortedChats);
    } else {
      // No conversations available - show empty state
      setRecentChats([]);
    }
  }, [conversations, getMeetingChatUser, currentUserr]);

  const getOtherUserFullName = (conversation) => {
    const currentUserId = user?.id || user?.userId || user?.ID;

    // Determine which user is the "other" user in the conversation
    let otherUserId;
    if (conversation.userA === currentUserId) {
      otherUserId = conversation.userB;
    } else {
      otherUserId = conversation.userA;
    }

    // Find the user data from the loaded users
    const otherUser = allUsers.find(
      (user) =>
        user.UserId === otherUserId ||
        user.id === otherUserId ||
        user.ID === otherUserId
    );

    if (otherUser) {
      // Return first and last name from the user data
      const firstName = otherUser.FirstName || otherUser.firstName || "";
      const lastName = otherUser.LastName || otherUser.lastName || "";
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      // Fallback to name field
      return otherUser.Name || otherUser.name || "Unknown User";
    }

    // Fallback to conversation data if user not found in API
    if (conversation.userA === currentUserId) {
      const firstName = conversation.userBFirstName || "";
      const lastName = conversation.userBLastName || "";
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      return conversation.userBName || "Unknown User";
    } else {
      const firstName = conversation.userAFirstName || "";
      const lastName = conversation.userALastName || "";
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
      return conversation.userAName || "Unknown User";
    }
  };

  const getLastMessagePreview = (conversationId) => {
    // This would typically come from the last message in the conversation
    // For now, we'll show a placeholder
    return "Click to view conversation...";
  };

  return (
    <Card className="recent-chats-widget">
      <CardHeader className="card-no-border bg-fluent-primary text-white">
        <div className="header-top">
          <H5 className="text-white mb-0">
            <i className="fa fa-comments me-2"></i>Recent Chats
          </H5>
          <Link to="/app/chat-app/chats" className="btn btn-sm btn-light">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {loading ? (
          <div className="text-center py-3">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading conversations...</p>
          </div>
        ) : recentChats.length > 0 ? (
          <div
            className="recent-chats-list"
            style={{ maxHeight: "350px", overflowY: "auto" }}
          >
            {recentChats.map((conversation, index) => {
              const unreadCount = getUnreadCount
                ? getUnreadCount(conversation.id)
                : 0;
              const otherUserName = getOtherUserFullName(conversation);
              const avatarColors = [
                "bg-fluent-primary",
                "bg-fluent-success",
                "bg-fluent-warning",
                "bg-fluent-neutral",
                "bg-fluent-primary",
              ];
              const avatarColor = avatarColors[index % avatarColors.length];

              const handleChatClick = () => {
                // Handle regular chat navigation
                // You might want to implement navigation to the specific chat
                console.log("Navigate to chat:", conversation.id);
              };

              return (
                <div
                  key={conversation.id}
                  className="chat-item d-flex justify-content-between align-items-center p-3 border-bottom"
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    borderRadius: "8px",
                    margin: "2px 0",
                  }}
                  onClick={handleChatClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                    e.currentTarget.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="avatar-sm me-3 position-relative">
                      <div
                        className={`avatar-title ${avatarColor} rounded-circle text-white fw-bold`}
                      >
                        {otherUserName.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className="position-absolute bottom-0 end-0 bg-fluent-success rounded-circle"
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid white",
                        }}
                      ></div>
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold text-body">
                        {otherUserName}
                      </h6>
                      <p className="mb-0 text-muted small">
                        {getLastMessagePreview(conversation.id)}
                      </p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <Badge color="danger" pill className="pulse-animation">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mb-3">
              <i className="fa fa-comments fa-3x text-muted"></i>
            </div>
            <p className="text-muted">No recent conversations found</p>
            <p className="text-muted small">
              Start a conversation to see it here
            </p>
            <Link to="/app/chat-app/chats" className="btn btn-primary">
              <i className="fa fa-plus me-2"></i>Start Chatting
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentChatsWidget;
