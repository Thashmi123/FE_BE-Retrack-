import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Breadcrumbs } from '../../../AbstractElements';
import { Card, CardBody, Col, Container, Row, Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import MeetingService from '../../../Services/meeting.service';
import ChatAppContext from '../../../_helper/Chat';

const MeetingChat = () => {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Chat related states
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  
  // Get chat context
  const chatContext = useContext(ChatAppContext);
  const { chatss, selectedUserr, sendMessageAsyn } = chatContext || {};
  
  // Load meetings on component mount
  useEffect(() => {
    loadMeetings();
  }, []);
  
  // Load chat messages when a meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      loadChatMessages();
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
      setError('Failed to load meetings');
      console.error('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadChatMessages = () => {
    // In a real implementation, you would load chat messages specific to the meeting
    // For now, we'll use dummy messages
    const dummyMessages = [
      { id: 1, sender: 'You', text: 'Hello everyone!', time: '10:00 AM' },
      { id: 2, sender: 'Participant 1', text: 'Hi there!', time: '10:01 AM' },
      { id: 3, sender: 'Participant 2', text: 'Good morning!', time: '10:02 AM' },
    ];
    setChatMessages(dummyMessages);
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
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Add message to chat
    const newMessage = {
      id: chatMessages.length + 1,
      sender: 'You',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');
    
    // In a real implementation, you would send the message to other participants
    // sendMessageAsyn(currentUserId, selectedUserId, messageInput, chatss, true);
  };
  
  return (
    <Fragment>
      <Breadcrumbs mainTitle='Meeting Chat' parent='Meeting' title='Collaboration' />
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
        
        <Row>
          <Col md="4">
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Meetings</h5>
                  <Button color="secondary" size="sm" onClick={loadMeetings} disabled={loading}>
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
                        className={`meeting-item p-3 mb-2 rounded cursor-pointer ${selectedMeeting?.MeetingId === meeting.MeetingId ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                        onClick={() => handleSelectMeeting(meeting)}
                      >
                        <h6 className="mb-1">{meeting.Title}</h6>
                        <p className="mb-1 small">{meeting.Date} at {meeting.StartTime}</p>
                        <p className="mb-0 small">{meeting.Participants || 'No participants listed'}</p>
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
                    <Button color="success" className="w-100" onClick={handleJoinMeeting}>
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
                        <p className="mb-0 text-muted">{selectedMeeting.Date} at {selectedMeeting.StartTime} - {selectedMeeting.EndTime}</p>
                      </div>
                      <Button color="primary" onClick={() => setSelectedMeeting(null)}>
                        Back to Meetings
                      </Button>
                    </div>
                    
                    <Row>
                      <Col md="8">
                        <div className="chat-container border rounded p-3" style={{ height: '400px', overflowY: 'auto' }}>
                          <h5>Meeting Chat</h5>
                          <div className="chat-messages">
                            {chatMessages.map((message) => (
                              <div key={message.id} className={`message mb-3 ${message.sender === 'You' ? 'text-end' : 'text-start'}`}>
                                <div className={`d-inline-block p-2 rounded ${message.sender === 'You' ? 'bg-primary text-white' : 'bg-light'}`}>
                                  <div className="fw-bold small">{message.sender}</div>
                                  <div>{message.text}</div>
                                  <div className="small text-muted">{message.time}</div>
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
                        <div className="participants-container border rounded p-3" style={{ height: '400px' }}>
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
                          
                          <div className="mt-4">
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
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Fragment>
                ) : (
                  <div className="text-center py-5">
                    <i className="icofont-ui-calendar" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                    <h4 className="mt-3">Select a Meeting</h4>
                    <p className="text-muted">Choose a meeting from the list to start chatting and collaborating</p>
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