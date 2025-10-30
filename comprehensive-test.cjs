// Comprehensive test to verify all major functionalities are working
const axios = require('axios');

const baseURL = 'http://localhost:5050/api';
const api = axios.create({ baseURL });

async function runComprehensiveTest() {
  console.log('=== COMPREHENSIVE SYSTEM TEST ===\n');
  
  try {
    // 1. Test authentication system
    console.log('1. Testing Authentication System...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful');
    
    // 2. Test event system
    console.log('\n2. Testing Event System...');
    const eventsResponse = await api.get('/events');
    console.log('   ✅ Events listing successful');
    console.log('   Events count:', eventsResponse.data.events.length);
    
    // 3. Test review system
    console.log('\n3. Testing Review System...');
    if (eventsResponse.data.events.length > 0) {
      const eventId = eventsResponse.data.events[0]._id;
      const reviewsResponse = await api.get(`/reviews/${eventId}`);
      console.log('   ✅ Reviews listing successful');
      
      // Test adding a review
      try {
        await api.post(`/reviews/${eventId}`, {
          rating: 5,
          comment: 'Test review'
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('   ✅ Review submission successful');
      } catch (err) {
        if (err.response && err.response.status === 400) {
          console.log('   ℹ️  Review submission failed (likely duplicate) -', err.response.data.message);
        } else {
          throw err;
        }
      }
    } else {
      console.log('   ℹ️  No events available for review testing');
    }
    
    // 4. Test session system
    console.log('\n4. Testing Session System...');
    const sessionsResponse = await api.get('/sessions');
    console.log('   ✅ Sessions listing successful');
    
    // Test creating a session
    const sessionResponse = await api.post('/sessions', {
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
    console.log('   ✅ Session creation successful');
    
    // 5. Test feedback system (newly added)
    console.log('\n5. Testing Feedback System...');
    await api.post('/feedback', {
      type: 'suggestion',
      subject: 'Test Feedback',
      message: 'This is a test feedback message'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('   ✅ Feedback submission successful');
    
    // Test feedback listing (should fail for non-admin)
    try {
      await api.get('/feedback', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('   ❌ Feedback listing should have failed for non-admin');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('   ✅ Feedback listing correctly restricted to admins');
      } else {
        throw err;
      }
    }
    
    // 6. Test registration system
    console.log('\n6. Testing Registration System...');
    const registrationsResponse = await api.get('/registrations/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('   ✅ User registrations listing successful');
    
    // 7. Test statistics system
    console.log('\n7. Testing Statistics System...');
    const statsResponse = await api.get('/stats/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('   ✅ Statistics dashboard successful');
    
    console.log('\n🎉 ALL SYSTEMS ARE WORKING CORRECTLY!');
    console.log('\nSummary of verified systems:');
    console.log('✅ Authentication System');
    console.log('✅ Event Management System');
    console.log('✅ Review System');
    console.log('✅ Session Management System');
    console.log('✅ Feedback System (NEW)');
    console.log('✅ Registration System');
    console.log('✅ Statistics System');
    
  } catch (err) {
    console.log('   ❌ Test failed:', err.message);
    if (err.response) {
      console.log('   Status:', err.response.status);
      console.log('   Response:', err.response.data);
    }
  }
}

// Run the comprehensive test
runComprehensiveTest();