import Song from '../models/Song.js';

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find({}).populate('uploadedBy', 'name');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get top popular songs
// @route   GET /api/songs/popular
// @access  Public
export const getPopularSongs = async (req, res) => {
  try {
    const songs = await Song.find({}).sort({ plays: -1 }).limit(10).populate('uploadedBy', 'name');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single song
// @route   GET /api/songs/:id
// @access  Public
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'name');
    if (song) {
      // Increment play count
      song.plays += 1;
      await song.save();
      
      res.json(song);
    } else {
      res.status(404).json({ message: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Search songs
// @route   GET /api/songs/search?q=query
// @access  Public
export const searchSongs = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload new song
// @route   POST /api/songs
// @access  Private/Admin
export const uploadSong = async (req, res) => {
  try {
    const { title, artist, album, genre, duration } = req.body;

    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
    let coverImage = '';

    if (req.files.coverImage) {
      coverImage = `/uploads/images/${req.files.coverImage[0].filename}`;
    }

    const song = await Song.create({
      title,
      artist,
      album,
      genre,
      duration: Number(duration),
      audioUrl,
      coverImage,
      uploadedBy: req.user._id
    });

    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
