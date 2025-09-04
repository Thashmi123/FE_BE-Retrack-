import React, { useContext, useState, useEffect } from 'react';
import { Col, Input, InputGroup, Row } from 'reactstrap';
import { Picker } from 'emoji-mart';
import { Btn, Image } from '../../../../AbstractElements';
import ChatAppContext from '../../../../_helper/Chat';
import { useUser } from '../../../../contexts/UserContext';
import UserService from '../../../../Services/user.service';

const SendChat = () => {
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { user, getCurrentUserId } = useUser();
    const {
        chatss,
        selectedUserr,
        currentUserr,
        sendMessageAsyn,
        replyByUserAsyn,
    } = useContext(ChatAppContext);

    // Get current user ID from multiple sources
    useEffect(() => {
        const userId = getCurrentUserId ? getCurrentUserId() :
                      UserService.getCurrentUserId();
        setCurrentUserId(userId);
    }, [user, getCurrentUserId]);

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const addEmoji = (emoji) => {
        const text = `${messageInput}${emoji.native}`;
        setShowEmojiPicker(false);
        setMessageInput(text);
    };
    const handleMessageChange = (message) => {
        setMessageInput(message);
    };

    const handleMessagePress = async (e) => {
        if (e.key === 'Enter' || e === 'send') {
            // Validate inputs
            const trimmedMessage = messageInput.trim();
            if (!trimmedMessage) {
                console.log('Empty message, not sending');
                return;
            }

            // Get user IDs from multiple sources
            const senderId = currentUserId || currentUserr?.id || user?.id || user?.userId;
            const receiverId = selectedUserr?.id;

            if (!senderId || !receiverId) {
                console.error('Missing user IDs:', { senderId, receiverId });
                alert('Unable to send message: User information missing');
                return;
            }

            if (!selectedUserr) {
                console.error('No user selected for chat');
                alert('Please select a user to chat with');
                return;
            }

            setIsLoading(true);
            try {
                console.log('Sending message:', {
                    from: senderId,
                    to: receiverId,
                    message: trimmedMessage
                });

                await sendMessageAsyn(senderId, receiverId, trimmedMessage);
                setMessageInput('');
                
                // Scroll to bottom after message is sent
                setTimeout(() => {
                    const container = document.querySelector('.chat-history');
                    if (container) {
                        container.scrollTop = container.scrollHeight;
                    }
                }, 100);
                
                console.log('Message sent successfully');
            } catch (error) {
                console.error('Failed to send message:', error);
                alert('Failed to send message. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    return (
        <div className="chat-message clearfix">
            <Row>
                <div>
                    {showEmojiPicker ? (
                        <Picker set="apple" emojiSize={30} onSelect={addEmoji} />
                    ) : null}
                </div>
                <Col xl="12" className="d-flex">
                    <div className="smiley-box bg-primary">
                        <div className="picker" onClick={() => toggleEmojiPicker()}>
                            <Image attrImage={{ src: `${require('../../../../assets/images/smiley.png')}`, alt: '' }} /></div>
                    </div>
                    <InputGroup className="text-box">
                        <Input
                            type="text"
                            className="form-control input-txt-bx"
                            placeholder="Type a message......"
                            value={messageInput}
                            onKeyPress={(e) => handleMessagePress(e)}
                            onChange={(e) =>
                                handleMessageChange(e.target.value)
                            }
                        />
                        <Btn
                            attrBtn={{
                                color: 'primary',
                                disabled: isLoading || !messageInput.trim() || !selectedUserr,
                                onClick: () => handleMessagePress('send')
                            }}>
                            {isLoading ? 'Sending...' : 'Send'}
                        </Btn>
                    </InputGroup>
                </Col>
            </Row>
        </div>
    );
};

export default SendChat;