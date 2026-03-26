import redis from '../config/redis.js';

// @desc    Set sleep timer
// @route   POST /api/timer
// @access  Private
export const setTimer = async (req, res) => {
  try {
    const { durationMinutes } = req.body;
    if (!durationMinutes) {
      return res.status(400).json({ message: 'Duration in minutes is required' });
    }

    const userId = req.user._id.toString();
    const durationMs = durationMinutes * 60 * 1000;
    const stopAt = new Date(Date.now() + durationMs);

    // Store in redis with expiry
    await redis.set(`sleep_timer:${userId}`, stopAt.toISOString(), 'EX', durationMinutes * 60);

    res.json({ message: 'Timer set', stopAt });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get active sleep timer
// @route   GET /api/timer
// @access  Private
export const getTimer = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const stopAt = await redis.get(`sleep_timer:${userId}`);
    
    if (stopAt) {
      res.json({ active: true, stopAt });
    } else {
      res.json({ active: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Cancel sleep timer
// @route   DELETE /api/timer
// @access  Private
export const cancelTimer = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await redis.del(`sleep_timer:${userId}`);
    res.json({ message: 'Timer cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
