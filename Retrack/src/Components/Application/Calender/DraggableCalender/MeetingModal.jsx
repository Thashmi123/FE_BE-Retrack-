import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, Button } from 'reactstrap';

const MeetingModal = ({ isOpen, toggle, selectedEvent, onUpdate, onCreate, onDelete }) => {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [participants, setParticipants] = useState('');
    const [joinLink, setJoinLink] = useState('');

    useEffect(() => {
        if (selectedEvent) {
            setTitle(selectedEvent.title);
            setStart(selectedEvent.start);
            setEnd(selectedEvent.end || new Date());
            setDescription(selectedEvent.description || '');
            setLocation(selectedEvent.location || '');
            setParticipants(selectedEvent.participants || '');
            setJoinLink(selectedEvent.joinLink || '');
        } else {
            setTitle('');
            setStart(new Date());
            setEnd(new Date());
            setDescription('');
            setLocation('');
            setParticipants('');
            setJoinLink('');
        }
    }, [selectedEvent]);

    const handleUpdate = () => {
        onUpdate({
            ...selectedEvent,
            title,
            start,
            end,
            description,
            location,
            participants,
            joinLink
        });
        toggle();
    };

    const handleCreate = () => {
        onCreate({
            title,
            start,
            end,
            description,
            location,
            participants,
            joinLink
        });
        toggle();
    };

    const handleDelete = () => {
        onDelete(selectedEvent.id);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{selectedEvent ? 'Update Meeting' : 'Create Meeting'}</ModalHeader>
            <ModalBody>
                <Label>Title</Label>
                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                
                <Label>Description</Label>
                <Input type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
                
                <Label>Date</Label>
                <Input type="date" value={start ? start.toString().split('T')[0] : ''} onChange={(e) => setStart(new Date(e.target.value))} />
                
                <div className="row">
                    <div className="col-md-6">
                        <Label>Start Time</Label>
                        <Input type="time" value={start ? start.toString().split('T')[1]?.substring(0, 5) : ''} onChange={(e) => {
                            const dateStr = start ? start.toString().split('T')[0] : new Date().toISOString().split('T')[0];
                            setStart(new Date(`${dateStr}T${e.target.value}`));
                        }} />
                    </div>
                    <div className="col-md-6">
                        <Label>End Time</Label>
                        <Input type="time" value={end ? end.toString().split('T')[1]?.substring(0, 5) : ''} onChange={(e) => {
                            const dateStr = end ? end.toString().split('T')[0] : new Date().toISOString().split('T')[0];
                            setEnd(new Date(`${dateStr}T${e.target.value}`));
                        }} />
                    </div>
                </div>
                
                <Label>Location</Label>
                <Input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                
                <Label>Participants</Label>
                <Input type="text" value={participants} onChange={(e) => setParticipants(e.target.value)} />
                
                {selectedEvent && joinLink && (
                    <div className="mt-3">
                        <Label>Join Link</Label>
                        <div className="d-flex">
                            <Input type="text" value={joinLink} readOnly />
                            <Button color="info" className="ms-2" onClick={() => window.open(joinLink, '_blank')}>
                                Open
                            </Button>
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                {selectedEvent ? (
                    <>
                        <Button color="primary" onClick={handleUpdate}>
                            Update
                        </Button>
                        <Button color="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                        {joinLink && (
                            <Button color="success" href={joinLink} target="_blank">
                                Join Meeting
                            </Button>
                        )}
                    </>
                ) : (
                    <Button color="primary" onClick={handleCreate}>
                        Create
                    </Button>
                )}
                <Button color="secondary" onClick={toggle}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default MeetingModal;