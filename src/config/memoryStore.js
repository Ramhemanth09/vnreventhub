const bcrypt = require('bcryptjs');

/**
 * High-Performance In-Memory Data Store & Fallback Engine
 * Ensures 100% backend uptime and functionality even when local MongoDB daemon is not running.
 */
class MemoryStore {
  constructor() {
    this.users = [];
    this.events = [];
    this.registrations = [];
    this.isInitialized = false;
  }

  async initSeed() {
    if (this.isInitialized) return;

    // 1. Create Default Users (Hashed Passwords + Student Information)
    const adminPassword = await bcrypt.hash('AdminPassword123', 10);
    const studentPassword = await bcrypt.hash('StudentPassword123', 10);

    const admin = {
      _id: '66f2a1b1c1d1e1f1a1b1c101',
      name: 'Campus Administrator',
      rollNo: 'ADMIN-001',
      year: 'Faculty',
      branch: 'Administration',
      section: 'Main',
      mobileNo: '9876543210',
      email: 'admin@campus.edu',
      password: adminPassword,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const student1 = {
      _id: '66f2a1b1c1d1e1f1a1b1c102',
      name: 'Rahul Sharma',
      rollNo: '21B91A0501',
      year: '3rd Year',
      branch: 'CSE',
      section: 'A',
      mobileNo: '9848012345',
      email: 'rahul@student.edu',
      password: studentPassword,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const student2 = {
      _id: '66f2a1b1c1d1e1f1a1b1c103',
      name: 'Priya Patel',
      rollNo: '22B91A0412',
      year: '2nd Year',
      branch: 'ECE',
      section: 'B',
      mobileNo: '9848056789',
      email: 'priya@student.edu',
      password: studentPassword,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const student3 = {
      _id: '66f2a1b1c1d1e1f1a1b1c104',
      name: 'Amit Verma',
      rollNo: '20B91A1205',
      year: '4th Year',
      branch: 'IT',
      section: 'A',
      mobileNo: '9848099887',
      email: 'amit@student.edu',
      password: studentPassword,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users = [admin, student1, student2, student3];

    // 2. Create Events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const draftEvent = {
      _id: '66f2a1b1c1d1e1f1a1b1c201',
      title: 'Internal AI & ML Hackathon (Planning)',
      description: 'Annual 24-hour campus hackathon focused on Generative AI and Machine Learning innovations.',
      dateTime: nextMonth,
      venue: 'Innovation Center Lab 3',
      capacity: 50,
      status: 'DRAFT',
      createdBy: admin._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const publishedEvent1 = {
      _id: '66f2a1b1c1d1e1f1a1b1c202',
      title: 'National Cloud & DevOps Conference 2026',
      description: 'A full-day conference featuring keynote sessions on Kubernetes, AWS, and serverless architectures by industry architects.',
      dateTime: nextWeek,
      venue: 'Main Auditorium, Block A',
      capacity: 100,
      status: 'PUBLISHED',
      createdBy: admin._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const nearlyFullEvent = {
      _id: '66f2a1b1c1d1e1f1a1b1c203',
      title: 'Hands-on Ethical Hacking & Security Bootcamp',
      description: 'Intensive hands-on lab on web vulnerability assessment, API security, and CTF challenges. Limited lab seats available!',
      dateTime: tomorrow,
      venue: 'Cyber Defense Lab 102',
      capacity: 2,
      status: 'PUBLISHED',
      createdBy: admin._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const cancelledEvent = {
      _id: '66f2a1b1c1d1e1f1a1b1c204',
      title: 'Annual Campus Cultural Fest 2026',
      description: 'Campus-wide music and dance festival (Cancelled due to auditorium renovations).',
      dateTime: nextWeek,
      venue: 'Open Air Amphitheatre',
      capacity: 500,
      status: 'CANCELLED',
      createdBy: admin._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.events = [draftEvent, publishedEvent1, nearlyFullEvent, cancelledEvent];

    // 3. Create Registrations
    const reg1 = {
      _id: '66f2a1b1c1d1e1f1a1b1c301',
      user: student1._id,
      event: publishedEvent1._id,
      status: 'REGISTERED',
      registeredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reg2 = {
      _id: '66f2a1b1c1d1e1f1a1b1c302',
      user: student2._id,
      event: nearlyFullEvent._id,
      status: 'REGISTERED',
      registeredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.registrations = [reg1, reg2];
    this.isInitialized = true;
    console.log('🌱 In-Memory Database initialized with student profiles & seed dataset.');
  }

  generateId() {
    return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  }
}

const memoryStore = new MemoryStore();
memoryStore.initSeed();

module.exports = memoryStore;
