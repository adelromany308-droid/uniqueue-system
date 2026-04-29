import QueueToken from '../models/QueueToken.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @desc    Book a queue token for a student
 * @route   POST /api/tokens
 * @access  Private/Student
 */
export const bookToken = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;

  // Validate service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  // Check if queue is open
  if (!service.isQueueOpen) {
    return res.status(400).json({
      success: false,
      message: 'Queue is currently closed for this service',
    });
  }

  // Check if service is currently open (based on operating hours)
  if (!service.isCurrentlyOpen()) {
    return res.status(400).json({
      success: false,
      message: 'Service is currently outside operating hours',
    });
  }

  // Check if student already has an active token for this service today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingToken = await QueueToken.findOne({
    student: req.user.id,
    service: serviceId,
    status: { $in: ['waiting', 'calling', 'serving'] },
    bookedAt: { $gte: today, $lt: tomorrow },
  });

  if (existingToken) {
    return res.status(400).json({
      success: false,
      message: 'You already have an active token for this service today',
      data: existingToken,
    });
  }

  // Get current queue position
  const queueCount = await QueueToken.countDocuments({
    service: serviceId,
    status: 'waiting',
    bookedAt: { $gte: today, $lt: tomorrow },
  });

  // Check if queue is full
  if (queueCount >= service.maxQueueSize) {
    return res.status(400).json({
      success: false,
      message: 'Queue is full. Please try again later.',
    });
  }

  // Create token
  const token = await QueueToken.create({
    student: req.user.id,
    service: serviceId,
    positionInQueue: queueCount + 1,
    estimatedServiceTime: service.averageServiceTime,
    estimatedWaitTime: (queueCount + 1) * service.averageServiceTime,
  });

  // Populate token with student and service info
  const populatedToken = await QueueToken.findById(token._id)
    .populate('student', 'firstName lastName email studentId')
    .populate('service', 'name location');

  res.status(201).json({
    success: true,
    message: 'Token booked successfully',
    data: populatedToken,
  });
});

/**
 * @desc    Get all tokens for current user (student) or all tokens (admin/staff)
 * @route   GET /api/tokens
 * @access  Private
 */
export const getTokens = asyncHandler(async (req, res) => {
  const { status, serviceId, date } = req.query;

  let query = {};

  // Students can only see their own tokens
  if (req.user.role === 'student') {
    query.student = req.user.id;
  }

  if (status) {
    query.status = status;
  }

  if (serviceId) {
    query.service = serviceId;
  }

  if (date) {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    query.bookedAt = { $gte: selectedDate, $lt: nextDate };
  } else {
    // Default to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    query.bookedAt = { $gte: today, $lt: tomorrow };
  }

  const tokens = await QueueToken.find(query)
    .populate('student', 'firstName lastName email studentId')
    .populate('service', 'name location')
    .populate('servedBy', 'firstName lastName')
    .sort({ bookedAt: -1 });

  res.status(200).json({
    success: true,
    count: tokens.length,
    data: tokens,
  });
});

/**
 * @desc    Get single token by ID
 * @route   GET /api/tokens/:id
 * @access  Private
 */
export const getToken = asyncHandler(async (req, res) => {
  let token = await QueueToken.findById(req.params.id)
    .populate('student', 'firstName lastName email studentId')
    .populate('service', 'name location building floor roomNumber')
    .populate('servedBy', 'firstName lastName email');

  if (!token) {
    return res.status(404).json({
      success: false,
      message: 'Token not found',
    });
  }

  // Students can only view their own tokens
  if (req.user.role === 'student' && token.student._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this token',
    });
  }

  res.status(200).json({
    success: true,
    data: token,
  });
});

/**
 * @desc    Cancel a token
 * @route   DELETE /api/tokens/:id
 * @access  Private/Student (own token) or Admin/Staff
 */
export const cancelToken = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  let token = await QueueToken.findById(req.params.id);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: 'Token not found',
    });
  }

  // Students can only cancel their own tokens
  if (req.user.role === 'student' && token.student.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this token',
    });
  }

  // Can only cancel waiting or calling tokens
  if (!['waiting', 'calling'].includes(token.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel token with status '${token.status}'`,
    });
  }

  token.status = 'cancelled';
  token.cancelledAt = new Date();
  token.cancellationReason = reason || 'No reason provided';
  await token.save();

  // Update positions for remaining tokens in queue
  await updateQueuePositions(token.service);

  res.status(200).json({
    success: true,
    message: 'Token cancelled successfully',
    data: token,
  });
});

/**
 * @desc    Call next token (for staff)
 * @route   POST /api/tokens/call-next
 * @access  Private/Staff
 */
export const callNextToken = asyncHandler(async (req, res) => {
  const { serviceId, counterNumber } = req.body;

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: 'Service ID is required',
    });
  }

  // Find next waiting token
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextToken = await QueueToken.findOne({
    service: serviceId,
    status: 'waiting',
    bookedAt: { $gte: today, $lt: tomorrow },
  }).sort({ positionInQueue: 1 });

  if (!nextToken) {
    return res.status(404).json({
      success: false,
      message: 'No tokens in queue',
    });
  }

  // Update token status
  nextToken.status = 'calling';
  nextToken.calledAt = new Date();
  nextToken.servedBy = req.user.id;
  nextToken.counterNumber = counterNumber || '1';
  await nextToken.save();

  // Populate token info
  const populatedToken = await QueueToken.findById(nextToken._id)
    .populate('student', 'firstName lastName email studentId')
    .populate('service', 'name location')
    .populate('servedBy', 'firstName lastName');

  res.status(200).json({
    success: true,
    message: 'Token called successfully',
    data: populatedToken,
  });
});

/**
 * @desc    Start serving a token
 * @route   POST /api/tokens/:id/start-service
 * @access  Private/Staff
 */
export const startService = asyncHandler(async (req, res) => {
  const token = await QueueToken.findById(req.params.id);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: 'Token not found',
    });
  }

  if (token.status !== 'calling') {
    return res.status(400).json({
      success: false,
      message: 'Token must be in "calling" status to start service',
    });
  }

  token.status = 'serving';
  token.serviceStartedAt = new Date();
  await token.save();

  res.status(200).json({
    success: true,
    message: 'Service started',
    data: token,
  });
});

/**
 * @desc    Complete service for a token
 * @route   POST /api/tokens/:id/complete
 * @access  Private/Staff
 */
export const completeService = asyncHandler(async (req, res) => {
  const token = await QueueToken.findById(req.params.id);

  if (!token) {
    return res.status(404).json({
      success: false,
      message: 'Token not found',
    });
  }

  if (!['calling', 'serving'].includes(token.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot complete token with current status',
    });
  }

  token.status = 'completed';
  token.serviceCompletedAt = new Date();
  await token.save();

  // Update queue positions
  await updateQueuePositions(token.service);

  res.status(200).json({
    success: true,
    message: 'Service completed',
    data: token,
  });
});

/**
 * Helper function to update queue positions after cancellation or completion
 */
const updateQueuePositions = async (serviceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const waitingTokens = await QueueToken.find({
    service: serviceId,
    status: 'waiting',
    bookedAt: { $gte: today, $lt: tomorrow },
  }).sort({ bookedAt: 1 });

  // Update positions
  const updatePromises = waitingTokens.map((token, index) => {
    token.positionInQueue = index + 1;
    return token.save();
  });

  await Promise.all(updatePromises);
};

/**
 * @desc    Get queue statistics for admin dashboard
 * @route   GET /api/tokens/stats
 * @access  Private/Admin
 */
export const getTokenStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateQuery = {};
  if (startDate && endDate) {
    dateQuery = {
      bookedAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  } else {
    // Default to last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    dateQuery = {
      bookedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
  }

  const stats = await QueueToken.aggregate([
    {
      $match: dateQuery,
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalTokens = await QueueToken.countDocuments(dateQuery);
  
  const result = {
    total: totalTokens,
    byStatus: {},
  };

  stats.forEach(stat => {
    result.byStatus[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
