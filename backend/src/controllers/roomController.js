import Room from '../models/Room.js';
import crypto from 'crypto';
import redis from '../config/redis.js';

// @desc    Create a new listening room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req, res) => {
  try {
    const { name, isPrivate, password } = req.body;

    const roomId = crypto.randomBytes(4).toString('hex');

    const room = await Room.create({
      roomId,
      name,
      host: req.user._id,
      participants: [req.user._id],
      isPrivate,
      password // ideally should be hashed if strictly used, but for brevity keep here
    });

    // Store active room status in redis for quick lookup
    await redis.set(`room:${roomId}:active`, 'true', 'EX', 24 * 60 * 60);

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:roomId
// @access  Private
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('host', 'name profileImage')
      .populate('participants', 'name profileImage');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if private and not host
    if (room.isPrivate && req.user._id.toString() !== room.host._id.toString()) {
      return res.status(403).json({ message: 'Room is private' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Join an existing room
// @route   POST /api/rooms/:roomId/join
// @access  Private
export const joinRoom = async (req, res) => {
  try {
    const { password } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.isPrivate) {
      if (room.password !== password && req.user._id.toString() !== room.host.toString()) {
        return res.status(401).json({ message: 'Incorrect room password' });
      }
    }

    if (room.participants.length >= 5 && !room.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Room is full (max 5 members)' });
    }

    if (!room.participants.includes(req.user._id)) {
      room.participants.push(req.user._id);
      await room.save();
    }

    res.json({ message: 'Joined room successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Chat History from Redis
// @route   GET /api/rooms/:roomId/chat
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await redis.lrange(`room:${roomId}:chat`, 0, -1);
    
    const parsedMessages = messages.map(msg => JSON.parse(msg));
    res.json(parsedMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update current song in room
// @route   PUT /api/rooms/:roomId/song
// @access  Private
export const updateCurrentSong = async (req, res) => {
  try {
    const { song } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only host can change song' });
    }

    room.currentSong = song;
    room.markModified('currentSong');
    await room.save();
    
    res.json({ message: 'Song updated successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Remove a participant from room
// @route   DELETE /api/rooms/:roomId/participants/:userId
// @access  Private
export const removeParticipant = async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only host can remove participants' });
    }

    room.participants = room.participants.filter(p => p.toString() !== userId);
    await room.save();
    
    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
