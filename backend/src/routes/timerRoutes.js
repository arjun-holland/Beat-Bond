import express from 'express';
import { setTimer, getTimer, cancelTimer } from '../controllers/timerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, setTimer)
  .get(protect, getTimer)
  .delete(protect, cancelTimer);

export default router;
