import { createSlice } from '@reduxjs/toolkit';

const baseInitialState = {
  currentSong: null,
  queue: [],
  isPlaying: false,
  volume: 0.5,
  progress: 0, // duration in seconds
  duration: 0,
  hostAction: null,
  restrictionEndTime: null, // timestamp in ms
};

const loadPlayerState = () => {
  try {
    const serializedState = localStorage.getItem('spotifyPlayerState');
    if (serializedState === null) return baseInitialState;
    const parsed = JSON.parse(serializedState);
    // Overwrite the base with whatever we found in storage
    return { ...baseInitialState, ...parsed };
  } catch (err) {
    return baseInitialState;
  }
};

const initialState = loadPlayerState();

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.isPlaying = true; // Auto-play when a new song is set
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setPlayState: (state, action) => {
      state.isPlaying = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    playNext: (state) => {
      if (state.queue.length > 0) {
        // Simple queue logic: shift and play
        const nextSong = state.queue.shift();
        state.currentSong = nextSong;
        state.isPlaying = true;
      } else {
        state.currentSong = null;
        state.isPlaying = false;
        state.progress = 0;
      }
    },
    setHostAction: (state, action) => {
      state.hostAction = action.payload;
    },
    setRestriction: (state, action) => {
      state.restrictionEndTime = action.payload;
    },
    clearRestriction: (state) => {
      state.restrictionEndTime = null;
    }
  }
});

export const { 
  setCurrentSong, setQueue, togglePlayPause, setPlayState, 
  setVolume, setProgress, setDuration, playNext, setHostAction,
  setRestriction, clearRestriction
} = playerSlice.actions;

export default playerSlice.reducer;
