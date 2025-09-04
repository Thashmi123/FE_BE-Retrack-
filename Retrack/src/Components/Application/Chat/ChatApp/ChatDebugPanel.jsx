import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Alert } from 'reactstrap';
import { useUser } from '../../../../contexts/UserContext';
import UserService from '../../../../Services/user.service';
import ChatService from '../../../../Services/chat.service';

const ChatDebugPanel = () => {
  const { user, getCurrentUserId } = useUser();
  const [debugInfo, setDebugInfo] = useState({});
  const [apiTest, setApiTest] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updateDebugInfo();
  }, [user]);

  const updateDebugInfo = () => {
    const currentUserId = getCurrentUserId ? getCurrentUserId() : UserService.getCurrentUserId();
    const storedUserId = localStorage.getItem('userId');
    const storedCurrentUserId = localStorage.getItem('currentUserId');
    
    setDebugInfo({
      userFromContext: user,
      currentUserId,
      storedUserId,
      storedCurrentUserId,
      localStorage: {
        userId: localStorage.getItem('userId'),
        currentUserId: localStorage.getItem('currentUserId'),
        user: localStorage.getItem('user'),
        token: localStorage.getItem('token')
      }
    });
  };

  const testUsersAPI = async () => {
    setLoading(true);
    try {
      const currentUserId = getCurrentUserId ? getCurrentUserId() : UserService.getCurrentUserId();
      
      // Test API connection
      const connectionTest = await UserService.testConnection();
      console.log('Connection test result:', connectionTest);
      
      // Test getting all users
      const result = await UserService.getAllUsers(currentUserId);
      console.log('Get all users result:', result);
      
      setApiTest({
        success: result.success,
        connectionTest,
        usersResult: result,
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error('API test error:', error);
      setApiTest({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testSearchAPI = async () => {
    setLoading(true);
    try {
      const currentUserId = getCurrentUserId ? getCurrentUserId() : UserService.getCurrentUserId();
      const result = await UserService.searchUsers('John', currentUserId);
      console.log('Search test result:', result);
      
      setApiTest({
        success: result.success,
        searchResult: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search test error:', error);
      setApiTest({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUserId');
    updateDebugInfo();
  };

  const setTestUserId = () => {
    localStorage.setItem('userId', 'user1');
    localStorage.setItem('currentUserId', 'user1');
    updateDebugInfo();
  };

  return (
    <Card className="mb-3">
      <CardHeader>
        <h5>Chat Debug Panel</h5>
      </CardHeader>
      <CardBody>
        <div className="mb-3">
          <h6>User Context Information:</h6>
          <pre className="bg-light p-2 small">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="mb-3">
          <Button 
            color="primary" 
            onClick={testUsersAPI} 
            disabled={loading}
            className="me-2"
          >
            {loading ? 'Testing...' : 'Test Users API'}
          </Button>
          <Button 
            color="secondary" 
            onClick={testSearchAPI} 
            disabled={loading}
            className="me-2"
          >
            {loading ? 'Testing...' : 'Test Search API'}
          </Button>
          <Button 
            color="warning" 
            onClick={updateDebugInfo}
            className="me-2"
          >
            Refresh Info
          </Button>
          <Button 
            color="info" 
            onClick={setTestUserId}
            className="me-2"
          >
            Set Test User ID
          </Button>
          <Button 
            color="danger" 
            onClick={clearLocalStorage}
          >
            Clear LocalStorage
          </Button>
        </div>

        {apiTest && (
          <div className="mb-3">
            <h6>API Test Results:</h6>
            <Alert color={apiTest.success ? 'success' : 'danger'}>
              <strong>Status:</strong> {apiTest.success ? 'Success' : 'Failed'}
              <br />
              <strong>Time:</strong> {apiTest.timestamp}
              {apiTest.error && (
                <>
                  <br />
                  <strong>Error:</strong> {apiTest.error}
                </>
              )}
            </Alert>
            <pre className="bg-light p-2 small">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        )}

        {users.length > 0 && (
          <div className="mb-3">
            <h6>Available Users ({users.length}):</h6>
            <div className="row">
              {users.map(user => (
                <div key={user.id} className="col-md-6 mb-2">
                  <div className="border p-2 rounded">
                    <strong>{user.name}</strong>
                    <br />
                    <small>ID: {user.id}</small>
                    <br />
                    <small>Email: {user.email}</small>
                    <br />
                    <span className={`badge ${user.online ? 'bg-success' : 'bg-secondary'}`}>
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            This debug panel helps verify that the users API is working correctly and that user context is properly managed.
            <br />
            Expected API URL: http://localhost:8888/TaskMgt/api/users
          </small>
        </div>
      </CardBody>
    </Card>
  );
};

export default ChatDebugPanel;