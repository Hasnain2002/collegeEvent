// Integration test to check if authentication works with the running server
const axios = require('axios');

const baseURL = 'http://localhost:5050/api';
const api = axios.create({ baseURL });

async function runIntegrationTest() {
  console.log('=== INTEGRATION TEST ===\n');
  
  try {
    // 1. Test health endpoint (should work)
    console.log('1. Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('   ✅ Health check passed:', healthResponse.data);
    
    // 2. Register a new user (if needed)
    console.log('\n2. Registering test user...');
    try {
      const registerResponse = await api.post('/auth/signup', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'organizer'
      });
      console.log('   ✅ User registered successfully');
      console.log('   Token:', registerResponse.data.token.substring(0, 30) + '...');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('   ℹ️  User already exists, continuing...');
      } else {
        console.log('   ❌ Registration failed:', err.message);
        return;
      }
    }
    
    // 3. Login to get a token
    console.log('\n3. Logging in...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful');
    console.log('   Token:', token.substring(0, 30) + '...');
    
    // 4. Test accessing a protected route
    console.log('\n4. Testing protected route access...');
    const protectedResponse = await api.get('/sessions/bookmarks', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('   ✅ Protected route access successful');
    console.log('   Response:', protectedResponse.data);
    
    // 5. Test creating a session (organizer only)
    console.log('\n5. Testing organizer-only route...');
    const createResponse = await api.post('/sessions', {
      title: 'Test Session',
      description: 'Test Description',
      speaker: 'Test Speaker',
      location: 'Test Location',
      dateTime: new Date().toISOString(),
      duration: 60
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('   ✅ Organizer route access successful');
    console.log('   Created session ID:', createResponse.data.session._id);
    
    console.log('\n🎉 All integration tests passed!');
    console.log('   The authentication system is working correctly.');
    
  } catch (err) {
    console.log('   ❌ Test failed:', err.message);
    if (err.response) {
      console.log('   Status:', err.response.status);
      console.log('   Response:', err.response.data);
    }
  }
}

// Run the test
runIntegrationTest();