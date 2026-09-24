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

    // Clean initial users state - users create their own new login credentials
    this.users = [];

    // Pre-create standard events for searching and testing registrations
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const event1 = {
      _id: '66f2a1b1c1d1e1f1a1b1c201',
      title: 'National Web & Cloud Summit 2026',
      description: 'A full-day technical conference featuring keynote sessions on AWS, Cloud Architecture, and Microservices.',
      dateTime: nextWeek,
      venue: 'Main Auditorium, Block A',
      capacity: 100,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const event2 = {
      _id: '66f2a1b1c1d1e1f1a1b1c202',
      title: 'Hands-on Ethical Hacking & Cybersecurity Workshop',
      description: 'Intensive hands-on lab on web vulnerability assessment, API security, and CTF challenges.',
      dateTime: tomorrow,
      venue: 'Cyber Defense Lab 102',
      capacity: 50,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const event3 = {
      _id: '66f2a1b1c1d1e1f1a1b1c203',
      title: 'AI & Robotics Innovation Hackathon',
      description: 'Annual 24-hour campus hackathon focused on Generative AI, Robotics, and Machine Learning prototypes.',
      dateTime: nextMonth,
      venue: 'Innovation Center Lab 3',
      capacity: 80,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const event4 = {
      _id: '66f2a1b1c1d1e1f1a1b1c204',
      title: 'Full Stack JavaScript & React Bootcamp',
      description: 'Deep dive into modern React, Next.js, Node.js API development, and deployment pipelines.',
      dateTime: nextWeek,
      venue: 'Seminar Hall 2, Block C',
      capacity: 60,
      status: 'PUBLISHED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.events = [event1, event2, event3, event4];
    this.registrations = [];
    this.isInitialized = true;
    console.log('🌱 Database initialized with clean user store and searchable events.');
  }

  generateId() {
    return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  }
}

const memoryStore = new MemoryStore();
memoryStore.initSeed();

module.exports = memoryStore;
