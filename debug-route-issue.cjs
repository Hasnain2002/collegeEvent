// Debug script to identify common causes of "Route not found" errors in feedback section
const axios = require('axios');

const baseURL = 'http://localhost:5050/api';
const api = axios.create({ baseURL });

async function debugRouteIssues() {
  console.log('=== DEBUGGING ROUTE NOT FOUND ISSUES ===\n');
  
  try {
    // Test various possible routes that might be causing the issue
    console.log('1. Testing common incorrect review routes...\n');
    
    // Common mistake 1: Missing event ID
    console.log('   a) Testing /reviews without event ID...');
    try {
      await api.get('/reviews');
      console.log('      ❌ This should not work but did');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('      ✅ Correctly returned 404 (missing event ID)');
      } else {
        console.log('      ❌ Unexpected response:', err.response?.status, err.response?.data);
      }
    }
    
    // Common mistake 2: Wrong endpoint name
    console.log('   b) Testing /feedback instead of /reviews...');
    try {
      await api.get('/feedback/123');
      console.log('      ❌ This should not work but did');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('      ✅ Correctly returned 404 (wrong endpoint name)');
      } else {
        console.log('      ❌ Unexpected response:', err.response?.status, err.response?.data);
      }
    }
    
    // Common mistake 3: Wrong HTTP method
    console.log('   c) Testing POST to /reviews without event ID...');
    try {
      await api.post('/reviews', {});
      console.log('      ❌ This should not work but did');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('      ✅ Correctly returned 404 (missing event ID)');
      } else {
        console.log('      ❌ Unexpected response:', err.response?.status, err.response?.data);
      }
    }
    
    // Test with a valid event ID
    console.log('\n2. Testing with valid event ID...');
    const eventsResponse = await api.get('/events');
    if (eventsResponse.data.events && eventsResponse.data.events.length > 0) {
      const eventId = eventsResponse.data.events[0]._id;
      
      console.log('   a) Testing GET /reviews/:id with valid ID...');
      try {
        const response = await api.get(`/reviews/${eventId}`);
        console.log('      ✅ Success! Status:', response.status);
      } catch (err) {
        console.log('      ❌ Failed:', err.response?.status, err.response?.data);
      }
      
      console.log('   b) Testing POST /reviews/:id with valid ID (without auth)...');
      try {
        await api.post(`/reviews/${eventId}`, { rating: 5, comment: 'Test' });
        console.log('      ❌ This should not work but did');
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.log('      ✅ Correctly rejected (authentication required)');
        } else {
          console.log('      ❌ Unexpected error:', err.response?.status, err.response?.data);
        }
      }
    } else {
      console.log('   ℹ️  No events available for testing');
    }
    
    console.log('\n3. Summary of correct review routes:');
    console.log('   GET  /api/reviews/:eventId     - Get reviews for an event');
    console.log('   POST /api/reviews/:eventId     - Add a review for an event (requires auth)');
    console.log('   Note: :eventId is a required parameter');
    
    console.log('\n🎉 Debugging completed!');
    
  } catch (err) {
    console.log('   ❌ Debug test failed:', err.message);
    if (err.response) {
      console.log('   Status:', err.response.status);
      console.log('   Response:', err.response.data);
    }
  }
}

// Run the debug test
debugRouteIssues();