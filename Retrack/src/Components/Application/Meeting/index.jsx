import React, { Fragment, useState, useEffect } from 'react';
import { Breadcrumbs } from '../../../AbstractElements';
import { Card, CardBody, Col, Container, Row, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import MeetingService from '../../../Services/meeting.service';

const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [meetingForm, setMeetingForm] = useState({
    MeetingId: '',
    Title: '',
    Description: '',
    Date: '',
    StartTime: '',
    EndTime: '',
    Location: '',
    Participants: ''
  });

  useEffect(() => {
    loadMeetings();
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
      setError('Failed to load meetings');
      console.error('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingForm({
      ...meetingForm,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (meetingForm.MeetingId) {
        // Update existing meeting
        await MeetingService.updateMeeting(meetingForm);
      } else {
        // Create new meeting
        await MeetingService.createMeeting(meetingForm);
      }
      // Reset form
      setMeetingForm({
        MeetingId: '',
        Title: '',
        Description: '',
        Date: '',
        StartTime: '',
        EndTime: '',
        Location: '',
        Participants: ''
      });
      // Reload meetings
      loadMeetings();
      setError(null);
    } catch (err) {
      setError('Failed to save meeting');
      console.error('Error saving meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting) => {
    setMeetingForm(meeting);
  };

  const handleDelete = async (meetingId) => {
    try {
      setLoading(true);
      await MeetingService.deleteMeeting(meetingId);
      loadMeetings();
      setError(null);
    } catch (err) {
      setError('Failed to delete meeting');
      console.error('Error deleting meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle='Meeting Management' parent='Meeting' title='Meeting List' />
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
                <h4>{meetingForm.MeetingId ? 'Edit Meeting' : 'Create Meeting'}</h4>
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
                    <Label for="Participants">Participants</Label>
                    <Input
                      type="text"
                      name="Participants"
                      id="Participants"
                      value={meetingForm.Participants}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  
                  <div className="d-flex justify-content-between">
                    <Button color="primary" type="submit" disabled={loading}>
                      {loading ? 'Saving...' : (meetingForm.MeetingId ? 'Update Meeting' : 'Create Meeting')}
                    </Button>
                    {meetingForm.MeetingId && (
                      <Button 
                        color="secondary" 
                        type="button" 
                        onClick={() => setMeetingForm({
                          MeetingId: '',
                          Title: '',
                          Description: '',
                          Date: '',
                          StartTime: '',
                          EndTime: '',
                          Location: '',
                          Participants: ''
                        })}
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
                  <Button color="secondary" onClick={loadMeetings} disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh'}
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
                            <td>{meeting.StartTime} - {meeting.EndTime}</td>
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