import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Supports three roles: student, admin, staff
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
  },
  
  // Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  
  // Role Management
  role: {
    type: String,
    enum: ['student', 'admin', 'staff'],
    default: 'student',
  },
  
  // Student-specific fields
  studentId: {
    type: String,
    sparse: true, // Allows null values but unique when present
    unique: true,
  },
  department: {
    type: String,
  },
  yearOfStudy: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  // Staff-specific fields
  staffId: {
    type: String,
    sparse: true,
  },
  assignedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare passwords
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to get full name
 */
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

const User = mongoose.model('User', userSchema);

export default User;
