import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice.js';
import playerReducer from './features/playerSlice.js';
import roomReducer from './features/roomSlice.js';
import playlistReducer from './features/playlistSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
    room: roomReducer,
    playlist: playlistReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

store.subscribe(() => {
  const currentState = store.getState();
  // We only persist the player store
  localStorage.setItem('spotifyPlayerState', JSON.stringify({
    currentSong: currentState.player.currentSong,
    queue: currentState.player.queue,
    isPlaying: currentState.player.isPlaying,
    volume: currentState.player.volume,
    restrictionEndTime: currentState.player.restrictionEndTime,
    progress: currentState.player.progress
  }));
});
