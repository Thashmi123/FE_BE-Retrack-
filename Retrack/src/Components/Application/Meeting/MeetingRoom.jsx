import React, { Fragment, useState, useEffect } from "react";
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
  ListGroup,
  ListGroupItem,
  Badge,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Search,
  Filter,
} from "react-feather";
import MeetingService from "../../../Services/meeting.service";
import EnhancedMeetingRoom from "./EnhancedMeetingRoom";
import MeetingAttendance from "./MeetingAttendance";

const MeetingRoom = () => {
  const [meeting, setMeeting] = useState(null);
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isInMeeting, setIsInMeeting] = useState(false);

  // New state for meeting selection
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, upcoming, ongoing, past
  const [activeTab, setActiveTab] = useState("1");
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Attendance tracking state
  const [showAttendance, setShowAttendance] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load meetings on component mount
  useEffect(() => {
    loadMeetings();
    // Get current user ID from localStorage or context
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUserId(user.UserId || user.userId);
  }, []);

  const loadMeetings = async () => {
    try {
      setMeetingsLoading(true);
      setError(null); // Clear previous errors
      const response = await MeetingService.getAllMeetings();
      console.log("Meetings API response:", response);
      console.log("Response data:", response?.data);
      console.log("Response status:", response?.status);

      // Handle different possible response structures
      let meetingsData = [];

      if (response?.data) {
        // Check if data is an array or has a nested array
        if (Array.isArray(response.data)) {
          meetingsData = response.data;
        } else if (
          response.data.Meeting &&
          Array.isArray(response.data.Meeting)
        ) {
          // Handle the actual API response structure: { Count: 2, Meeting: [...] }
          meetingsData = response.data.Meeting;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          meetingsData = response.data.data;
        } else if (
          response.data.meetings &&
          Array.isArray(response.data.meetings)
        ) {
          meetingsData = response.data.meetings;
        } else if (
          response.data.results &&
          Array.isArray(response.data.results)
        ) {
          meetingsData = response.data.results;
        } else {
          console.warn("Unexpected response structure:", response.data);
          meetingsData = [];
        }
      }

      console.log("Processed meetings data:", meetingsData);
      setMeetings(meetingsData);

      if (meetingsData.length === 0) {
        setError(
          "No meetings found. Please create a meeting first or check your connection."
        );
      }
    } catch (err) {
      console.error("Error loading meetings:", err);
      setError(
        `Failed to load meetings: ${
          err.message || "Please check your connection and try again."
        }`
      );
      setMeetings([]);
    } finally {
      setMeetingsLoading(false);
    }
  };

  // Filter meetings based on search term and status
  const getFilteredMeetings = () => {
    // Ensure meetings is always an array
    if (!Array.isArray(meetings)) {
      console.warn("Meetings is not an array:", meetings);
      return [];
    }

    let filtered = meetings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((meeting) => {
        if (!meeting || typeof meeting !== "object") return false;
        return (
          (meeting.Title?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (meeting.Location?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (meeting.ID?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (meeting.MeetingId?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
        );
      });
    }

    // Filter by status
    const now = new Date();
    filtered = filtered.filter((meeting) => {
      if (!meeting || typeof meeting !== "object") return false;

      try {
        const meetingDate = new Date(meeting.Date);
        const startTime = new Date(`${meeting.Date} ${meeting.StartTime}`);
        const endTime = new Date(`${meeting.Date} ${meeting.EndTime}`);

        // Check if dates are valid
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return filterStatus === "all"; // Include invalid dates only if showing all
        }

        switch (filterStatus) {
          case "upcoming":
            return startTime > now;
          case "ongoing":
            return startTime <= now && endTime >= now;
          case "past":
            return endTime < now;
          default:
            return true;
        }
      } catch (error) {
        console.warn("Error processing meeting date:", meeting, error);
        return filterStatus === "all"; // Include meetings with date errors only if showing all
      }
    });

    return filtered;
  };

  const getMeetingStatus = (meeting) => {
    if (!meeting || typeof meeting !== "object") {
      return { status: "unknown", color: "secondary", text: "Unknown" };
    }

    try {
      const now = new Date();
      const startTime = new Date(`${meeting.Date} ${meeting.StartTime}`);
      const endTime = new Date(`${meeting.Date} ${meeting.EndTime}`);

      // Check if dates are valid
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return { status: "unknown", color: "secondary", text: "Unknown" };
      }

      if (startTime > now) {
        return { status: "upcoming", color: "primary", text: "Upcoming" };
      } else if (startTime <= now && endTime >= now) {
        return { status: "ongoing", color: "success", text: "Ongoing" };
      } else {
        return { status: "past", color: "secondary", text: "Past" };
      }
    } catch (error) {
      console.warn("Error getting meeting status:", meeting, error);
      return { status: "unknown", color: "secondary", text: "Unknown" };
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!meetingId) {
      setError("Please enter a meeting ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Searching for meeting with ID:", meetingId);
      const response = await MeetingService.getMeetingById(meetingId);
      console.log("Meeting by ID response:", response);

      // Handle different possible response structures
      let meetingData = null;

      if (response?.data) {
        if (
          response.data &&
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          meetingData = response.data;
        } else if (
          response.data.data &&
          typeof response.data.data === "object"
        ) {
          meetingData = response.data.data;
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          meetingData = response.data[0]; // Take first meeting if array
        }
      }

      console.log("Processed meeting data:", meetingData);

      if (meetingData) {
        setMeeting(meetingData);
        setSelectedMeeting(meetingData);
        setSuccess("Meeting found! Opening in new tab...");
        // Automatically start the meeting after finding it
        setTimeout(() => {
          const meetingId = meetingData.MeetingId || meetingData.ID;
          const meetingUrl = `${window.location.origin}/meeting/${meetingId}`;
          window.open(meetingUrl, "_blank");
        }, 1000); // Small delay to show success message
      } else {
        setError(
          `Meeting with ID "${meetingId}" not found. Please check the meeting ID and try again.`
        );
      }
    } catch (err) {
      console.error("Error finding meeting:", err);

      // Provide more specific error messages based on the error type
      if (err.response?.status === 404) {
        setError(
          `Meeting with ID "${meetingId}" not found. Please check the meeting ID.`
        );
      } else if (err.response?.status === 400) {
        setError("Invalid meeting ID format. Please check the meeting ID.");
      } else if (err.code === "NETWORK_ERROR" || !navigator.onLine) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setError(
          `Failed to find meeting: ${
            err.message || "Please check the meeting ID and try again."
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeeting = async (selectedMeeting) => {
    setSelectedMeeting(selectedMeeting);
    setMeeting(selectedMeeting);
    setMeetingId(selectedMeeting.MeetingId || selectedMeeting.ID);
    setSuccess(`Selected meeting: ${selectedMeeting.Title}`);

    // Automatically track attendance when meeting is selected
    await trackMeetingJoin(selectedMeeting);
  };

  // Track when user joins a meeting
  const trackMeetingJoin = async (meeting) => {
    if (!currentUserId) {
      console.warn("No current user ID available for attendance tracking");
      return;
    }

    try {
      const attendanceData = {
        MeetingId: meeting.MeetingId || meeting.ID,
        UserId: currentUserId,
        UserName: meeting.UserName || "Unknown User",
        UserEmail: meeting.UserEmail || "",
      };

      await MeetingService.joinMeeting(attendanceData);
      console.log("Attendance tracked for meeting join");
    } catch (error) {
      console.error("Error tracking meeting join:", error);
      // Don't show error to user as this is background tracking
    }
  };

  // Track when user leaves a meeting
  const trackMeetingLeave = async (meetingId) => {
    if (!currentUserId || !meetingId) {
      return;
    }

    try {
      const leaveData = {
        MeetingId: meetingId,
        UserId: currentUserId,
        Date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      };

      await MeetingService.leaveMeeting(leaveData);
      console.log("Attendance tracked for meeting leave");
    } catch (error) {
      console.error("Error tracking meeting leave:", error);
    }
  };

  const handleStartMeeting = () => {
    if (selectedMeeting) {
      const meetingId = selectedMeeting.MeetingId || selectedMeeting.ID;
      const meetingUrl = `${window.location.origin}/meeting/${meetingId}`;

      // Redirect to new tab with meeting URL
      window.open(meetingUrl, "_blank");
      setSuccess("Meeting opened in new tab!");
    } else {
      setError("Please select a meeting first");
    }
  };

  const handleLeaveMeeting = async () => {
    // Track attendance when leaving
    if (selectedMeeting) {
      await trackMeetingLeave(selectedMeeting.MeetingId || selectedMeeting.ID);
    }

    setIsInMeeting(false);
    setMeeting(null);
    setMeetingId("");
    setSelectedMeeting(null);
    setSuccess("You have left the meeting.");
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Meeting Room"
        parent="Meeting"
        title="Video Conference"
      />
      <Container fluid={true}>
        {error && <Alert color="danger">{error}</Alert>}
        {success && <Alert color="success">{success}</Alert>}

        {!isInMeeting ? (
          <div>
            <Nav tabs className="nav-tabs-custom">
              <NavItem>
                <NavLink
                  className={activeTab === "1" ? "active" : ""}
                  onClick={() => setActiveTab("1")}
                  style={{ cursor: "pointer" }}
                >
                  <Video className="me-2" size={16} />
                  Browse Meetings
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === "2" ? "active" : ""}
                  onClick={() => setActiveTab("2")}
                  style={{ cursor: "pointer" }}
                >
                  <Search className="me-2" size={16} />
                  Join by ID
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
              {/* Browse Meetings Tab */}
              <TabPane tabId="1">
                <Row>
                  <Col md="12">
                    <Card>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4 className="mb-0">Available Meetings</h4>
                          <div className="d-flex gap-2">
                            <Button
                              color="outline-info"
                              size="sm"
                              onClick={() => {
                                console.log(
                                  "Current meetings state:",
                                  meetings
                                );
                                console.log(
                                  "Meetings length:",
                                  meetings.length
                                );
                                console.log(
                                  "Filtered meetings:",
                                  getFilteredMeetings()
                                );
                              }}
                            >
                              Debug
                            </Button>
                            <Button
                              color="outline-primary"
                              size="sm"
                              onClick={loadMeetings}
                              disabled={meetingsLoading}
                            >
                              {meetingsLoading ? (
                                <Spinner size="sm" className="me-2" />
                              ) : (
                                <Filter className="me-2" size={16} />
                              )}
                              Refresh
                            </Button>
                          </div>
                        </div>

                        {/* Search and Filter Controls */}
                        <Row className="mb-4">
                          <Col md="6">
                            <FormGroup>
                              <Label for="searchTerm">Search Meetings</Label>
                              <Input
                                type="text"
                                id="searchTerm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title, location, or ID..."
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label for="filterStatus">Filter by Status</Label>
                              <Input
                                type="select"
                                id="filterStatus"
                                value={filterStatus}
                                onChange={(e) =>
                                  setFilterStatus(e.target.value)
                                }
                              >
                                <option value="all">All Meetings</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="past">Past</option>
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>

                        {/* Meetings List */}
                        {meetingsLoading ? (
                          <div className="text-center py-4">
                            <Spinner size="lg" />
                            <p className="mt-2">Loading meetings...</p>
                          </div>
                        ) : (
                          <ListGroup>
                            {getFilteredMeetings().length === 0 ? (
                              <ListGroupItem className="text-center py-4">
                                <Video size={48} className="text-muted mb-3" />
                                <h5>No meetings found</h5>
                                <p className="text-muted">
                                  {searchTerm || filterStatus !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : meetings.length === 0
                                    ? "No meetings are available. Please check your connection or create a meeting first."
                                    : "No meetings match your current filter criteria"}
                                </p>
                                {meetings.length === 0 && (
                                  <Button
                                    color="outline-primary"
                                    size="sm"
                                    onClick={loadMeetings}
                                    className="mt-2"
                                  >
                                    <Filter className="me-2" size={16} />
                                    Retry Loading Meetings
                                  </Button>
                                )}
                              </ListGroupItem>
                            ) : (
                              getFilteredMeetings().map((meeting) => {
                                const status = getMeetingStatus(meeting);
                                return (
                                  <ListGroupItem
                                    key={meeting.MeetingId || meeting.ID}
                                    className={`d-flex justify-content-between align-items-center ${
                                      selectedMeeting?.MeetingId ===
                                        meeting.MeetingId ||
                                      selectedMeeting?.ID === meeting.ID
                                        ? "bg-light border-primary"
                                        : ""
                                    }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSelectMeeting(meeting)}
                                  >
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center mb-2">
                                        <h6 className="mb-0 me-3">
                                          {meeting?.Title || "Untitled Meeting"}
                                        </h6>
                                        <Badge color={status.color} pill>
                                          {status.text}
                                        </Badge>
                                      </div>
                                      <div className="d-flex flex-wrap align-items-center text-muted small">
                                        <span className="me-3">
                                          <Calendar
                                            size={14}
                                            className="me-1"
                                          />
                                          {meeting?.Date || "No date"}
                                        </span>
                                        <span className="me-3">
                                          <Clock size={14} className="me-1" />
                                          {meeting?.StartTime ||
                                            "No start time"}{" "}
                                          - {meeting?.EndTime || "No end time"}
                                        </span>
                                        <span className="me-3">
                                          <MapPin size={14} className="me-1" />
                                          {meeting?.Location || "Virtual Room"}
                                        </span>
                                        {meeting?.Participants && (
                                          <span>
                                            <Users size={14} className="me-1" />
                                            {meeting.Participants}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <div className="small text-muted mb-1">
                                        ID:{" "}
                                        {meeting?.MeetingId ||
                                          meeting?.ID ||
                                          "No ID"}
                                      </div>
                                      <Button
                                        color="primary"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectMeeting(meeting);
                                        }}
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  </ListGroupItem>
                                );
                              })
                            )}
                          </ListGroup>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </TabPane>

              {/* Join by ID Tab */}
              <TabPane tabId="2">
                <Row className="justify-content-center">
                  <Col md="6">
                    <Card>
                      <CardBody>
                        <h4 className="text-center mb-4">Join Meeting by ID</h4>
                        <Form onSubmit={handleJoinMeeting}>
                          <FormGroup>
                            <Label for="meetingId">Meeting ID</Label>
                            <Input
                              type="text"
                              name="meetingId"
                              id="meetingId"
                              value={meetingId}
                              onChange={(e) => setMeetingId(e.target.value)}
                              placeholder="Enter meeting ID"
                              required
                            />
                          </FormGroup>

                          <div className="d-grid">
                            <Button
                              color="primary"
                              type="submit"
                              disabled={loading}
                            >
                              {loading ? "Joining..." : "Join Meeting"}
                            </Button>
                          </div>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>

            {/* Selected Meeting Details */}
            {selectedMeeting && (
              <Row className="mt-4">
                <Col md="12">
                  <Card className="border-primary">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Selected Meeting</h5>
                        <Badge color="primary" pill>
                          Ready to Join
                        </Badge>
                      </div>
                      <Row>
                        <Col md="8">
                          <div className="meeting-details">
                            <h6 className="text-primary">
                              {selectedMeeting.Title}
                            </h6>
                            <div className="d-flex flex-wrap align-items-center text-muted small mb-3">
                              <span className="me-3">
                                <Calendar size={14} className="me-1" />
                                {selectedMeeting.Date}
                              </span>
                              <span className="me-3">
                                <Clock size={14} className="me-1" />
                                {selectedMeeting.StartTime} -{" "}
                                {selectedMeeting.EndTime}
                              </span>
                              <span className="me-3">
                                <MapPin size={14} className="me-1" />
                                {selectedMeeting.Location || "Virtual Room"}
                              </span>
                              {selectedMeeting.Participants && (
                                <span>
                                  <Users size={14} className="me-1" />
                                  {selectedMeeting.Participants}
                                </span>
                              )}
                            </div>
                            <p className="text-muted small mb-0">
                              Meeting ID:{" "}
                              <code>
                                {selectedMeeting.MeetingId ||
                                  selectedMeeting.ID}
                              </code>
                            </p>
                          </div>
                        </Col>
                        <Col md="4" className="text-end">
                          <div className="d-grid gap-2">
                            <Button
                              color="success"
                              size="lg"
                              onClick={handleStartMeeting}
                            >
                              <Video className="me-2" size={20} />
                              Start Meeting
                            </Button>
                            <Button
                              color="info"
                              size="sm"
                              onClick={() => setShowAttendance(!showAttendance)}
                            >
                              <Users className="me-2" size={16} />
                              {showAttendance ? "Hide" : "Show"} Attendance
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Attendance Display */}
            {showAttendance && selectedMeeting && (
              <Row className="mt-4">
                <Col md="12">
                  <MeetingAttendance
                    meetingId={selectedMeeting.MeetingId || selectedMeeting.ID}
                    meetingTitle={selectedMeeting.Title}
                    onClose={() => setShowAttendance(false)}
                  />
                </Col>
              </Row>
            )}
          </div>
        ) : (
          <EnhancedMeetingRoom
            meetingId={meetingId}
            meetingData={meeting}
            onLeaveMeeting={handleLeaveMeeting}
          />
        )}
      </Container>

      <style jsx>{`
        .nav-tabs-custom .nav-link {
          border: 1px solid transparent;
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          color: var(--bs-body-color);
          background-color: transparent;
          border-color: transparent;
        }

        .nav-tabs-custom .nav-link:hover {
          border-color: var(--bs-border-color);
          color: var(--bs-body-color);
        }

        .nav-tabs-custom .nav-link.active {
          color: var(--bs-body-color);
          background-color: var(--bs-body-bg);
          border-color: var(--bs-border-color);
        }

        .nav-tabs-custom {
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 1rem;
        }

        .meeting-details h6 {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .meeting-details code {
          background-color: var(--bs-light);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
      `}</style>
    </Fragment>
  );
};

export default MeetingRoom;
