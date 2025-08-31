import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button } from 'reactstrap';
import { H5 } from '../../../AbstractElements';
import { UpcomingScheduleTitle } from '../../../Constant';
import MeetingService from '../../../Services/meeting.service';

const UpcomingSchedule = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const response = await MeetingService.findAllMeetings();
            // The API returns an object with a "data" property containing the array
            // The array is under response.data.Meeting
            const meetingsData = response.data.Meeting || [];
            setMeetings(meetingsData);
        } catch (err) {
            console.error('Error loading meetings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMeeting = () => {
        // This would typically open a modal or navigate to a create meeting page
        // For now, we'll just log to the console
        console.log('Create meeting button clicked');
        // You can implement the actual creation logic here
    };

    return (
        <Card className='schedule-card'>
            <CardHeader className='card-no-border'>
                <div className='header-top'>
                    <H5 attrH5={{ className: 'm-0' }}>{UpcomingScheduleTitle}</H5>
                    {/* <div className='card-header-right-icon'>
                        <Button color='light-primary' className='btn badge-light-primary' onClick={handleCreateMeeting}>
                            + Create Meeting
                        </Button>
                    </div> */}
                </div> 
            </CardHeader>
            <CardBody className='pt-0'>
                {loading ? (
                    <div className="text-center">
                        <p>Loading meetings...</p>
                    </div>
                ) : (
                    <div className="upcoming-meetings-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {meetings.length > 0 ? (
                            meetings.map((meeting) => (
                                <div key={meeting.MeetingId} className="meeting-item p-3 mb-2 rounded bg-dark">
                                    <h6 className="mb-1">{meeting.Title}</h6>
                                    <p className="mb-1 small">{meeting.Date} at {meeting.StartTime} - {meeting.EndTime}</p>
                                    <p className="mb-0 small">{meeting.Participants || 'No participants listed'}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center">
                                <p>No upcoming meetings.</p>
                            </div>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default UpcomingSchedule;
