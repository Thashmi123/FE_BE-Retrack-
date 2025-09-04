import React, { Fragment, useContext } from 'react';
import ChatAppContext from '../../../../_helper/Chat';
import { LI, UL } from '../../../../AbstractElements';
import SearchChatList from './SearchChatList';
import CurrentUser from './CurrentUser';

const ChatStatus = () => {
  const {
    selectedUserr,
    memberss,
    currentUserr,
    conversations,
    loading,
    changeChat,
    createNewChatAsyn
  } = useContext(ChatAppContext);
  
  const changeChatClick = async (e, selectedUserId) => {
    if (!currentUserr) return;
    
    try {
      await changeChat(selectedUserId);
    } catch (error) {
      console.error('Error changing chat:', error);
    }
  };

  // Generate avatar initials from name
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Generate avatar color based on user ID
  const getAvatarColor = (userId) => {
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
    const index = userId ? userId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  var activeChat = 0;
  if (selectedUserr != null) activeChat = selectedUserr.id;

  return (
    <Fragment>
      <div className='chat-box'>
        <div className='chat-left-aside'>
          <CurrentUser />
          <div className='people-list' id='people-list'>
            <SearchChatList />
            {loading ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading conversations...</p>
              </div>
            ) : memberss && memberss.length > 0 ? (
              <UL attrUL={{ className: 'simple-list list custom-scrollbar' }}>
                {memberss
                  .filter((x) => currentUserr && x.id !== currentUserr.id)
                  .map((item) => {
                    // Find if there's a conversation with this user
                    const hasConversation = conversations.some(conv =>
                      (conv.userA === currentUserr?.id && conv.userB === item.id) ||
                      (conv.userB === currentUserr?.id && conv.userA === item.id)
                    );
                    
                    const avatarInitials = getAvatarInitials(item.name);
                    const avatarColor = getAvatarColor(item.id);
                    
                    return (
                      <LI
                        attrLI={{
                          style: { backgroundColor: 'transparent', cursor: 'pointer' },
                          className: `clearfix border-0 p-2 ${activeChat === item.id ? 'active' : ''} ${hasConversation ? 'has-conversation' : ''}`,
                          onClick: (e) => changeChatClick(e, item.id),
                        }}
                        key={item.id}>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: avatarColor,
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              position: 'relative'
                            }}
                          >
                            {avatarInitials}
                            <div
                              className={`position-absolute rounded-circle ${item.online === true ? 'bg-success' : 'bg-secondary'}`}
                              style={{
                                width: '12px',
                                height: '12px',
                                bottom: '0',
                                right: '0',
                                border: '2px solid white'
                              }}
                            ></div>
                          </div>
                          <div className='flex-grow-1'>
                            <div className='fw-semibold'>{item.name}</div>
                            <div className='text-muted small'>
                              {hasConversation ? 'Active conversation' : 'Click to start chat'}
                            </div>
                          </div>
                        </div>
                      </LI>
                    );
                  })}
              </UL>
            ) : (
              <div className="text-center p-3">
                <div className="mb-2" style={{ fontSize: '32px', color: '#6c757d' }}>👥</div>
                <p className="text-muted">No users available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default ChatStatus;
