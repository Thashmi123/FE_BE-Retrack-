import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Badge,
  ListGroup,
  ListGroupItem,
  Avatar,
  Spinner,
} from "reactstrap";
import {
  MessageSquare,
  Send,
  Users,
  X,
  Minimize2,
  Maximize2,
} from "react-feather";
import { useMessage } from "../../../contexts/MessageContext";
import { useUser } from "../../../contexts/UserContext";

const MeetingChat = ({
  isOpen,
  onClose,
  onMinimize,
  isMinimized = false,
  meetingId,
  participants = [],
  className = "",
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatBodyRef = useRef(null);

  const { currentMessages, sendMessage, setCurrentMessages, loading } =
    useMessage();

  const { user } = useUser();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Update unread count when chat is closed/minimized
  useEffect(() => {
    if (!isOpen || isMinimized) {
      setUnreadCount((prev) => prev + 1);
    } else {
      setUnreadCount(0);
    }
  }, [currentMessages, isOpen, isMinimized]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    const messageText = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      // Send message to meeting chat (using USR-6 as the meeting chat user)
      await sendMessage(
        user?.id || "current-user",
        "USR-6",
        messageText,
        meetingId
      );

      // Clear typing indicator
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message on error
      setMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      // In a real implementation, you'd emit a typing event to other participants
    }

    // Clear typing indicator after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getParticipantName = (senderId) => {
    if (senderId === user?.id) {
      return "You";
    }

    const participant = participants.find((p) => p.id === senderId);
    return participant?.name || `User ${senderId}`;
  };

  const getParticipantAvatar = (senderId) => {
    if (senderId === user?.id) {
      return user?.firstName?.charAt(0) || "Y";
    }

    const participant = participants.find((p) => p.id === senderId);
    return participant?.name?.charAt(0) || "U";
  };

  const getParticipantColor = (senderId) => {
    const colors = [
      "bg-primary",
      "bg-success",
      "bg-warning",
      "bg-info",
      "bg-danger",
      "bg-secondary",
      "bg-dark",
    ];
    const index = senderId.length % colors.length;
    return colors[index];
  };

  if (isMinimized) {
    return (
      <div className={`meeting-chat-minimized ${className}`}>
        <Button
          color="primary"
          className="chat-toggle-btn position-relative"
          onClick={onMinimize}
        >
          <MessageSquare size={20} />
          {unreadCount > 0 && (
            <Badge
              color="danger"
              className="position-absolute top-0 start-100 translate-middle rounded-pill"
              style={{ fontSize: "0.7rem" }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={`meeting-chat ${className}`}>
      <CardHeader className="d-flex justify-content-between align-items-center py-2">
        <div className="d-flex align-items-center">
          <MessageSquare size={18} className="me-2" />
          <h6 className="mb-0">Meeting Chat</h6>
          {participants.length > 0 && (
            <Badge color="light" className="ms-2">
              <Users size={12} className="me-1" />
              {participants.length}
            </Badge>
          )}
        </div>

        <div className="d-flex align-items-center">
          <Button
            color="link"
            size="sm"
            className="p-1 me-1"
            onClick={onMinimize}
          >
            <Minimize2 size={16} />
          </Button>
          <Button color="link" size="sm" className="p-1" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-0 d-flex flex-column" style={{ height: "400px" }}>
        {/* Messages Area */}
        <div
          ref={chatBodyRef}
          className="chat-messages flex-grow-1 p-3"
          style={{
            overflowY: "auto",
            maxHeight: "300px",
            minHeight: "200px",
          }}
        >
          {loading ? (
            <div className="text-center py-4">
              <Spinner size="sm" color="primary" />
              <p className="mt-2 mb-0 text-muted small">Loading messages...</p>
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="text-center py-4">
              <MessageSquare size={32} className="text-muted mb-2" />
              <p className="text-muted small">No messages yet</p>
              <p className="text-muted small">Start the conversation!</p>
            </div>
          ) : (
            <div className="messages-list">
              {currentMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`message-item d-flex mb-3 ${
                    msg.sender === user?.id
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <div
                    className={`message-content d-flex ${
                      msg.sender === user?.id ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`avatar-sm me-2 ${
                        msg.sender === user?.id ? "ms-2" : "me-2"
                      }`}
                    >
                      <div
                        className={`avatar-title ${getParticipantColor(
                          msg.sender
                        )} rounded-circle text-white fw-bold`}
                      >
                        {getParticipantAvatar(msg.sender)}
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`message-bubble ${
                        msg.sender === user?.id ? "sent" : "received"
                      }`}
                    >
                      <div className="message-header d-flex justify-content-between align-items-center mb-1">
                        <span className="sender-name small fw-semibold">
                          {getParticipantName(msg.sender)}
                        </span>
                        <span className="message-time small text-muted">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className="message-text">{msg.text}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="typing-indicator d-flex align-items-center">
                  <div className="avatar-sm me-2">
                    <div className="avatar-title bg-light rounded-circle text-muted fw-bold">
                      {user?.firstName?.charAt(0) || "Y"}
                    </div>
                  </div>
                  <div className="typing-bubble">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="chat-input p-3 border-top">
          <form onSubmit={handleSendMessage}>
            <div className="input-group">
              <Input
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isSending}
                className="border-0"
                style={{ resize: "none" }}
              />
              <Button
                type="submit"
                color="primary"
                disabled={!message.trim() || isSending}
                className="px-3"
              >
                {isSending ? <Spinner size="sm" /> : <Send size={16} />}
              </Button>
            </div>
          </form>
        </div>
      </CardBody>

      <style jsx>{`
        .meeting-chat {
          position: fixed;
          right: 20px;
          bottom: 20px;
          width: 350px;
          max-height: 500px;
          z-index: 1050;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-radius: 12px;
        }

        .meeting-chat-minimized {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 1050;
        }

        .chat-toggle-btn {
          border-radius: 50%;
          width: 56px;
          height: 56px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .message-bubble {
          max-width: 250px;
          padding: 8px 12px;
          border-radius: 18px;
          position: relative;
        }

        .message-bubble.sent {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-bubble.received {
          background: #f8f9fa;
          color: var(--bs-body-color);
          border-bottom-left-radius: 4px;
        }

        .sender-name {
          font-size: 0.75rem;
        }

        .message-time {
          font-size: 0.7rem;
        }

        .typing-indicator {
          margin-bottom: 1rem;
        }

        .typing-bubble {
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #6c757d;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chat-messages::-webkit-scrollbar {
          width: 4px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </Card>
  );
};

export default MeetingChat;
