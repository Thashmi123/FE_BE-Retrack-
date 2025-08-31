import React, { Fragment, useState, useEffect } from 'react';
import { Breadcrumbs } from '../../../AbstractElements';
import { Card, CardBody, Col, Container, Row, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import MeetingService from '../../../Services/meeting.service';

const MeetingRoom = () => {
  const [meeting, setMeeting] = useState(null);
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isInMeeting, setIsInMeeting] = useState(false);

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!meetingId) {
      setError('Please enter a meeting ID');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const meetingData = await MeetingService.getMeetingById(meetingId);
      setMeeting(meetingData.data); // Assuming the meeting data is directly in response.data
      setSuccess('Meeting found! You can now join.');
    } catch (err) {
      setError('Failed to find meeting. Please check the meeting ID.');
      console.error('Error finding meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = () => {
    setIsInMeeting(true);
    setSuccess('Meeting started successfully!');
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
    setMeeting(null);
    setMeetingId('');
    setSuccess('You have left the meeting.');
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle='Meeting Room' parent='Meeting' title='Video Conference' />
      <Container fluid={true}>
        {error && (
          <Alert color="danger">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert color="success">
            {success}
          </Alert>
        )}
        
        {!isInMeeting ? (
          <Row className="justify-content-center">
            <Col md="6">
              <Card>
                <CardBody>
                  <h4 className="text-center mb-4">Join Meeting</h4>
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
                      <Button color="primary" type="submit" disabled={loading}>
                        {loading ? 'Joining...' : 'Join Meeting'}
                      </Button>
                    </div>
                  </Form>
                  
                  {meeting && (
                    <div className="mt-4">
                      <h5>Meeting Details</h5>
                      <div className="border p-3 rounded">
                        <p><strong>Title:</strong> {meeting.Title}</p>
                        <p><strong>Date:</strong> {meeting.Date}</p>
                        <p><strong>Time:</strong> {meeting.StartTime} - {meeting.EndTime}</p>
                        <p><strong>Location:</strong> {meeting.Location || 'Virtual Room'}</p>
                        <p><strong>Participants:</strong> {meeting.Participants || 'Not specified'}</p>
                        
                        <div className="d-grid">
                          <Button color="success" onClick={handleStartMeeting}>
                            Start Meeting
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col sm="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4>Meeting in Progress</h4>
                    <Button color="danger" onClick={handleLeaveMeeting}>
                      Leave Meeting
                    </Button>
                  </div>
                  
                  <Row>
                    <Col md="8">
                      <div className="video-container bg-dark rounded" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="text-center text-white">
                          <i className="icofont-video-alt" style={{ fontSize: '4rem' }}></i>
                          <h5 className="mt-3">Video Conference in Progress</h5>
                          <p>Meeting: {meeting?.Title}</p>
                        </div>
                      </div>
                    </Col>
                    
                    <Col md="4">
                      <Card className="mb-3">
                        <CardBody>
                          <h5>Participants</h5>
                          <div className="participants-list">
                            <div className="participant d-flex align-items-center mb-2">
                              <div className="bg-primary rounded-circle me-2" style={{ width: '30px', height: '30px' }}></div>
                              <span>You (Host)</span>
                            </div>
                            <div className="participant d-flex align-items-center mb-2">
                              <div className="bg-secondary rounded-circle me-2" style={{ width: '30px', height: '30px' }}></div>
                              <span>Participant 1</span>
                            </div>
                            <div className="participant d-flex align-items-center mb-2">
                              <div className="bg-secondary rounded-circle me-2" style={{ width: '30px', height: '30px' }}></div>
                              <span>Participant 2</span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                      
                      <Card>
                        <CardBody>
                          <h5>Meeting Controls</h5>
                          <div className="d-flex justify-content-between">
                            <Button color="light" className="btn-air-light">
                              <i className="icofont-microphone"></i>
                            </Button>
                            <Button color="light" className="btn-air-light">
                              <i className="icofont-ui-video"></i>
                            </Button>
                            <Button color="light" className="btn-air-light">
                              <i className="icofont-ui-settings"></i>
                            </Button>
                            <Button color="light" className="btn-air-light">
                              <i className="icofont-share"></i>
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </Fragment>
  );
};

export default MeetingRoom;