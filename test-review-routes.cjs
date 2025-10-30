// Test script to verify review routes are working correctly
const axios = require('axios');

const baseURL = 'http://localhost:5050/api';
const api = axios.create({ baseURL });

async function testReviewRoutes() {
  console.log('=== TESTING REVIEW ROUTES ===\n');
  
  try {
    // First, let's get a list of events to use for testing
    console.log('1. Getting list of events...');
    const eventsResponse = await api.get('/events');
    console.log('   ✅ Events retrieved successfully');
    
    if (eventsResponse.data.events && eventsResponse.data.events.length > 0) {
      const eventId = eventsResponse.data.events[0]._id;
      console.log('   Using event ID:', eventId);
      
      // Test 1: Get reviews for an event (should work even if no reviews exist)
      console.log('\n2. Testing GET /reviews/:id route...');
      const reviewsResponse = await api.get(`/reviews/${eventId}`);
      console.log('   ✅ Reviews endpoint working');
      console.log('   Reviews count:', reviewsResponse.data.reviews.length);
      
      // Test 2: Try to add a review without authentication (should fail)
      console.log('\n3. Testing POST /reviews/:id without auth...');
      try {
        await api.post(`/reviews/${eventId}`, {
          rating: 5,
          comment: 'Great event!'
        });
        console.log('   ❌ Should have failed without authentication');
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.log('   ✅ Correctly rejected unauthenticated request');
        } else {
          console.log('   ❌ Unexpected error:', err.message);
        }
      }
      
      // Test 3: Login and then add a review
      console.log('\n4. Logging in to test authenticated review creation...');
      const loginResponse = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      const token = loginResponse.data.token;
      console.log('   ✅ Login successful');
      
      // Test 4: Add a review with authentication
      console.log('\n5. Testing POST /reviews/:id with auth...');
      try {
        const addReviewResponse = await api.post(`/reviews/${eventId}`, {
          rating: 5,
          comment: 'Great event!'
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('   ✅ Review added successfully');
        console.log('   Review ID:', addReviewResponse.data.review._id);
      } catch (err) {
        if (err.response && err.response.status === 400) {
          console.log('   ℹ️  Review creation failed (likely duplicate review):', err.response.data.message);
        } else {
          console.log('   ❌ Review creation failed:', err.message);
          if (err.response) {
            console.log('   Status:', err.response.status);
            console.log('   Response:', err.response.data);
          }
        }
      }
      
    } else {
      console.log('   ℹ️  No events found to test with');
    }
    
    console.log('\n🎉 Review route testing completed!');
    
  } catch (err) {
    console.log('   ❌ Test failed:', err.message);
    if (err.response) {
      console.log('   Status:', err.response.status);
      console.log('   Response:', err.response.data);
    }
  }
}

// Run the test
testReviewRoutes();