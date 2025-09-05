import React, { Fragment, useState, useEffect, useContext } from "react";
import { Breadcrumbs } from "../../../AbstractElements";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
} from "reactstrap";
import MeetingService from "../../../Services/meeting.service";
import ChatAppContext from "../../../_helper/Chat";
import ChatService from "../../../Services/chat.service";
import UserService from "../../../Services/user.service";

const MeetingChat = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Chat related states
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [participants, setParticipants] = useState([]);

  // Get chat context
  const chatContext = useContext(ChatAppContext);
  const { chatss, selectedUserr, sendMessageAsyn, currentUserr } =
    chatContext || {};

  // Load meetings on component mount
  useEffect(() => {
    loadMeetings();
    loadAllConversations();
    loadAllUsers();
  }, []);

  // Load chat messages when a meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      loadChatMessages();
      loadMeetingParticipants();
    }
  }, [selectedMeeting]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await MeetingService.findAllMeetings();
      // The API returns an object with a "data" property containing the array
      // The array is under response.data.Meeting
      const meetingsData = response.data.Meeting || [];
      setMeetings(meetingsData);
      setError(null);
    } catch (err) {
      setError("Failed to load meetings");
      console.error("Error loading meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllConversations = async () => {
    try {
      if (currentUserr?.id) {
        const response = await ChatService.getConversationsForUser(
          currentUserr.id
        );
        const allConversations = response.conversations || [];

        // Filter to show only meeting conversations
        const meetingConversations =
          ChatService.filterMeetingConversations(allConversations);
        setAllConversations(meetingConversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      if (response.success) {
        setParticipants(response.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadMeetingParticipants = () => {
    if (selectedMeeting?.Participants) {
      // Parse participants from the meeting data
      const participantNames = selectedMeeting.Participants.split(",").map(
        (name) => name.trim()
      );
      // You could match these with actual user data here
      console.log("Meeting participants:", participantNames);
    }
  };

  const loadChatMessages = async () => {
    try {
      if (!selectedMeeting?.MeetingId) {
        setChatMessages([]);
        return;
      }

      // Load messages specific to this meeting
      const response = await ChatService.getMeetingMessages(
        selectedMeeting.MeetingId
      );
      const messages = response.messages || [];

      // Transform messages to match frontend format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        sender: msg.senderName || `User ${msg.senderId}`,
        text: msg.text,
        time: ChatService.formatMessageTime(msg.sentAt),
        senderId: msg.senderId,
        meetingId: msg.meetingId,
        meetingTitle: msg.meetingTitle,
      }));

      // Sort messages by timestamp (oldest first)
      transformedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));

      setChatMessages(transformedMessages);
    } catch (error) {
      console.error("Error loading chat messages:", error);
      // Fallback to sample data
      const sampleMessages = [
        {
          id: 1,
          sender: "You",
          text: "Hello everyone!",
          time: "10:30 AM",
          meetingId: selectedMeeting?.MeetingId,
          meetingTitle: selectedMeeting?.Title,
        },
        {
          id: 2,
          sender: "John Doe",
          text: "Hi there!",
          time: "10:31 AM",
          meetingId: selectedMeeting?.MeetingId,
          meetingTitle: selectedMeeting?.Title,
        },
        {
          id: 3,
          sender: "Jane Smith",
          text: "Good morning!",
          time: "10:32 AM",
          meetingId: selectedMeeting?.MeetingId,
          meetingTitle: selectedMeeting?.Title,
        },
      ];
      setChatMessages(sampleMessages);
    }
  };

  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setSuccess(`Selected meeting: ${meeting.Title}`);
  };

  const handleJoinMeeting = () => {
    if (selectedMeeting) {
      setSuccess(`Joined meeting: ${selectedMeeting.Title}`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (
      !messageInput.trim() ||
      !currentUserr?.id ||
      !selectedMeeting?.MeetingId
    )
      return;

    try {
      // Send message to meeting chat user (USR-6) with meeting context
      await ChatService.sendMessage(
        currentUserr.id,
        "USR-6",
        messageInput,
        selectedMeeting.MeetingId,
        selectedMeeting.Title
      );

      // Add message to local chat immediately
      const newMessage = {
        id: Date.now(), // Temporary ID
        sender: currentUserr.name || "You",
        text: messageInput,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderId: currentUserr.id,
        meetingId: selectedMeeting.MeetingId,
        meetingTitle: selectedMeeting.Title,
      };

      setChatMessages([...chatMessages, newMessage]);
      setMessageInput("");

      // Reload messages to get the latest from server
      setTimeout(() => {
        loadChatMessages();
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Meeting Chat"
        parent="Meeting"
        title="Collaboration"
      />
      <Container fluid={true}>
        {error && <Alert color="danger">{error}</Alert>}

        {success && <Alert color="success">{success}</Alert>}

        <Row>
          <Col md="4">
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Meetings</h5>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={loadMeetings}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center">
                    <p>Loading meetings...</p>
                  </div>
                ) : (
                  <div className="meeting-list">
                    {meetings.map((meeting) => (
                      <div
                        key={meeting.MeetingId}
                        className={`meeting-item p-3 mb-2 rounded cursor-pointer ${
                          selectedMeeting?.MeetingId === meeting.MeetingId
                            ? "bg-primary text-white"
                            : "bg-light text-dark"
                        }`}
                        onClick={() => handleSelectMeeting(meeting)}
                      >
                        <h6 className="mb-1">{meeting.Title}</h6>
                        <p className="mb-1 small">
                          {meeting.Date} at {meeting.StartTime}
                        </p>
                        <p className="mb-0 small">
                          {meeting.Participants || "No participants listed"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {meetings.length === 0 && !loading && (
                  <div className="text-center">
                    <p>No meetings found.</p>
                  </div>
                )}

                {selectedMeeting && (
                  <div className="mt-3">
                    <Button
                      color="success"
                      className="w-100"
                      onClick={handleJoinMeeting}
                    >
                      Join Meeting
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col md="8">
            <Card>
              <CardBody>
                {selectedMeeting ? (
                  <Fragment>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4>{selectedMeeting.Title}</h4>
                        <p className="mb-0 text-muted">
                          {selectedMeeting.Date} at {selectedMeeting.StartTime}{" "}
                          - {selectedMeeting.EndTime}
                        </p>
                      </div>
                      <Button
                        color="primary"
                        onClick={() => setSelectedMeeting(null)}
                      >
                        Back to Meetings
                      </Button>
                    </div>

                    <Row>
                      <Col md="8">
                        <div
                          className="chat-container border rounded p-3"
                          style={{ height: "400px", overflowY: "auto" }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Meeting Chat</h5>
                            <div className="text-muted small">
                              <i className="icofont-ui-calendar me-1"></i>
                              {selectedMeeting.Title}
                            </div>
                          </div>
                          <div className="chat-messages">
                            {chatMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`message mb-3 ${
                                  message.sender === "You"
                                    ? "text-end"
                                    : "text-start"
                                }`}
                              >
                                <div
                                  className={`d-inline-block p-2 rounded ${
                                    message.sender === "You"
                                      ? "bg-primary text-white"
                                      : "bg-light"
                                  }`}
                                  style={{ maxWidth: "80%" }}
                                >
                                  <div className="fw-bold small">
                                    {message.sender}
                                    {message.meetingTitle && (
                                      <span className="ms-2 badge bg-secondary">
                                        {message.meetingTitle}
                                      </span>
                                    )}
                                  </div>
                                  <div>{message.text}</div>
                                  <div className="small text-muted">
                                    {message.time}
                                    {message.meetingId && (
                                      <span className="ms-2">
                                        • Meeting: {message.meetingId}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Form onSubmit={handleSendMessage} className="mt-3">
                          <FormGroup>
                            <Input
                              type="text"
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              placeholder="Type your message..."
                              required
                            />
                          </FormGroup>
                          <div className="d-flex justify-content-end">
                            <Button color="primary" type="submit">
                              Send
                            </Button>
                          </div>
                        </Form>
                      </Col>

                      <Col md="4">
                        <div
                          className="participants-container border rounded p-3"
                          style={{ height: "400px", overflowY: "auto" }}
                        >
                          <h5>Meeting Participants</h5>
                          <div className="participants-list">
                            {selectedMeeting?.Participants ? (
                              selectedMeeting.Participants.split(",").map(
                                (participant, index) => (
                                  <div
                                    key={index}
                                    className="participant d-flex align-items-center mb-2"
                                  >
                                    <div
                                      className="bg-primary rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold"
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {participant
                                        .trim()
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                    <span>{participant.trim()}</span>
                                    <Badge
                                      color="success"
                                      className="ms-auto"
                                      pill
                                    >
                                      Online
                                    </Badge>
                                  </div>
                                )
                              )
                            ) : (
                              <p className="text-muted">
                                No participants listed
                              </p>
                            )}
                          </div>

                          <div className="mt-4">
                            <h6>
                              All Conversations ({allConversations.length})
                            </h6>
                            <div
                              className="conversations-list"
                              style={{ maxHeight: "150px", overflowY: "auto" }}
                            >
                              {allConversations.length > 0 ? (
                                allConversations.map((conversation) => {
                                  const meetingId =
                                    ChatService.getMeetingIdFromConversation(
                                      conversation
                                    );
                                  const meetingTitle =
                                    meetings.find(
                                      (m) => m.MeetingId === meetingId
                                    )?.Title || `Meeting ${meetingId}`;

                                  return (
                                    <div
                                      key={conversation.id}
                                      className="conversation-item p-2 mb-2 bg-light rounded"
                                    >
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="small fw-bold">
                                          <i className="icofont-ui-calendar me-1"></i>
                                          {meetingTitle}
                                        </span>
                                        <Badge color="info" pill>
                                          {conversation.messageCount || 0}
                                        </Badge>
                                      </div>
                                      <div className="small text-muted">
                                        Meeting ID: {meetingId}
                                      </div>
                                      <div className="small text-muted">
                                        {new Date(
                                          conversation.CreatedAt ||
                                            conversation.createdAt
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-muted small">
                                  No meeting conversations found
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <h6>Meeting Controls</h6>
                            <div className="d-flex justify-content-between">
                              <Button
                                color="light"
                                className="btn-air-light"
                                size="sm"
                              >
                                <i className="icofont-microphone"></i>
                              </Button>
                              <Button
                                color="light"
                                className="btn-air-light"
                                size="sm"
                              >
                                <i className="icofont-ui-video"></i>
                              </Button>
                              <Button
                                color="light"
                                className="btn-air-light"
                                size="sm"
                              >
                                <i className="icofont-ui-settings"></i>
                              </Button>
                              <Button
                                color="light"
                                className="btn-air-light"
                                size="sm"
                              >
                                <i className="icofont-share"></i>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Fragment>
                ) : (
                  <div className="text-center py-5">
                    <i
                      className="icofont-ui-calendar"
                      style={{ fontSize: "4rem", color: "#6c757d" }}
                    ></i>
                    <h4 className="mt-3">Select a Meeting</h4>
                    <p className="text-muted">
                      Choose a meeting from the list to start chatting and
                      collaborating
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default MeetingChat;
