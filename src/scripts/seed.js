const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_event_management';
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear existing data
    console.log('🧹 Clearing old collections...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});

    // 2. Create Users with Full Student Profiles
    console.log('👤 Creating users with student profiles...');
    const admin = await User.create({
      name: 'Campus Administrator',
      rollNo: 'ADMIN-001',
      year: 'Faculty',
      branch: 'Administration',
      section: 'Main',
      mobileNo: '9876543210',
      email: 'admin@campus.edu',
      password: 'AdminPassword123',
      role: 'ADMIN'
    });

    const student1 = await User.create({
      name: 'Rahul Sharma',
      rollNo: '21B91A0501',
      year: '3rd Year',
      branch: 'CSE',
      section: 'A',
      mobileNo: '9848012345',
      email: 'rahul@student.edu',
      password: 'StudentPassword123',
      role: 'USER'
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      rollNo: '22B91A0412',
      year: '2nd Year',
      branch: 'ECE',
      section: 'B',
      mobileNo: '9848056789',
      email: 'priya@student.edu',
      password: 'StudentPassword123',
      role: 'USER'
    });

    const student3 = await User.create({
      name: 'Amit Verma',
      rollNo: '20B91A1205',
      year: '4th Year',
      branch: 'IT',
      section: 'A',
      mobileNo: '9848099887',
      email: 'amit@student.edu',
      password: 'StudentPassword123',
      role: 'USER'
    });

    // 3. Create Events (DRAFT, PUBLISHED, NEARLY FULL, CANCELLED)
    console.log('📅 Creating events...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const draftEvent = await Event.create({
      title: 'Internal AI & ML Hackathon (Planning)',
      description: 'Annual 24-hour campus hackathon focused on Generative AI and Machine Learning innovations.',
      dateTime: nextMonth,
      venue: 'Innovation Center Lab 3',
      capacity: 50,
      status: 'DRAFT',
      createdBy: admin._id
    });

    const publishedEvent1 = await Event.create({
      title: 'National Cloud & DevOps Conference 2026',
      description: 'A full-day conference featuring keynote sessions on Kubernetes, AWS, and serverless architectures by industry architects.',
      dateTime: nextWeek,
      venue: 'Main Auditorium, Block A',
      capacity: 100,
      status: 'PUBLISHED',
      createdBy: admin._id
    });

    const nearlyFullEvent = await Event.create({
      title: 'Hands-on Ethical Hacking & Security Bootcamp',
      description: 'Intensive hands-on lab on web vulnerability assessment, API security, and CTF challenges. Limited lab seats available!',
      dateTime: tomorrow,
      venue: 'Cyber Defense Lab 102',
      capacity: 2,
      status: 'PUBLISHED',
      createdBy: admin._id
    });

    const cancelledEvent = await Event.create({
      title: 'Annual Campus Cultural Fest 2026',
      description: 'Campus-wide music and dance festival (Cancelled due to auditorium renovations).',
      dateTime: nextWeek,
      venue: 'Open Air Amphitheatre',
      capacity: 500,
      status: 'CANCELLED',
      createdBy: admin._id
    });

    // 4. Create Sample Registrations
    console.log('📝 Creating sample registrations...');
    await Registration.create({
      user: student1._id,
      event: publishedEvent1._id,
      status: 'REGISTERED'
    });

    await Registration.create({
      user: student2._id,
      event: nearlyFullEvent._id,
      status: 'REGISTERED'
    });

    console.log('\n===============================================================');
    console.log('🎉 SEEDING COMPLETED WITH STUDENT PROFILES!');
    console.log('===============================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
