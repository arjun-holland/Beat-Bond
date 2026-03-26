import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentSong: {
    type: mongoose.Schema.Types.Mixed
  },
  playbackPosition: {
    type: Number,
    default: 0 // In seconds
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String // Optional, for private rooms
  }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
