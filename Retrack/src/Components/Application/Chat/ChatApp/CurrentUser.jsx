import React, { Fragment, useContext } from 'react';
import ChatAppContext from '../../../../_helper/Chat';
import { useUser } from '../../../../contexts/UserContext';
import { Link } from 'react-router-dom';
import CustomizerContext from '../../../../_helper/Customizer';

const CurrentUser = () => {
  const { currentUserr } = useContext(ChatAppContext);
  const { user } = useUser();
  const { layoutURL } = useContext(CustomizerContext);

  // Use logged-in user from UserContext, fallback to currentUserr
  const loggedInUser = user || currentUserr;

  // Generate avatar initials from name
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Generate avatar color based on user ID or name
  const getAvatarColor = (identifier) => {
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
    const index = identifier ? identifier.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (!loggedInUser) {
    return (
      <Fragment>
        <div className='media d-flex align-items-center'>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#6c757d',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            G
          </div>
          <div className='about'>
            <div className='name f-w-600'>Guest User</div>
            <div className='status text-muted'>Please login</div>
          </div>
        </div>
      </Fragment>
    );
  }

  const userName = loggedInUser.name || loggedInUser.Name || `${loggedInUser.FirstName || ''} ${loggedInUser.LastName || ''}`.trim() || loggedInUser.username || 'Current User';
  const userId = loggedInUser.id || loggedInUser.userId || loggedInUser.UserId || 'guest';
  const userEmail = loggedInUser.email || loggedInUser.Email || '';

  return (
    <Fragment>
      <div className='media d-flex align-items-center'>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: getAvatarColor(userId),
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          {getAvatarInitials(userName)}
        </div>
        <div className='about'>
          <Link to={`${process.env.PUBLIC_URL}/app/users/profile/${layoutURL}`}>
            <div className='name f-w-600'>{userName}</div>
          </Link>
          <div className='status text-success'>
            <i className="fa fa-circle me-1" style={{ fontSize: '8px' }}></i>
            Online
          </div>
          {userEmail && (
            <div className='text-muted small'>{userEmail}</div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default CurrentUser;
