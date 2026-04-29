import mongoose from 'mongoose';

/**
 * Feedback Schema
 * Stores student feedback after receiving service
 */
const feedbackSchema = new mongoose.Schema({
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
  queueToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QueueToken',
    required: [true, 'Queue token is required'],
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5'],
  },
  
  // Feedback content
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  
  // Service quality aspects
  serviceQuality: {
    type: Number,
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5'],
  },
  waitTimeSatisfaction: {
    type: Number,
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5'],
  },
  staffBehavior: {
    type: Number,
    min: [1, 'Minimum rating is 1'],
    max: [5, 'Maximum rating is 5'],
  },
  
  // Suggestions
  suggestions: {
    type: String,
    trim: true,
    maxlength: [500, 'Suggestions cannot exceed 500 characters'],
  },
  
  // Status
  isVisible: {
    type: Boolean,
    default: true,
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
  adminResponse: {
    type: String,
    maxlength: [500, 'Response cannot exceed 500 characters'],
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  respondedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

/**
 * Indexes for efficient querying
 */
feedbackSchema.index({ student: 1 });
feedbackSchema.index({ service: 1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ createdAt: -1 });

/**
 * Static method to get average rating for a service
 */
feedbackSchema.statics.getAverageRating = async function(serviceId) {
  const result = await this.aggregate([
    {
      $match: {
        service: new mongoose.Types.ObjectId(serviceId),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalFeedbacks: { $sum: 1 },
      },
    },
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalFeedbacks: 0 };
};

/**
 * Static method to get feedback statistics
 */
feedbackSchema.statics.getFeedbackStats = async function(serviceId) {
  const stats = await this.aggregate([
    {
      $match: {
        service: new mongoose.Types.ObjectId(serviceId),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats.forEach(stat => {
    ratingDistribution[stat._id] = stat.count;
  });
  
  return ratingDistribution;
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
