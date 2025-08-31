import React, { Fragment, useEffect, useState } from 'react';
import { Btn, H4 } from '../../../../AbstractElements';
import { Col } from 'reactstrap';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import MeetingModal from './MeetingModal';
import meetingService from '../../../../Services/meeting.service';
import { initialState } from './DragData';

const DragCalendar = () => {
    const [events, setEvents] = useState([]);
    const [modal, setModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        fetchMeetings();
        let draggableEl = document.getElementById('external-events');
        new Draggable(draggableEl, {
            itemSelector: '.fc-event',
            eventData: function (eventEl) {
                let title = eventEl.getAttribute('title');
                let id = eventEl.getAttribute('data');
                let icon = eventEl.getAttribute('icon');
                return {
                    title: title,
                    id: id,
                    icon: icon,
                    start: new Date(),
                };
            },
        });
    }, []);

    const fetchMeetings = () => {
        meetingService.findAllMeetings().then(
            (response) => {
                // The API returns an object with a "data" property containing the array
                // The array is under response.data.Meeting
                if (response.data && Array.isArray(response.data.Meeting)) {
                    // Transform the meeting data to match FullCalendar's expected format
                    const transformedEvents = response.data.Meeting.map(meeting => ({
                        id: meeting.MeetingId,
                        title: meeting.Title,
                        start: `${meeting.Date}T${meeting.StartTime}`, // Combine date and start time
                        end: `${meeting.Date}T${meeting.EndTime}`,   // Combine date and end time
                        extendedProps: {
                            description: meeting.Description,
                            location: meeting.Location,
                            participants: meeting.Participants,
                            // A dummy join link for now. In a real application, this would come from the backend.
                            joinLink: `http://localhost:3000/meeting/${meeting.MeetingId}/join`
                        }
                    }));
                    setEvents(transformedEvents);
                } else {
                    // If response.data.Meeting is not an array, set events to an empty array
                    setEvents([]);
                }
            },
            (error) => {
                console.log(error);
            }
        );
    };

    const eventClick = (info) => {
        const { id, title, start, end, extendedProps } = info.event;
        setSelectedEvent({
            id,
            title,
            start,
            end,
            description: extendedProps.description || '',
            location: extendedProps.location || '',
            participants: extendedProps.participants || '',
            joinLink: extendedProps.joinLink || '',
        });
        setModal(true);
    };

    const toggle = () => {
        setModal(!modal);
    };

    const handleCreate = (newEvent) => {
        // Transform the event data to match the backend's expected format
        const meetingData = {
            Title: newEvent.title,
            Description: newEvent.description,
            Date: newEvent.start.toISOString().split('T')[0],
            StartTime: newEvent.start.toTimeString().substring(0, 5),
            EndTime: newEvent.end.toTimeString().substring(0, 5),
            Location: newEvent.location,
            Participants: newEvent.participants
        };
        
        meetingService.createMeeting(meetingData).then(() => {
            fetchMeetings();
        });
    };

    const handleUpdate = (updatedEvent) => {
        // Transform the event data to match the backend's expected format
        const meetingData = {
            MeetingId: updatedEvent.id,
            Title: updatedEvent.title,
            Description: updatedEvent.description,
            Date: updatedEvent.start.toISOString().split('T')[0],
            StartTime: updatedEvent.start.toTimeString().substring(0, 5),
            EndTime: updatedEvent.end.toTimeString().substring(0, 5),
            Location: updatedEvent.location,
            Participants: updatedEvent.participants
        };
        
        meetingService.updateMeeting(updatedEvent.id, meetingData).then(() => {
            fetchMeetings();
        });
    };

    const handleDelete = (eventId) => {
        // The backend expects the meeting ID as a query parameter
        meetingService.deleteMeeting(eventId).then(() => {
            fetchMeetings();
        });
        setModal(false);
    };

    return (
        <Fragment>
            <Col xxl='3' className='box-col-12'>
                <div className='md-sidebar'>
                    <Btn attrBtn={{ onClick: () => setModal(true), color: 'primary', className: 'md-sidebar-toggle' }}>Create Meeting</Btn>
                    <div id='external-events'>
                        <H4>{'Draggable Events'}</H4>
                        {initialState.events.map((event) => (
                            <div className='fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event' title={event.title} data={event.id} icon={event.icon} key={event.id}>
                                <div className='fc-event-main'>
                                    <i className={`fa fa-${event.icon} me-2`}></i>
                                    {event.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Col>
            <Col xxl='9' className='box-col-12'>
                <div className='demo-app-calendar' id='mycalendartest'>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                        }}
                        events={events}
                        eventClick={eventClick}
                        editable={true}
                        droppable={true}
                    />
                </div>
            </Col>
            <MeetingModal
                isOpen={modal}
                toggle={toggle}
                selectedEvent={selectedEvent}
                onUpdate={handleUpdate}
                onCreate={handleCreate}
                onDelete={handleDelete}
            />
        </Fragment>
    );
};

export default DragCalendar;
