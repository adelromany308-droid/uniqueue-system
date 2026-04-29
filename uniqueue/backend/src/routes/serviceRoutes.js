import express from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleQueue,
  getQueueStatus,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getService);
router.get('/:id/queue-status', getQueueStatus);

// Protected routes (Admin only for write operations)
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);
router.patch('/:id/toggle-queue', protect, authorize('admin', 'staff'), toggleQueue);

export default router;
