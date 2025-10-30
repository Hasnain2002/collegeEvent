// Database test to verify all collections are accessible
const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabase() {
  console.log('=== DATABASE CONNECTION TEST ===\n');
  
  try {
    // Connect to database
    console.log('1. Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventmanager');
    console.log('   ✅ Database connected successfully');
    
    // Test all models
    console.log('\n2. Testing all collections...');
    
    // Test Users collection
    const User = require('./src/models/User.js').default;
    const userCount = await User.countDocuments();
    console.log(`   Users collection: ${userCount} documents`);
    
    // Test Events collection
    const Event = require('./src/models/Event.js').default;
    const eventCount = await Event.countDocuments();
    console.log(`   Events collection: ${eventCount} documents`);
    
    // Test Reviews collection
    const Review = require('./src/models/Review.js').default;
    const reviewCount = await Review.countDocuments();
    console.log(`   Reviews collection: ${reviewCount} documents`);
    
    // Test Sessions collection
    const Session = require('./src/models/Session.js').default;
    const sessionCount = await Session.countDocuments();
    console.log(`   Sessions collection: ${sessionCount} documents`);
    
    // Test Registrations collection
    const Registration = require('./src/models/Registration.js').default;
    const registrationCount = await Registration.countDocuments();
    console.log(`   Registrations collection: ${registrationCount} documents`);
    
    // Test Feedback collection (newly added)
    const Feedback = require('./src/models/Feedback.js').default;
    const feedbackCount = await Feedback.countDocuments();
    console.log(`   Feedback collection: ${feedbackCount} documents`);
    
    console.log('\n🎉 ALL DATABASE COLLECTIONS ARE ACCESSIBLE!');
    console.log('\nSummary of collections:');
    console.log(`✅ Users: ${userCount} documents`);
    console.log(`✅ Events: ${eventCount} documents`);
    console.log(`✅ Reviews: ${reviewCount} documents`);
    console.log(`✅ Sessions: ${sessionCount} documents`);
    console.log(`✅ Registrations: ${registrationCount} documents`);
    console.log(`✅ Feedback: ${feedbackCount} documents (NEW)`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    
  } catch (err) {
    console.log('   ❌ Test failed:', err.message);
    console.log('   Error stack:', err.stack);
  }
}

// Run the database test
testDatabase();