import express from 'express';
import { 
  createPlaylist, 
  getUserPlaylists, 
  getPlaylistById, 
  addSongToPlaylist, 
  removeSongFromPlaylist 
} from '../controllers/playlistController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPlaylist);

router.route('/me')
  .get(protect, getUserPlaylists);

router.route('/:id')
  .get(protect, getPlaylistById);

router.route('/:id/add')
  .put(protect, addSongToPlaylist);

router.route('/:id/remove')
  .put(protect, removeSongFromPlaylist);

export default router;
