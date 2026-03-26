import express from 'express';
import { getUserProfile, updateUserProfile, getListeningHistory } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/history', protect, getListeningHistory);

export default router;
