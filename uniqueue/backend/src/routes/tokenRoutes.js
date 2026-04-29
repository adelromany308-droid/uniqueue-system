import express from 'express';
import {
  bookToken,
  getTokens,
  getToken,
  cancelToken,
  callNextToken,
  startService,
  completeService,
  getTokenStats,
} from '../controllers/tokenController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/', protect, authorize('student'), bookToken);
router.get('/', protect, getTokens);
router.get('/:id', protect, getToken);
router.delete('/:id', protect, cancelToken);

// Staff routes
router.post('/call-next', protect, authorize('staff', 'admin'), callNextToken);
router.post('/:id/start-service', protect, authorize('staff', 'admin'), startService);
router.post('/:id/complete', protect, authorize('staff', 'admin'), completeService);

// Admin stats
router.get('/stats/overview', protect, authorize('admin'), getTokenStats);

export default router;
