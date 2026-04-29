import Feedback from '../models/Feedback.js';
import QueueToken from '../models/QueueToken.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @desc    Submit feedback for a completed service
 * @route   POST /api/feedback
 * @access  Private/Student
 */
export const submitFeedback = asyncHandler(async (req, res) => {
  const { queueTokenId, rating, comment, serviceQuality, waitTimeSatisfaction, staffBehavior, suggestions } = req.body;

  // Validate queue token exists and belongs to student
  const token = await QueueToken.findOne({
    _id: queueTokenId,
    student: req.user.id,
  });

  if (!token) {
    return res.status(404).json({
      success: false,
      message: 'Queue token not found or does not belong to you',
    });
  }

  // Check if token is completed
  if (token.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Can only submit feedback for completed services',
    });
  }

  // Check if feedback already exists for this token
  const existingFeedback = await Feedback.findOne({ queueToken: queueTokenId });
  if (existingFeedback) {
    return res.status(400).json({
      success: false,
      message: 'Feedback already submitted for this service',
    });
  }

  const feedback = await Feedback.create({
    student: req.user.id,
    service: token.service,
    queueToken: queueTokenId,
    rating,
    comment,
    serviceQuality,
    waitTimeSatisfaction,
    staffBehavior,
    suggestions,
  });

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    data: feedback,
  });
});

/**
 * @desc    Get all feedback (admin) or user's feedback (student)
 * @route   GET /api/feedback
 * @access  Private
 */
export const getFeedback = asyncHandler(async (req, res) => {
  const { serviceId, rating, page = 1, limit = 10 } = req.query;

  let query = {};

  // Students can only see their own feedback
  if (req.user.role === 'student') {
    query.student = req.user.id;
  } else if (req.user.role === 'staff') {
    // Staff can see feedback for services they're assigned to
    query.isVisible = true;
  }

  if (serviceId) {
    query.service = serviceId;
  }

  if (rating) {
    query.rating = parseInt(rating);
  }

  // Only show visible feedback (for non-students)
  if (req.user.role !== 'student') {
    query.isVisible = true;
  }

  const skip = (page - 1) * limit;

  const feedbacks = await Feedback.find(query)
    .populate('student', 'firstName lastName email studentId')
    .populate('service', 'name')
    .populate('queueToken', 'tokenNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Feedback.countDocuments(query);

  res.status(200).json({
    success: true,
    count: feedbacks.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: feedbacks,
  });
});

/**
 * @desc    Get single feedback by ID
 * @route   GET /api/feedback/:id
 * @access  Private/Admin
 */
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('student', 'firstName lastName email studentId')
    .populate('service', 'name location')
    .populate('queueToken', 'tokenNumber status')
    .populate('respondedBy', 'firstName lastName');

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found',
    });
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

/**
 * @desc    Respond to feedback (admin)
 * @route   PUT /api/feedback/:id/respond
 * @access  Private/Admin
 */
export const respondToFeedback = asyncHandler(async (req, res) => {
  const { response } = req.body;

  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found',
    });
  }

  feedback.adminResponse = response;
  feedback.isReviewed = true;
  feedback.respondedBy = req.user.id;
  feedback.respondedAt = new Date();
  await feedback.save();

  res.status(200).json({
    success: true,
    message: 'Response submitted successfully',
    data: feedback,
  });
});

/**
 * @desc    Toggle feedback visibility
 * @route   PATCH /api/feedback/:id/toggle-visibility
 * @access  Private/Admin
 */
export const toggleFeedbackVisibility = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found',
    });
  }

  feedback.isVisible = !feedback.isVisible;
  await feedback.save();

  res.status(200).json({
    success: true,
    message: `Feedback ${feedback.isVisible ? 'made visible' : 'hidden'} successfully`,
    data: {
      id: feedback._id,
      isVisible: feedback.isVisible,
    },
  });
});

/**
 * @desc    Get feedback statistics for a service
 * @route   GET /api/feedback/stats/:serviceId
 * @access  Public
 */
export const getFeedbackStats = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const averageRating = await Feedback.getAverageRating(serviceId);
  const ratingDistribution = await Feedback.getFeedbackStats(serviceId);

  // Get recent feedbacks
  const recentFeedbacks = await Feedback.find({
    service: serviceId,
    isVisible: true,
  })
    .populate('student', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      averageRating: averageRating.averageRating.toFixed(1),
      totalFeedbacks: averageRating.totalFeedbacks,
      ratingDistribution,
      recentFeedbacks,
    },
  });
});

/**
 * @desc    Get overall dashboard feedback stats
 * @route   GET /api/feedback/dashboard-stats
 * @access  Private/Admin
 */
export const getDashboardFeedbackStats = asyncHandler(async (req, res) => {
  const totalFeedbacks = await Feedback.countDocuments({ isVisible: true });
  
  const averageRating = await Feedback.aggregate([
    { $match: { isVisible: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const ratingByService = await Feedback.aggregate([
    { $match: { isVisible: true } },
    {
      $group: {
        _id: '$service',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: '_id',
        as: 'service',
      },
    },
    { $unwind: '$service' },
    {
      $project: {
        serviceName: '$service.name',
        avgRating: { $round: ['$avgRating', 1] },
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalFeedbacks,
      averageRating: averageRating.length > 0 ? averageRating[0].avgRating.toFixed(1) : 0,
      topRatedServices: ratingByService,
    },
  });
});
