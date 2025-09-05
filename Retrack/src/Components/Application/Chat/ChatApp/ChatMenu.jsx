import React, { Fragment, useContext, useState } from 'react';
import { Col, Form, FormGroup, Input, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import ChatAppContext from '../../../../_helper/Chat';
import { useUser } from '../../../../contexts/UserContext';
import { CALL, STATUS, PROFILE, Active, ChataApp_p1, ChataApp_p2, Following, Follower, MarkJecno } from '../../../../Constant';
import { H5, LI, P, UL } from '../../../../AbstractElements';

const ChatMenu = () => {
  const { allMemberss, currentUserr } = useContext(ChatAppContext);
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('1');

  // Generate avatar initials from name
  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Generate avatar color based on user name
  const getAvatarColor = (name) => {
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <Fragment>
      <Nav tabs className='border-tab nav-primary'>
        <NavItem id='myTab' role='tablist'>
          <NavLink tag='a' className={activeTab === '1' ? 'active' : ''} onClick={() => setActiveTab('1')}>
            {' '}
            {CALL}
          </NavLink>
        </NavItem>
        <NavItem id='myTab' role='tablist'>
          <NavLink tag='a' className={activeTab === '2' ? 'active' : ''} onClick={() => setActiveTab('2')}>
            {STATUS}
          </NavLink>
        </NavItem>
        <NavItem id='myTab' role='tablist'>
          <NavLink tag='a' className={activeTab === '3' ? 'active' : ''} onClick={() => setActiveTab('3')}>
            {PROFILE}
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId='1'>
          <div className='people-list'>
            <UL attrUL={{ className: 'simple-list list digits custom-scrollbar' }}>
              {allMemberss.map((member, i) => {
                const avatarInitials = getAvatarInitials(member.name);
                const avatarColor = getAvatarColor(member.name);
                
                return (
                  <LI attrLI={{ className: 'clearfix border-0' }} key={i}>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: avatarColor,
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        float: 'left'
                      }}
                    >
                      {avatarInitials}
                    </div>
                    <div className='about'>
                      <div className='name'>{member.name}</div>
                      <div className='status'>
                        <span className={`badge ${member.online ? 'bg-success' : 'bg-secondary'}`}>
                          {member.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </LI>
                );
              })}
            </UL>
          </div>
        </TabPane>
        <TabPane tabId='2'>
          <div className='people-list'>
            <div className='search'>
              <Form className='theme-form'>
                <FormGroup>
                  {' '}
                  <Input className='form-control' type='text' placeholder='Write Status...' />
                  <i className='fa fa-pencil'></i>{' '}
                </FormGroup>{' '}
              </Form>
            </div>
          </div>
          <div className='status'>
            <P attrPara={{ className: 'font-dark' }}>{Active}</P> <hr />
            <P>
              {ChataApp_p1}&nbsp;&nbsp;
              <i className='icofont icofont-emo-heart-eyes font-danger f-20'></i>
              <i className='icofont icofont-emo-heart-eyes font-danger f-20 m-l-5'></i>{' '}
            </P>{' '}
            <hr />
            <P>
              {ChataApp_p2} &nbsp;<i className='icofont icofont-emo-rolling-eyes font-success f-20'></i>
            </P>
            <hr />
          </div>
        </TabPane>
        <TabPane tabId='3'>
          <div className='user-profile'>
            {(() => {
              const loggedInUser = user || currentUserr;
              const userName = loggedInUser ? (loggedInUser.name || loggedInUser.Name || `${loggedInUser.FirstName || ''} ${loggedInUser.LastName || ''}`.trim() || loggedInUser.username || 'Current User') : 'Guest User';
              const userEmail = loggedInUser ? (loggedInUser.email || loggedInUser.Email || '') : '';
              const userId = loggedInUser ? (loggedInUser.id || loggedInUser.userId || loggedInUser.UserId || 'guest') : 'guest';
              const avatarInitials = getAvatarInitials(userName);
              const avatarColor = getAvatarColor(userName);

              return (
                <>
                  <div className='image text-center'>
                    <div className='avatar d-inline-flex align-items-center justify-content-center rounded-circle'
                         style={{
                           width: '80px',
                           height: '80px',
                           backgroundColor: avatarColor,
                           color: 'white',
                           fontSize: '24px',
                           fontWeight: 'bold'
                         }}>
                      {avatarInitials}
                    </div>
                    <div className='icon-wrapper'>
                      <i className='icofont icofont-pencil-alt-5'></i>
                    </div>
                  </div>
                  <div className='user-content text-center'>
                    <H5 attrH5={{ className: 'text-center text-uppercase' }}>{userName}</H5>
                    <div className='mb-3'>
                      <span className='badge bg-success'>
                        <i className="fa fa-circle me-1" style={{ fontSize: '8px' }}></i>
                        Online
                      </span>
                    </div>
                    <div className='social-media'>
                      <UL attrUL={{ horizontal: true, className: 'list-inline d-flex justify-content-center' }}>
                        <LI attrLI={{ className: 'list-inline-item' }}>
                          <a href='https://www.facebook.com/' target='_blank' rel='noopener noreferrer'>
                            <i className='fa fa-facebook'></i>
                          </a>
                        </LI>
                        <LI attrLI={{ className: 'list-inline-item' }}>
                          <a href='https://accounts.google.com/' target='_blank' rel='noopener noreferrer'>
                            <i className='fa fa-google-plus'></i>
                          </a>
                        </LI>
                        <LI attrLI={{ className: 'list-inline-item' }}>
                          <a href='https://twitter.com/' target='_blank' rel='noopener noreferrer'>
                            <i className='fa fa-twitter'></i>
                          </a>
                        </LI>
                        <LI attrLI={{ className: 'list-inline-item' }}>
                          <a href='https://www.instagram.com/' target='_blank' rel='noopener noreferrer'>
                            <i className='fa fa-instagram'></i>
                          </a>
                        </LI>
                        <LI attrLI={{ className: 'list-inline-item' }}>
                          <a href='https://dashboard.rss.com/auth/sign-in/' target='_blank' rel='noopener noreferrer'>
                            <i className='fa fa-rss'></i>
                          </a>
                        </LI>
                      </UL>
                    </div>
                    <hr />
                    <div className='follow text-center'>
                      <Row>
                        <Col className='border-end'>
                          <span>Active Chats</span>
                          <div className='follow-num'>{allMemberss.length}</div>
                        </Col>
                        <Col>
                          <span>Online Users</span>
                          <div className='follow-num'>{allMemberss.filter(u => u.online).length}</div>
                        </Col>
                      </Row>
                    </div>
                    <hr />
                    <div className='text-center digits'>
                      {userEmail && <P attrPara={{ className: 'mb-1' }}>{userEmail}</P>}
                      <P attrPara={{ className: 'mb-1 text-muted' }}>User ID: {userId}</P>
                      <P attrPara={{ className: 'mb-0 text-muted small' }}>
                        Joined: {new Date().toLocaleDateString()}
                      </P>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </TabPane>
      </TabContent>
    </Fragment>
  );
};
export default ChatMenu;
