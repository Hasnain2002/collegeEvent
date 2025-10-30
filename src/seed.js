import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Review from './models/Review.js';
import Exhibitor from './models/Exhibitor.js';
import Session from './models/Session.js';
import { generateQRCodeDataUrl } from './utils/qrcode.js';

async function run() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Review.deleteMany({}),
    Exhibitor.deleteMany({}),
    Session.deleteMany({}),
  ]);

  const customer = await User.create({ name: 'Alice Customer', email: 'customer@example.com', password: 'password', role: 'customer' });
  const organizer = await User.create({ name: 'Oscar Organizer', email: 'organizer@example.com', password: 'password', role: 'organizer' });
  const admin = await User.create({ name: 'Adam Admin', email: 'owais@gmail.com', password: 'password', role: 'admin' });
  const users = [customer, organizer, admin];

  // Events by organizer (two approved, one pending)
  const now = new Date();
  const events = await Event.insertMany([
    {
      title: 'Tech Talk: MERN Essentials',
      description: 'Intro to MERN stack for campus developers.',
      category: 'Tech',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      location: 'Auditorium A',
      capacity: 100,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '/mern-stack-skills-feature-image.avif',
      tags: ['mern', 'javascript'],
    },
    {
      title: 'Inter-College Football Meet',
      description: 'Friendly football matches and skills workshop.',
      category: 'Sports',
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      location: 'Sports Ground',
      capacity: 60,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '/football.jpg',
      tags: ['outdoor'],
    },
    {
      title: 'Photography Basics Workshop',
      description: 'Hands-on with composition and lighting.',
      category: 'Workshop',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      location: 'Lab 204',
      capacity: 30,
      organizer: organizer._id,
      status: 'pending',
      posterUrl: '/photography.jpg',
      tags: ['creative'],
    },
    {
      title: 'Cultural Night 2025',
      description: 'Dance, music, and drama from student clubs.',
      category: 'Cultural',
      date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      location: 'Open Air Theatre',
      capacity: 200,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '/cultural night.png',
      tags: ['fest'],
    },
    {
      title: 'Hackathon: Build for Campus',
      description: '24-hour hackathon to build campus utilities.',
      category: 'Tech',
      date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      location: 'Innovation Lab',
      capacity: 80,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '/hackathon.avif',
      tags: ['hackathon'],
    },
    {
      title: 'Wellness Yoga Morning',
      description: 'Relaxing yoga session for all students.',
      category: 'Workshop',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      location: 'Campus Lawn',
      capacity: 50,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '/yoga.jpg',
      tags: ['health'],
    },
  ]);

  // Sample exhibitors
  const exhibitors = await Exhibitor.insertMany([
    {
      companyName: 'Tech Innovations Inc.',
      description: 'Leading provider of cutting-edge technology solutions for education',
      products: 'Educational software, learning platforms, VR training modules',
      category: 'Technology',
      contactEmail: 'info@techinnovations.com',
      contactPhone: '+1 (555) 123-4567',
      website: 'https://www.techinnovations.com',
      logoUrl: '/tech-logo.png',
      booth: {
        number: 'A1',
        row: 'Front',
        size: 'Large'
      },
      approved: true,
      organizer: organizer._id
    },
    {
      companyName: 'Campus Food Services',
      description: 'Delicious and healthy food options for college events',
      products: 'Food trucks, catering services, beverage stations',
      category: 'Food & Beverage',
      contactEmail: 'orders@campusfood.com',
      contactPhone: '+1 (555) 987-6543',
      website: 'https://www.campusfood.com',
      logoUrl: '/food-logo.png',
      booth: {
        number: 'B3',
        row: 'Back',
        size: 'Medium'
      },
      approved: true,
      organizer: organizer._id
    },
    {
      companyName: 'Art Supplies Co.',
      description: 'Premium art materials and creative supplies for students',
      products: 'Paints, canvases, brushes, sculpting tools',
      category: 'Arts & Crafts',
      contactEmail: 'support@artsupplies.com',
      contactPhone: '+1 (555) 456-7890',
      website: 'https://www.artsupplies.com',
      logoUrl: '/art-logo.png',
      booth: {
        number: 'C2',
        row: 'Middle',
        size: 'Small'
      },
      approved: false,
      organizer: organizer._id
    }
  ]);

  // Sample sessions
  const sessions = await Session.insertMany([
    {
      title: 'Introduction to React Hooks',
      description: 'Learn how to use React Hooks to simplify your components and manage state effectively.',
      speaker: 'Jane Smith',
      location: 'Room 101',
      dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
      image: '/mern-stack-skills-feature-image.avif'
    },
    {
      title: 'Advanced CSS Techniques',
      description: 'Discover modern CSS techniques including Grid, Flexbox, and animations.',
      speaker: 'John Doe',
      location: 'Room 205',
      dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      duration: 90,
      image: '/photography.jpg'
    },
    {
      title: 'Building RESTful APIs',
      description: 'Learn best practices for designing and implementing RESTful APIs.',
      speaker: 'Alex Johnson',
      location: 'Lab 301',
      dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      duration: 120,
      image: '/hackathon.avif'
    }
  ]);

  // Registration for customer for first approved event with QR
  const payload = JSON.stringify({ userId: customer._id.toString(), eventId: events[0]._id.toString(), at: Date.now() });
  const qr = await generateQRCodeDataUrl(payload);
  await Registration.create({ user: customer._id, event: events[0]._id, qrCodeDataUrl: qr, status: 'approved' });

  // Review by customer
  const review = await Review.create({ user: customer._id, event: events[0]._id, rating: 5, comment: 'Great session!' });
  await Event.findByIdAndUpdate(events[0]._id, { averageRating: 5 });

  // Award some points
  await User.findByIdAndUpdate(customer._id, { $inc: { points: 25 } });

  console.log('Seeded users:', users.map(u => ({ email: u.email, role: u.role })));
  console.log('Seeded events:', events.map(e => ({ title: e.title, status: e.status })));
  console.log('Seeded exhibitors:', exhibitors.map(e => ({ companyName: e.companyName, approved: e.approved })));
  console.log('Seeded sessions:', sessions.map(s => ({ title: s.title, speaker: s.speaker })));
  console.log('One registration + review created for customer.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});