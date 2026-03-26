import redis from '../config/redis.js';

export const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected to Socket.IO: ${socket.id}`);

    // Join a specific room
    socket.on('join_room', async ({ roomId, user }) => {
      socket.join(roomId);
      
      // Store user presence in Redis (map socket.id to user info)
      await redis.hset(`socket_user:${socket.id}`, 'roomId', roomId, 'userId', user._id, 'name', user.name);
      
      // Notify others in room
      socket.to(roomId).emit('user_joined', { user, message: `${user.name} joined the room` });
      console.log(`User ${user.name} joined room ${roomId}`);
    });

    // Playback sync events (Only host should emit these normally, enforced via UI)
    socket.on('play_song', ({ roomId, songId, position }) => {
      console.log(`Play song ${songId} at ${position} in room ${roomId}`);
      socket.to(roomId).emit('sync_play', { songId, position });
    });

    socket.on('pause_song', ({ roomId, position }) => {
      socket.to(roomId).emit('sync_pause', { position });
    });

    socket.on('seek_song', ({ roomId, position }) => {
      socket.to(roomId).emit('sync_seek', { position });
    });

    socket.on('send_message', async ({ roomId, message, user }) => {
      try {
        const msgData = { 
          userId: user._id, 
          name: user.name, 
          message, 
          timestamp: new Date() 
        };
        
        // Buffer in Redis list
        await redis.rpush(`room:${roomId}:chat`, JSON.stringify(msgData));
        
        // Auto-delete chat if no activity/TTL can be set (24 hours expiry for chat)
        await redis.expire(`room:${roomId}:chat`, 86400);

        io.to(roomId).emit('receive_message', msgData);
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('kick_user', ({ roomId, userId }) => {
      io.to(roomId).emit('user_kicked', { userId });
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Fetch user data from redis to broadcast leave event
      const userData = await redis.hgetall(`socket_user:${socket.id}`);
      if (userData && userData.roomId) {
        // Broadcast leave event
        socket.to(userData.roomId).emit('user_left', { 
          userId: userData.userId, 
          name: userData.name,
          message: `${userData.name} left the room` 
        });
        
        // Cleanup redis
        await redis.del(`socket_user:${socket.id}`);
      }
    });
  });
};
