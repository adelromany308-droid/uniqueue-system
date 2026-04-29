import Service from '../models/Service.js';
import QueueToken from '../models/QueueToken.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
export const getServices = asyncHandler(async (req, res) => {
  const { category, isActive, isQueueOpen } = req.query;

  // Build query
  let query = {};

  if (category) {
    query.category = category;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (isQueueOpen !== undefined) {
    query.isQueueOpen = isQueueOpen === 'true';
  }

  const services = await Service.find(query)
    .populate('assignedStaff', 'firstName lastName email')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

/**
 * @desc    Get single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
export const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('assignedStaff', 'firstName lastName email');

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  // Get queue status for this service
  const queueStatus = await QueueToken.getQueueStatus(service._id);

  res.status(200).json({
    success: true,
    data: {
      ...service.toObject(),
      queueStatus,
    },
  });
});

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Private/Admin
 */
export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: service,
  });
});

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private/Admin
 */
export const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Service updated successfully',
    data: service,
  });
});

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private/Admin
 */
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  // Check if there are active tokens for this service
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeTokens = await QueueToken.countDocuments({
    service: req.params.id,
    status: { $in: ['waiting', 'calling', 'serving'] },
    bookedAt: { $gte: today, $lt: tomorrow },
  });

  if (activeTokens > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete service with ${activeTokens} active token(s). Please complete or cancel all tokens first.`,
    });
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully',
    data: {},
  });
});

/**
 * @desc    Toggle queue open/close for a service
 * @route   PATCH /api/services/:id/toggle-queue
 * @access  Private/Admin/Staff
 */
export const toggleQueue = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  service.isQueueOpen = !service.isQueueOpen;
  await service.save();

  res.status(200).json({
    success: true,
    message: `Queue ${service.isQueueOpen ? 'opened' : 'closed'} successfully`,
    data: {
      isQueueOpen: service.isQueueOpen,
    },
  });
});

/**
 * @desc    Get queue status for a service
 * @route   GET /api/services/:id/queue-status
 * @access  Public
 */
export const getQueueStatus = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found',
    });
  }

  const queueStatus = await QueueToken.getQueueStatus(service._id);

  // Calculate average wait time
  const waitingTokens = await QueueToken.find({
    service: service._id,
    status: 'waiting',
  }).sort({ positionInQueue: 1 });

  let totalWaitTime = 0;
  waitingTokens.forEach(token => {
    totalWaitTime += token.positionInQueue * service.averageServiceTime;
  });

  const avgWaitTime = waitingTokens.length > 0 
    ? Math.round(totalWaitTime / waitingTokens.length) 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      service: service.name,
      ...queueStatus,
      averageWaitTime: avgWaitTime,
      isQueueOpen: service.isQueueOpen,
    },
  });
});
