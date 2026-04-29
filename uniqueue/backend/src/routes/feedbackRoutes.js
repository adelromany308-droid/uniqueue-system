import express from 'express';
import {
  submitFeedback,
  getFeedback,
  getFeedbackById,
  respondToFeedback,
  toggleFeedbackVisibility,
  getFeedbackStats,
  getDashboardFeedbackStats,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for service feedback stats
router.get('/stats/:serviceId', getFeedbackStats);

// Protected routes
router.post('/', protect, authorize('student'), submitFeedback);
router.get('/', protect, getFeedback);
router.get('/:id', protect, authorize('admin', 'staff'), getFeedbackById);
router.put('/:id/respond', protect, authorize('admin'), respondToFeedback);
router.patch('/:id/toggle-visibility', protect, authorize('admin'), toggleFeedbackVisibility);
router.get('/dashboard/stats', protect, authorize('admin'), getDashboardFeedbackStats);

export default router;
