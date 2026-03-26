import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Link as LinkIcon, PlusCircle, LogIn } from 'lucide-react';
import axios from 'axios';

const ListenTogether = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/rooms', {
        name: roomName || 'My Listening Room',
        isPrivate: false
      });
      const room = response.data;
      const link = `${window.location.origin}/room/${room.roomId}`;
      setGeneratedLink(link);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinCode) return;
    
    // Extract ID if full URL is pasted
    let roomId = joinCode;
    try {
      if (joinCode.includes('http')) {
         const url = new URL(joinCode);
         const parts = url.pathname.split('/');
         roomId = parts[parts.length - 1];
      }
    } catch (err) {}
    
    navigate(`/room/${roomId}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-full bg-spotifyDark p-8 text-white relative items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-full pb-32">
        <div className="w-full h-full bg-gradient-to-b from-primary/20 to-spotifyDark opacity-50 z-0"></div>
      </div>
      
      <div className="z-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 -mt-24">
        
        {/* Create Room Section */}
        <div className="bg-spotifyBlack p-8 rounded-2xl shadow-2xl border border-spotifyLight/30 flex flex-col hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Start a Party</h2>
          </div>
          
          <p className="text-spotifyGrey mb-8 leading-relaxed">
            Create a real-time listening room with up to 5 members. Listen to music in perfectly synced harmony and chat with your friends.
          </p>
          
          <form onSubmit={handleGenerateLink} className="space-y-4 flex-1 flex flex-col justify-end">
            <div>
              <label className="block text-sm font-bold text-spotifyGrey mb-2">Room Name (Optional)</label>
              <input 
                type="text" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="My Awesome Party"
                className="w-full bg-spotifyDark/50 border border-spotifyLight/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-green-400 text-black font-bold py-3 rounded-full flex justify-center items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              disabled={loading}
            >
              <LinkIcon className="w-5 h-5" />
              {loading ? 'Creating...' : 'Generate Invite Link'}
            </button>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>

          {generatedLink && (
            <div className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <p className="text-sm font-bold text-primary mb-2">Room Created! Share this link:</p>
              <div className="flex bg-black rounded-lg overflow-hidden">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink}
                  className="flex-1 bg-transparent px-4 text-sm text-spotifyGrey outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-spotifyLight hover:bg-white hover:text-black px-4 py-2 font-bold text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
              <button 
                onClick={() => navigate(`/room/${generatedLink.split('/').pop()}`)}
                className="w-full mt-4 bg-white hover:bg-gray-200 text-black font-bold py-2 rounded-full transition-colors"
              >
                Enter Room Now
              </button>
            </div>
          )}
        </div>

        {/* Join Room Section */}
        <div className="bg-spotifyBlack p-8 rounded-2xl shadow-2xl border border-spotifyLight/30 flex flex-col hover:border-white/50 transition-colors">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Join a Party</h2>
          </div>
          
          <p className="text-spotifyGrey mb-8 leading-relaxed">
            Have an invite link from a friend? Paste it below to jump right into their listening room.
          </p>
          
          <form onSubmit={handleJoinRoom} className="space-y-4 mt-auto">
            <div>
              <label className="block text-sm font-bold text-spotifyGrey mb-2">Invite Link or Room Code</label>
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="https://.../room/abc1234"
                className="w-full bg-spotifyDark/50 border border-spotifyLight/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-full flex justify-center items-center gap-2 transition-all hover:scale-[1.02]"
              disabled={!joinCode}
            >
              <Users className="w-5 h-5" />
              Join Room
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default ListenTogether;
