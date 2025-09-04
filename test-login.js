const axios = require('axios');

// Test login functionality
async function testLogin() {
  try {
    console.log('Testing UserMGT login API...');
    
    // Test login endpoint
    const loginResponse = await axios.post('http://localhost:8889/UserMGT/api/Login', {
      Email: 'test@example.com',
      Password: 'password123'
    });
    
    console.log('Login Response:', loginResponse.data);
    
    if (loginResponse.data.token) {
      console.log('Login successful!');
      console.log('Token:', loginResponse.data.token);
      console.log('User:', loginResponse.data.user);
    }
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
  }
}

// Test register functionality
async function testRegister() {
  try {
    console.log('Testing UserMGT register API...');
    
    // Test register endpoint
    const registerResponse = await axios.post('http://localhost:8889/UserMGT/api/Register', {
      FirstName: 'Test',
      LastName: 'User',
      Email: 'test@example.com',
      Username: 'testuser',
      Password: 'password123',
      Age: 25,
      Gender: 'Male',
      Country: 'USA'
    });
    
    console.log('Register Response:', registerResponse.data);
  } catch (error) {
    console.error('Register Error:', error.response?.data || error.message);
  }
}

// Run tests
testLogin();