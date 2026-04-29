import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Service from '../models/Service.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

/**
 * Seed database with sample data
 * Run with: npm run seed
 */
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@uniqueue.edu',
      password: 'password123',
      role: 'admin',
      isActive: true,
      isVerified: true,
    });
    console.log('✅ Admin user created');

    // Create staff users
    const staff1 = await User.create({
      firstName: 'John',
      lastName: 'Staff',
      email: 'staff1@uniqueue.edu',
      password: 'password123',
      role: 'staff',
      staffId: 'STF001',
      isActive: true,
      isVerified: true,
    });

    const staff2 = await User.create({
      firstName: 'Jane',
      lastName: 'Staff',
      email: 'staff2@uniqueue.edu',
      password: 'password123',
      role: 'staff',
      staffId: 'STF002',
      isActive: true,
      isVerified: true,
    });
    console.log('✅ Staff users created');

    // Create student users
    const students = await User.insertMany([
      {
        firstName: 'Alice',
        lastName: 'Student',
        email: 'alice@student.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STD001',
        department: 'Computer Science',
        yearOfStudy: 2,
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'Bob',
        lastName: 'Student',
        email: 'bob@student.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STD002',
        department: 'Engineering',
        yearOfStudy: 3,
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'Carol',
        lastName: 'Student',
        email: 'carol@student.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STD003',
        department: 'Business',
        yearOfStudy: 1,
        isActive: true,
        isVerified: true,
      },
    ]);
    console.log('✅ Student users created');

    // Create services
    const services = await Service.insertMany([
      {
        name: 'Student Affairs',
        description: 'General student affairs and inquiries',
        category: 'administrative',
        location: 'Main Building',
        building: 'Administration Block',
        floor: '1st Floor',
        roomNumber: '101',
        maxQueueSize: 50,
        averageServiceTime: 15,
        assignedStaff: [staff1._id],
        isActive: true,
        isQueueOpen: true,
      },
      {
        name: 'Admissions Office',
        description: 'Admissions inquiries and applications',
        category: 'administrative',
        location: 'Main Building',
        building: 'Administration Block',
        floor: 'Ground Floor',
        roomNumber: 'G02',
        maxQueueSize: 40,
        averageServiceTime: 20,
        assignedStaff: [staff2._id],
        isActive: true,
        isQueueOpen: true,
      },
      {
        name: 'Financial Aid',
        description: 'Scholarships, loans, and financial assistance',
        category: 'financial',
        location: 'Finance Building',
        building: 'Finance Block',
        floor: '2nd Floor',
        roomNumber: '205',
        maxQueueSize: 30,
        averageServiceTime: 25,
        assignedStaff: [staff1._id],
        isActive: true,
        isQueueOpen: true,
      },
      {
        name: 'Academic Records',
        description: 'Transcripts, certificates, and academic documents',
        category: 'academic',
        location: 'Library Building',
        building: 'Library',
        floor: '3rd Floor',
        roomNumber: '301',
        maxQueueSize: 35,
        averageServiceTime: 10,
        assignedStaff: [staff2._id],
        isActive: true,
        isQueueOpen: true,
      },
      {
        name: 'IT Support',
        description: 'Technical support for students',
        category: 'support',
        location: 'IT Center',
        building: 'Technology Block',
        floor: '1st Floor',
        roomNumber: '110',
        maxQueueSize: 25,
        averageServiceTime: 30,
        assignedStaff: [staff1._id, staff2._id],
        isActive: true,
        isQueueOpen: true,
      },
    ]);
    console.log('✅ Services created');

    // Update staff with assigned services
    staff1.assignedServices = [services[0]._id, services[2]._id, services[4]._id];
    staff2.assignedServices = [services[1]._id, services[3]._id];
    await staff1.save();
    await staff2.save();

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@uniqueue.edu / password123');
    console.log('Staff 1: staff1@uniqueue.edu / password123');
    console.log('Staff 2: staff2@uniqueue.edu / password123');
    console.log('Student: alice@student.edu / password123');
    console.log('Student: bob@student.edu / password123');
    console.log('Student: carol@student.edu / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedData();
