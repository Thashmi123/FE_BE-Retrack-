import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Badge,
  ListGroup,
  ListGroupItem,
  Spinner,
  Alert,
  Button,
} from "reactstrap";
import { Users, Clock, CheckCircle, XCircle } from "react-feather";
import MeetingService from "../../../Services/meeting.service";

const MeetingAttendance = ({ meetingId, meetingTitle, onClose }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (meetingId) {
      loadAttendanceData();
    }
  }, [meetingId]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MeetingService.getMeetingAttendance(meetingId);
      setAttendanceData(response.data);
    } catch (err) {
      console.error("Error loading attendance data:", err);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return <Badge color="success">Present</Badge>;
      case "absent":
        return <Badge color="danger">Absent</Badge>;
      case "late":
        return <Badge color="warning">Late</Badge>;
      case "left_early":
        return <Badge color="info">Left Early</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner color="primary" />
        <p className="mt-2">Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger">
        {error}
        <Button color="link" onClick={loadAttendanceData} className="p-0 ms-2">
          Retry
        </Button>
      </Alert>
    );
  }

  if (!attendanceData) {
    return (
      <Alert color="info">No attendance data available for this meeting.</Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            <Users className="me-2" size={20} />
            Meeting Attendance
          </h5>
          <small className="text-muted">{meetingTitle}</small>
        </div>
        {onClose && (
          <Button color="link" onClick={onClose} className="p-0">
            ×
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {/* Summary Statistics */}
        <Row className="mb-4">
          <Col md={3}>
            <div className="text-center">
              <h4 className="text-primary">
                {attendanceData.TotalParticipants}
              </h4>
              <small className="text-muted">Total Participants</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h4 className="text-success">{attendanceData.PresentCount}</h4>
              <small className="text-muted">Present</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h4 className="text-danger">{attendanceData.AbsentCount}</h4>
              <small className="text-muted">Absent</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center">
              <h4 className="text-info">
                {attendanceData.PresentCount > 0
                  ? Math.round(
                      (attendanceData.PresentCount /
                        attendanceData.TotalParticipants) *
                        100
                    )
                  : 0}
                %
              </h4>
              <small className="text-muted">Attendance Rate</small>
            </div>
          </Col>
        </Row>

        {/* Participants List */}
        <div>
          <h6 className="mb-3">Participants List</h6>
          {attendanceData.Participants &&
          attendanceData.Participants.length > 0 ? (
            <ListGroup>
              {attendanceData.Participants.map((participant, index) => (
                <ListGroupItem
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {participant.Status === "present" ? (
                        <CheckCircle className="text-success" size={20} />
                      ) : (
                        <XCircle className="text-danger" size={20} />
                      )}
                    </div>
                    <div>
                      <div className="fw-bold">
                        {participant.UserName || "Unknown User"}
                      </div>
                      <small className="text-muted">
                        {participant.UserEmail}
                      </small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div>{getStatusBadge(participant.Status)}</div>
                    <small className="text-muted">
                      {participant.JoinTime && (
                        <div>
                          <Clock size={12} className="me-1" />
                          Joined: {participant.JoinTime}
                        </div>
                      )}
                      {participant.Duration > 0 && (
                        <div>
                          Duration: {formatDuration(participant.Duration)}
                        </div>
                      )}
                    </small>
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <Alert color="info">No participants found for this meeting.</Alert>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default MeetingAttendance;
