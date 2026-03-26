import express from 'express';
import { createRoom, getRoom, joinRoom, getChatHistory, updateCurrentSong, removeParticipant } from '../controllers/roomController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createRoom);

router.route('/:roomId')
  .get(protect, getRoom);

router.post('/:roomId/join', protect, joinRoom);
router.get('/:roomId/chat', protect, getChatHistory);
router.put('/:roomId/song', protect, updateCurrentSong);
router.delete('/:roomId/participants/:userId', protect, removeParticipant);

export default router;
