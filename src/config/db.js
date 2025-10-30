import { env } from './env.js';

// Check if we're in development and should use in-memory DB
const useMemoryDb = env.nodeEnv === 'development' && !process.env.MONGO_URI;

if (useMemoryDb) {
  console.log('Using in-memory database for development');
}

// Export flag for controllers to know which DB to use
export const usingMemoryDb = useMemoryDb;

// Import memory DB only if needed
let memoryDbUtils;
if (useMemoryDb) {
  const { memoryDbUtils: utils } = await import('./memoryDb.js');
  memoryDbUtils = utils;
}

export async function connectDB() {
  if (useMemoryDb) {
    // Initialize some sample data for development
    if (memoryDbUtils) {
      // Add sample event
      await memoryDbUtils.create('events', {
        title: 'Tech Conference 2025',
        description: 'Annual technology conference with industry leaders',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
        location: 'Convention Center',
        price: 99.99,
        organizer: 'Organizer Inc.',
        status: 'approved'
      });
      
      // Add another sample event
      await memoryDbUtils.create('events', {
        title: 'Music Festival',
        description: 'Three-day music festival with top artists',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks from now
        location: 'Central Park',
        price: 149.99,
        organizer: 'Festival Corp',
        status: 'approved'
      });
    }
    
    console.log('In-memory database initialized with sample data');
    return;
  }
  
  // Use MongoDB for production or when MONGO_URI is set
  const { default: mongoose } = await import('mongoose');
  const mongoUri = env.mongoUri;
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(mongoUri, {
      dbName: mongoUri.split('/').pop(),
    });
    console.log('MongoDB connected');
    
    // Even if MongoDB connects, for development we want sample data
    // Check if we're in development and create sample data in memory
    if (env.nodeEnv === 'development') {
      const { memoryDbUtils: utils } = await import('./memoryDb.js');
      memoryDbUtils = utils;
      
      // Clear existing data
      if (typeof memoryDbUtils !== 'undefined' && typeof memoryDbUtils.memoryDb !== 'undefined') {
        memoryDbUtils.memoryDb.events = [];
      }
      
      // Add sample data
      const event1 = await memoryDbUtils.create('events', {
        title: 'Tech Conference 2025',
        description: 'Annual technology conference with industry leaders',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Convention Center',
        price: 99.99,
        organizer: 'Organizer Inc.',
        status: 'approved'
      });
      console.log('Created sample event 1:', event1);
      
      const event2 = await memoryDbUtils.create('events', {
        title: 'Music Festival',
        description: 'Three-day music festival with top artists',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'Central Park',
        price: 149.99,
        organizer: 'Festival Corp',
        status: 'approved'
      });
      console.log('Created sample event 2:', event2);
      
      // Verify the data was actually stored
      const allEvents = await memoryDbUtils.find('events', {});
      console.log('All events in memory DB:', allEvents);
      
      console.log('Sample data created for development mode');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Falling back to in-memory database for development');
    
    // Initialize in-memory DB as fallback
    const { memoryDbUtils: utils } = await import('./memoryDb.js');
    memoryDbUtils = utils;
    
    // Clear existing data
    if (typeof memoryDbUtils !== 'undefined' && typeof memoryDbUtils.memoryDb !== 'undefined') {
      memoryDbUtils.memoryDb.events = [];
    }
    
    // Add sample data
    const event1 = await memoryDbUtils.create('events', {
      title: 'Tech Conference 2025',
      description: 'Annual technology conference with industry leaders',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: 'Convention Center',
      price: 99.99,
      organizer: 'Organizer Inc.',
      status: 'approved'
    });
    console.log('Created sample event 1:', event1);
    
    const event2 = await memoryDbUtils.create('events', {
      title: 'Music Festival',
      description: 'Three-day music festival with top artists',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'Central Park',
      price: 149.99,
      organizer: 'Festival Corp',
      status: 'approved'
    });
    console.log('Created sample event 2:', event2);
    
    // Verify the data was actually stored
    const allEvents = await memoryDbUtils.find('events', {});
    console.log('All events in memory DB:', allEvents);
    
    console.log('In-memory database initialized with sample data');
  }
}


