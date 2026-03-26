import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunks
export const fetchUserPlaylists = createAsyncThunk(
  'playlist/fetchUserPlaylists',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/playlists/me');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch playlists');
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'playlist/createPlaylist',
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/playlists', { name, description });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create playlist');
    }
  }
);

export const fetchPlaylistDetails = createAsyncThunk(
  'playlist/fetchPlaylistDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/playlists/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch playlist details');
    }
  }
);

export const addSongToPlaylist = createAsyncThunk(
  'playlist/addSongToPlaylist',
  async ({ playlistId, song }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/playlists/${playlistId}/add`, { song });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add song');
    }
  }
);

const initialState = {
  playlists: [],
  currentPlaylist: null,
  loading: false,
  error: null,
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    clearPlaylistError: (state) => {
      state.error = null;
    },
    clearCurrentPlaylist: (state) => {
      state.currentPlaylist = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Playlists
      .addCase(fetchUserPlaylists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload;
        state.error = null;
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Playlist
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.playlists.unshift(action.payload);
      })
      // Fetch Playlist Details
      .addCase(fetchPlaylistDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaylistDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlaylist = action.payload;
      })
      .addCase(fetchPlaylistDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Song
      .addCase(addSongToPlaylist.fulfilled, (state, action) => {
        // Update current playlist if we're viewing it
        if (state.currentPlaylist && state.currentPlaylist._id === action.payload._id) {
          state.currentPlaylist = action.payload;
        }
        // Update in list
        const index = state.playlists.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.playlists[index] = action.payload;
        }
      });
  }
});

export const { clearPlaylistError, clearCurrentPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
