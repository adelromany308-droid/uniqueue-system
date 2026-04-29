import mongoose from 'mongoose';

/**
 * Queue Token Schema
 * Represents a student's place in queue for a specific service
 */
const queueTokenSchema = new mongoose.Schema({
  // Token Information
  tokenNumber: {
    type: String,
    required: true,
  },
  
  // Relationships
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required'],
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required'],
  },
  
  // Queue Status
  status: {
    type: String,
    enum: ['waiting', 'calling', 'serving', 'completed', 'cancelled', 'no-show'],
    default: 'waiting',
  },
  
  // Position tracking
  positionInQueue: {
    type: Number,
    required: true,
  },
  
  // Timing
  bookedAt: {
    type: Date,
    default: Date.now,
  },
  calledAt: {
    type: Date,
  },
  serviceStartedAt: {
    type: Date,
  },
  serviceCompletedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  
  // Estimated times
  estimatedWaitTime: {
    type: Number, // in minutes
    default: 0,
  },
  estimatedServiceTime: {
    type: Number, // in minutes
    default: 10,
  },
  
  // Service details
  servedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  counterNumber: {
    type: String,
  },
  
  // Notifications
  notificationSent: {
    type: Boolean,
    default: false,
  },
  notificationSentAt: {
    type: Date,
  },
  
  // Cancellation reason
  cancellationReason: {
    type: String,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
  },
  
  // Additional notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

/**
 * Indexes for efficient querying
 */
queueTokenSchema.index({ student: 1, status: 1 });
queueTokenSchema.index({ service: 1, status: 1 });
queueTokenSchema.index({ bookedAt: -1 });

/**
 * Pre-save middleware to generate token number
 */
queueTokenSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Generate token number: SERVICE_CODE-YYYYMMDD-XXXX
      const service = await mongoose.model('Service').findById(this.service);
      const serviceCode = service.name.substring(0, 3).toUpperCase();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get count of tokens today for this service
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const count = await mongoose.model('QueueToken').countDocuments({
        service: this.service,
        bookedAt: { $gte: today, $lt: tomorrow },
      });
      
      this.tokenNumber = `${serviceCode}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

/**
 * Method to calculate wait time
 */
queueTokenSchema.methods.calculateWaitTime = function() {
  if (!this.service) return 0;
  
  // Simple calculation: position * average service time
  return this.positionInQueue * this.estimatedServiceTime;
};

/**
 * Static method to get next token number for a service
 */
queueTokenSchema.statics.getNextTokenNumber = async function(serviceId) {
  const service = await mongoose.model('Service').findById(serviceId);
  if (!service) throw new Error('Service not found');
  
  const serviceCode = service.name.substring(0, 3).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const count = await this.countDocuments({
    service: serviceId,
    bookedAt: { $gte: today, $lt: tomorrow },
  });
  
  return `${serviceCode}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Static method to get current queue status for a service
 */
queueTokenSchema.statics.getQueueStatus = async function(serviceId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const waitingCount = await this.countDocuments({
    service: serviceId,
    status: 'waiting',
    bookedAt: { $gte: today, $lt: tomorrow },
  });
  
  const servingCount = await this.countDocuments({
    service: serviceId,
    status: { $in: ['calling', 'serving'] },
    bookedAt: { $gte: today, $lt: tomorrow },
  });
  
  const completedCount = await this.countDocuments({
    service: serviceId,
    status: 'completed',
    bookedAt: { $gte: today, $lt: tomorrow },
  });
  
  return {
    waiting: waitingCount,
    serving: servingCount,
    completed: completedCount,
    total: waitingCount + servingCount + completedCount,
  };
};

const QueueToken = mongoose.model('QueueToken', queueTokenSchema);

export default QueueToken;
