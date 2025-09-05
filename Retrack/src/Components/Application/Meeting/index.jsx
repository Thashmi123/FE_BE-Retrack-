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
  FormGroup as FormGroupCheckbox,
  Input as CheckboxInput,
} from "reactstrap";
import MeetingService from "../../../Services/meeting.service";
import UserService from "../../../Services/user.service";

const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const [meetingForm, setMeetingForm] = useState({
    MeetingId: "",
    Title: "",
    Description: "",
    Date: "",
    StartTime: "",
    EndTime: "",
    Location: "",
    Participants: "",
  });

  useEffect(() => {
    loadMeetings();
    loadUsers();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await MeetingService.findAllMeetings();
      // The API returns an object with a "data" property containing the array
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

  const loadUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleParticipantChange = (userId, isChecked) => {
    if (isChecked) {
      setSelectedParticipants([...selectedParticipants, userId]);
    } else {
      setSelectedParticipants(
        selectedParticipants.filter((id) => id !== userId)
      );
    }
  };

  const getParticipantNames = () => {
    return selectedParticipants
      .map((userId) => {
        const user = users.find((u) => u.UserId === userId || u.id === userId);
        return user
          ? (user.FirstName + " " + user.LastName).trim() || user.Username
          : `User ${userId}`;
      })
      .join(", ");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingForm({
      ...meetingForm,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Update meeting form with selected participants
      const meetingData = {
        ...meetingForm,
        Participants: getParticipantNames(),
      };

      if (meetingForm.MeetingId) {
        // Update existing meeting
        await MeetingService.updateMeeting(meetingData);
      } else {
        // Create new meeting
        await MeetingService.createMeeting(meetingData);
      }

      // Reset form
      setMeetingForm({
        MeetingId: "",
        Title: "",
        Description: "",
        Date: "",
        StartTime: "",
        EndTime: "",
        Location: "",
        Participants: "",
      });
      setSelectedParticipants([]);

      // Reload meetings
      loadMeetings();
      setError(null);
    } catch (err) {
      setError("Failed to save meeting");
      console.error("Error saving meeting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting) => {
    setMeetingForm(meeting);

    // Parse existing participants and set selected participants
    if (meeting.Participants) {
      const participantNames = meeting.Participants.split(",").map((name) =>
        name.trim()
      );
      const participantIds = participantNames
        .map((name) => {
          const user = users.find((u) => {
            const fullName = (u.FirstName + " " + u.LastName).trim();
            return fullName === name || u.Username === name;
          });
          return user ? user.UserId || user.id : null;
        })
        .filter((id) => id !== null);

      setSelectedParticipants(participantIds);
    } else {
      setSelectedParticipants([]);
    }
  };

  const handleDelete = async (meetingId) => {
    try {
      setLoading(true);
      await MeetingService.deleteMeeting(meetingId);
      loadMeetings();
      setError(null);
    } catch (err) {
      setError("Failed to delete meeting");
      console.error("Error deleting meeting:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Meeting Management"
        parent="Meeting"
        title="Meeting List"
      />
      <Container fluid={true}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Row>
          <Col sm="12" md="6">
            <Card>
              <CardBody>
                <h4>
                  {meetingForm.MeetingId ? "Edit Meeting" : "Create Meeting"}
                </h4>
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="Title">Title</Label>
                    <Input
                      type="text"
                      name="Title"
                      id="Title"
                      value={meetingForm.Title}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="Description">Description</Label>
                    <Input
                      type="textarea"
                      name="Description"
                      id="Description"
                      value={meetingForm.Description}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="Date">Date</Label>
                    <Input
                      type="date"
                      name="Date"
                      id="Date"
                      value={meetingForm.Date}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="StartTime">Start Time</Label>
                        <Input
                          type="time"
                          name="StartTime"
                          id="StartTime"
                          value={meetingForm.StartTime}
                          onChange={handleInputChange}
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="EndTime">End Time</Label>
                        <Input
                          type="time"
                          name="EndTime"
                          id="EndTime"
                          value={meetingForm.EndTime}
                          onChange={handleInputChange}
                          required
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label for="Location">Location</Label>
                    <Input
                      type="text"
                      name="Location"
                      id="Location"
                      value={meetingForm.Location}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label for="Participants">Select Participants</Label>
                    <div
                      className="participants-checklist border rounded p-3"
                      style={{ maxHeight: "200px", overflowY: "auto" }}
                    >
                      {users.length > 0 ? (
                        users.map((user) => {
                          const userId = user.UserId || user.id;
                          const userName =
                            (user.FirstName + " " + user.LastName).trim() ||
                            user.Username ||
                            "Unknown User";
                          const isSelected =
                            selectedParticipants.includes(userId);

                          return (
                            <FormGroupCheckbox key={userId} check>
                              <CheckboxInput
                                type="checkbox"
                                id={`participant-${userId}`}
                                checked={isSelected}
                                onChange={(e) =>
                                  handleParticipantChange(
                                    userId,
                                    e.target.checked
                                  )
                                }
                              />
                              <Label
                                check
                                for={`participant-${userId}`}
                                className="ms-2"
                              >
                                {userName}
                                <small className="text-muted d-block">
                                  {user.Email || "No email"}
                                </small>
                              </Label>
                            </FormGroupCheckbox>
                          );
                        })
                      ) : (
                        <p className="text-muted">Loading users...</p>
                      )}
                    </div>
                    {selectedParticipants.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          Selected: {getParticipantNames()}
                        </small>
                      </div>
                    )}
                  </FormGroup>

                  <div className="d-flex justify-content-between">
                    <Button color="primary" type="submit" disabled={loading}>
                      {loading
                        ? "Saving..."
                        : meetingForm.MeetingId
                        ? "Update Meeting"
                        : "Create Meeting"}
                    </Button>
                    {meetingForm.MeetingId && (
                      <Button
                        color="secondary"
                        type="button"
                        onClick={() => {
                          setMeetingForm({
                            MeetingId: "",
                            Title: "",
                            Description: "",
                            Date: "",
                            StartTime: "",
                            EndTime: "",
                            Location: "",
                            Participants: "",
                          });
                          setSelectedParticipants([]);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          <Col sm="12" md="6">
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Meeting List</h4>
                  <Button
                    color="secondary"
                    onClick={loadMeetings}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                </div>

                {loading && meetings.length === 0 ? (
                  <div className="text-center">
                    <p>Loading meetings...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meetings.map((meeting) => (
                          <tr key={meeting.MeetingId}>
                            <td>{meeting.Title}</td>
                            <td>{meeting.Date}</td>
                            <td>
                              {meeting.StartTime} - {meeting.EndTime}
                            </td>
                            <td>
                              <Button
                                color="info"
                                size="sm"
                                className="me-1"
                                onClick={() => handleEdit(meeting)}
                              >
                                Edit
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => handleDelete(meeting.MeetingId)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {meetings.length === 0 && !loading && (
                  <div className="text-center">
                    <p>No meetings found.</p>
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

export default Meeting;
