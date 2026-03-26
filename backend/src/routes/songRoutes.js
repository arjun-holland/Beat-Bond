import express from 'express';
import { getSongs, getSongById, searchSongs, uploadSong, getPopularSongs } from '../controllers/songController.js';
import { protect, admin } from '../middlewares/authMiddleware.js'; // Assuming these exist if upload was protected

const router = express.Router();

// @desc    Get popular songs
// @route   GET /api/songs/popular
// @access  Public
router.get('/popular', getPopularSongs);

// Helper to parse ISO 8601 duration (e.g. PT3M15S) into seconds
function parseIsoDuration(duration) {
  let seconds = 0;
  const daysMatch = duration.match(/(\d+)D/);
  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);
  const secondsMatch = duration.match(/(\d+)S/);

  if (daysMatch) seconds += parseInt(daysMatch[1]) * 86400;
  if (hoursMatch) seconds += parseInt(hoursMatch[1]) * 3600;
  if (minutesMatch) seconds += parseInt(minutesMatch[1]) * 60;
  if (secondsMatch) seconds += parseInt(secondsMatch[1]);

  return seconds;
}

// @desc    Search full songs via YouTube Data API v3
// @route   GET /api/songs/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ message: 'YouTube API Key is missing in environment variables' });
    }

    // 1. Fetch top 15 results from /search
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=15&key=${YOUTUBE_API_KEY}`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (!searchRes.ok) {
      throw new Error(searchData.error?.message || 'Failed to fetch search results from YouTube API');
    }

    const items = searchData.items || [];
    if (items.length === 0) {
      return res.json([]);
    }

    // 2. Extract video IDs to fetch duration from /videos
    const videoIds = items.map(item => item.id.videoId).join(',');
    
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const videoRes = await fetch(videoUrl);
    const videoData = await videoRes.json();
    
    if (!videoRes.ok) {
      throw new Error(videoData.error?.message || 'Failed to fetch video details from YouTube API');
    }

    const videoDetailsMap = {};
    (videoData.items || []).forEach(v => {
      videoDetailsMap[v.id] = {
        duration: v.contentDetails?.duration ? parseIsoDuration(v.contentDetails.duration) : 0,
      };
    });

    // 3. Map to our song schema structure
    const songs = items.map(v => {
      const videoId = v.id.videoId;
      return {
        id: videoId,
        title: v.snippet.title,
        artist: v.snippet.channelTitle,
        album: 'YouTube Audio',
        coverImage: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url,
        audioUrl: `https://www.youtube.com/watch?v=${videoId}`, // Full youtube URL
        duration: videoDetailsMap[videoId]?.duration || 0
      };
    });

    res.json(songs);
  } catch (error) {
    console.error('YouTube API Error:', error);
    res.status(500).json({ message: 'Error searching songs', error: error.message });
  }
});

router.route('/')
  .get(getSongs);

router.route('/:id')
  .get(getSongById);

export default router;
