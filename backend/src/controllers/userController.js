import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('playlists');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        playlists: user.playlists,
        listeningHistory: user.listeningHistory,
        totalListeningTime: user.totalListeningTime
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.profileImage = req.body.profileImage || user.profileImage;

      // Updating password if provided
      if (req.body.password) {
        // Need to hash again but since we have a controller we can do it here
        const bcrypt = await import('bcrypt');
        const salt = await bcrypt.default.genSalt(10);
        user.password = await bcrypt.default.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user's listening history
// @route   GET /api/users/history
// @access  Private
export const getListeningHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'listeningHistory.song',
      select: 'title artist coverImage duration'
    });

    if (user) {
      res.json(user.listeningHistory);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
