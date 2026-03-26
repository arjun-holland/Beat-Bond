import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeRoom: null, // { roomId, name, host, isPrivate }
  participants: [],
  chatHistory: [],
  isJoined: false,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.isJoined = true;
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action) => {
      if (!state.participants.some(p => p._id === action.payload._id)) {
        state.participants.push(action.payload);
      }
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p._id !== action.payload);
    },
    setChatHistory: (state, action) => {
      state.chatHistory = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    leaveRoom: (state) => {
      state.activeRoom = null;
      state.participants = [];
      state.chatHistory = [];
      state.isJoined = false;
    }
  }
});

export const { setRoom, setParticipants, addParticipant, removeParticipant, setChatHistory, addChatMessage, leaveRoom } = roomSlice.actions;
export default roomSlice.reducer;
