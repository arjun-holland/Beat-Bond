import Playlist from '../models/Playlist.js';

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      creator: req.user._id,
      songs: [],
      // Grab a placeholder image or generic cover
      coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=128&h=128&q=80'
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user playlists
// @route   GET /api/playlists/me
// @access  Private
export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Private
// @access  Public (if isPublic is true, but we will enforce Private for now)
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Optionally check if playlist is private and belongs to user
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add song to playlist
// @route   PUT /api/playlists/:id/add
// @access  Private
export const addSongToPlaylist = async (req, res) => {
  try {
    const { song } = req.body; // Full song object

    if (!song || (!song._id && !song.id)) {
      return res.status(400).json({ message: 'Valid Song object is required' });
    }

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Ensure only creator can add
    if (playlist.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Prevent duplicates by checking if the ID already exists in the playlist
    const songExists = playlist.songs.some(s => {
      const existingId = s._id ? s._id.toString() : s.id;
      const targetId = song._id ? song._id.toString() : song.id;
      return existingId === targetId;
    });
    
    if (songExists) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(song);
    
    // Auto-update the playlist cover image to the first song's cover if it's currently generic
    if (playlist.songs.length === 1 && song.coverImage) {
      playlist.coverImage = song.coverImage;
    }

    await playlist.save();

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove song from playlist
// @route   PUT /api/playlists/:id/remove
// @access  Private
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.body; // pass the string ID

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    if (playlist.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    playlist.songs = playlist.songs.filter(s => {
      const existingId = s._id ? s._id.toString() : s.id;
      return existingId !== songId;
    });
    await playlist.save();
    
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Server failed to remove song', error: error.message });
  }
};
