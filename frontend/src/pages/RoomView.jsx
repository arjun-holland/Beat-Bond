import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setRoom, setParticipants, setChatHistory, addChatMessage, addParticipant, removeParticipant, leaveRoom } from '../features/roomSlice';
import { setCurrentSong, setPlayState, setProgress } from '../features/playerSlice';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Users as UsersIcon, Search as SearchIcon } from 'lucide-react';

const RoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector(state => state.auth);
  const { activeRoom, chatHistory, participants } = useSelector(state => state.room);
  const { currentSong, isPlaying, hostAction } = useSelector(state => state.player);
  
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // 1. Fetch Room Details and Chat History
    const initRoom = async () => {
      try {
        const { data: roomData } = await axios.get(`/api/rooms/${id}`);
        dispatch(setRoom(roomData));
        dispatch(setParticipants(roomData.participants));
        
        if (roomData.currentSong) {
          dispatch(setCurrentSong(roomData.currentSong));
        }

        const { data: chatData } = await axios.get(`/api/rooms/${id}/chat`);
        dispatch(setChatHistory(chatData));
      } catch (err) {
        alert(err.response?.data?.message || 'Error joining room or room is private.');
        navigate('/rooms');
      }
    };
    initRoom();

    // 2. Init Socket Connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', { roomId: id, user: userInfo });
    });

    newSocket.on('user_joined', (data) => {
      dispatch(addParticipant(data.user));
    });

    newSocket.on('user_left', (data) => {
      dispatch(removeParticipant(data.userId));
    });

    newSocket.on('user_kicked', (data) => {
      dispatch(removeParticipant(data.userId));
      if (data.userId === userInfo._id) {
        alert('You have been removed from the room by the host.');
        navigate('/rooms');
      }
    });

    newSocket.on('receive_message', (msgData) => {
      dispatch(addChatMessage(msgData));
    });

    newSocket.on('sync_play', ({ songId, position }) => {
      dispatch(setPlayState(true));
      dispatch(setProgress(position));
      // In a real app we'd fetch song if different
    });

    newSocket.on('sync_pause', ({ position }) => {
      dispatch(setPlayState(false));
      dispatch(setProgress(position));
    });

    newSocket.on('sync_seek', ({ position }) => {
      dispatch(setProgress(position));
    });

    return () => {
      newSocket.disconnect();
      dispatch(leaveRoom());
    };
  }, [id, dispatch, navigate, userInfo]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('send_message', { roomId: id, message, user: userInfo });
      setMessage('');
    }
  };

  const isHost = activeRoom?.host?._id === userInfo._id;

  // Sync Host Playback actions
  useEffect(() => {
    if (isHost && socket && hostAction) {
      if (hostAction.action === 'play' && currentSong) {
        socket.emit('play_song', { roomId: id, songId: currentSong.id, position: hostAction.position });
      } else if (hostAction.action === 'pause') {
        socket.emit('pause_song', { roomId: id, position: hostAction.position });
      } else if (hostAction.action === 'seek') {
        socket.emit('seek_song', { roomId: id, position: hostAction.position });
      }
    }
  }, [hostAction, isHost, socket, id, currentSong]);

  const handleSearchSong = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const { data } = await axios.get(`/api/songs/search?q=${searchQuery}`);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaySong = async (song) => {
    try {
      await axios.put(`/api/rooms/${id}/song`, { song });
      dispatch(setCurrentSong(song));
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      alert('Failed to change song');
    }
  };

  const handleKickParticipant = async (participantId) => {
    if (participantId === activeRoom?.host?._id) return;
    try {
      await axios.delete(`/api/rooms/${id}/participants/${participantId}`);
      if (socket) {
        socket.emit('kick_user', { roomId: id, userId: participantId });
      }
    } catch(err) {
      console.error('Error kicking user', err);
    }
  };

  return (
    <div className="flex h-full bg-spotifyDark p-4 gap-6 pb-24">
      {/* Main Room Area */}
      <div className="flex-1 flex flex-col bg-black rounded-lg p-6 shadow-xl border border-spotifyLight overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-spotifyLight pb-4">
          <div>
            <h1 className="text-3xl font-bold">{activeRoom?.name || 'Loading Room...'}</h1>
            <p className="text-spotifyGrey mt-1 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" /> {participants.length} Listening Now
            </p>
            {isHost && (
              <div className="mt-4 flex flex-wrap gap-2">
                {participants.map(p => (
                  <div key={p._id} className="flex items-center gap-2 bg-spotifyDark px-3 py-1 rounded-full border border-spotifyLight/50">
                    <img src={p.profileImage || 'https://via.placeholder.com/32'} alt="user" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-bold text-white">{p.name} {p._id === activeRoom.host._id && '(Host)'}</span>
                    {p._id !== activeRoom.host._id && (
                      <button onClick={() => handleKickParticipant(p._id)} className="text-red-400 hover:text-red-500 text-xs ml-2 font-bold uppercase transition-colors">Kick</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {isHost && <span className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-full uppercase self-start">Host</span>}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          {currentSong ? (
            <>
              <img 
                src={currentSong.coverImage || 'https://via.placeholder.com/300'} 
                alt="cover" 
                className={`w-64 h-64 rounded-lg shadow-2xl mb-6 object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''} rounded-full`}
              />
              <h2 className="text-4xl font-bold mb-2">{currentSong.title}</h2>
              <p className="text-xl text-spotifyGrey">{currentSong.artist}</p>
              
              {!isHost && (
                <p className="mt-8 px-4 py-2 bg-spotifyLight rounded-full text-sm text-spotifyGrey font-bold">
                  Host controls playback
                </p>
              )}
            </>
          ) : (
            <div className="text-spotifyGrey">
              <div className="w-64 h-64 bg-spotifyLight rounded-full mb-6 mx-auto flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎵</span>
              </div>
              <p className="text-xl">Waiting for host to play music...</p>
            </div>
          )}

          {isHost && (
            <div className="mt-8 w-full max-w-md bg-spotifyDark p-4 rounded-xl border border-spotifyLight">
              <form onSubmit={handleSearchSong} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search to play a song..."
                  className="flex-1 bg-black text-white px-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                />
                <button type="submit" disabled={isSearching} className="w-10 h-10 bg-primary hover:bg-green-400 text-black text-sm font-bold flex items-center justify-center rounded-full transition-colors disabled:opacity-50">
                  <SearchIcon className="w-4 h-4" />
                </button>
              </form>
              
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2 text-left">
                  {searchResults.map(song => (
                    <div 
                      key={song.id} 
                      onClick={() => handlePlaySong(song)}
                      className="flex items-center gap-3 p-2 hover:bg-spotifyLight rounded-md cursor-pointer transition-colors"
                    >
                      <img src={song.coverImage} className="w-10 h-10 rounded object-cover" alt="cover" />
                      <div className="truncate flex-1">
                        <p className="text-white text-sm font-bold truncate">{song.title}</p>
                        <p className="text-spotifyGrey text-xs truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-black rounded-lg shadow-xl border border-spotifyLight flex flex-col">
        <div className="p-4 border-b border-spotifyLight">
          <h3 className="font-bold text-lg text-white">Room Chat</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.userId === userInfo._id ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-spotifyGrey mb-1 font-bold">{msg.name}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${msg.userId === userInfo._id ? 'bg-primary text-black rounded-tr-sm' : 'bg-spotifyLight text-white rounded-tl-sm'}`}>
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-spotifyLight flex gap-2">
          <input 
            type="text" 
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-spotifyDark text-white px-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
          <button type="submit" className="w-10 h-10 bg-primary hover:bg-green-400 text-black rounded-full flex items-center justify-center transition-colors">
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomView;
