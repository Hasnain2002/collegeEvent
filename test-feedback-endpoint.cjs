// Test script to verify the new feedback endpoint works correctly
const axios = require('axios');

const baseURL = 'http://localhost:5050/api';
const api = axios.create({ baseURL });

async function testFeedbackEndpoint() {
  console.log('=== TESTING FEEDBACK ENDPOINT ===\n');
  
  try {
    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful');
    
    // Test 1: Submit feedback
    console.log('\n2. Testing feedback submission...');
    const feedbackResponse = await api.post('/feedback', {
      type: 'suggestion',
      subject: 'Test Feedback',
      message: 'This is a test feedback message'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('   ✅ Feedback submitted successfully');
    console.log('   Response:', feedbackResponse.data.message);
    
    // Test 2: Try to list feedback (should fail for non-admin)
    console.log('\n3. Testing feedback listing (non-admin)...');
    try {
      await api.get('/feedback', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('   ❌ Should have failed for non-admin user');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('   ✅ Correctly rejected (admin only)');
      } else {
        console.log('   ❌ Unexpected error:', err.response?.status, err.response?.data);
      }
    }
    
    console.log('\n🎉 Feedback endpoint testing completed!');
    console.log('   The new /api/feedback endpoint is working correctly.');
    
  } catch (err) {
    console.log('   ❌ Test failed:', err.message);
    if (err.response) {
      console.log('   Status:', err.response.status);
      console.log('   Response:', err.response.data);
    }
  }
}

// Run the test
testFeedbackEndpoint();