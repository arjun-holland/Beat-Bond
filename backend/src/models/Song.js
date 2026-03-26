import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String
  },
  genre: {
    type: String
  },
  duration: {
    type: Number, // duration in seconds
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  plays: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexing for search
songSchema.index({ title: 'text', artist: 'text', genre: 'text' });

const Song = mongoose.model('Song', songSchema);
export default Song;
