import mongoose from 'mongoose';

/**
 * Service Schema
 * Represents university services that students can queue for
 */
const serviceSchema = new mongoose.Schema({
  // Service Information
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  
  // Service Configuration
  category: {
    type: String,
    enum: ['academic', 'administrative', 'financial', 'support', 'other'],
    default: 'administrative',
  },
  location: {
    type: String,
    required: [true, 'Service location is required'],
    trim: true,
  },
  building: {
    type: String,
    trim: true,
  },
  floor: {
    type: String,
    trim: true,
  },
  roomNumber: {
    type: String,
    trim: true,
  },
  
  // Queue Configuration
  maxQueueSize: {
    type: Number,
    default: 50,
    min: [1, 'Minimum queue size is 1'],
  },
  averageServiceTime: {
    type: Number, // in minutes
    default: 10,
    min: [1, 'Minimum service time is 1 minute'],
  },
  
  // Operating Hours
  operatingHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true },
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true },
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true },
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true },
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true },
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '13:00' },
      isOpen: { type: Boolean, default: false },
    },
    sunday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '13:00' },
      isOpen: { type: Boolean, default: false },
    },
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isQueueOpen: {
    type: Boolean,
    default: true,
  },
  
  // Staff assigned to this service
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

/**
 * Method to check if service is currently open
 */
serviceSchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const daySchedule = this.operatingHours[currentDay];
  
  if (!daySchedule.isOpen) {
    return false;
  }
  
  return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

/**
 * Static method to get all active services
 */
serviceSchema.statics.getActiveServices = async function() {
  return await this.find({ isActive: true }).populate('assignedStaff', 'firstName lastName email');
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;
