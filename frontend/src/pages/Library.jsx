import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentSong, setPlayState } from '../features/playerSlice';

const Library = () => {
  const [history, setHistory] = useState([]);
  const dispatch = useDispatch();
  const { currentSong, isPlaying } = useSelector(state => state.player);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get('/api/users/history');
        setHistory(data);
      } catch (err) {
        console.error('Error fetching history', err);
      }
    };
    fetchHistory();
  }, []);

  const handlePlay = (song) => {
    if (song) {
      dispatch(setCurrentSong(song));
      dispatch(setPlayState(true));
    }
  };

  return (
    <div className="p-8 pb-32 h-full overflow-y-auto">
      <h1 className="text-4xl font-bold mb-8">Your Library</h1>
      
      <h2 className="text-2xl font-bold mb-4">Recently Played History</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {history.length > 0 ? history.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-spotifyLight/40 p-4 rounded-md hover:bg-spotifyLight transition-colors cursor-pointer group"
            onClick={() => handlePlay(item.song)}
          >
            <div className="relative mb-4">
              <img src={item.song?.coverImage || 'https://via.placeholder.com/300'} alt="cover" className="w-full aspect-square object-cover rounded shadow-lg" />
              <button 
                className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 shadow-xl"
              >
                <svg className="w-6 h-6 text-black fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
            <h3 className={`font-bold truncate ${currentSong?.id === item.song?.id ? 'text-primary' : 'text-white'}`}>
              {item.song?.title || 'Unknown Song'}
            </h3>
            <p className="text-sm text-spotifyGrey truncate">{item.song?.artist || 'Unknown Artist'}</p>
          </div>
        )) : (
          <p className="text-spotifyGrey col-span-full mt-4">You haven't played any songs yet. Go search the web to build your library!</p>
        )}
      </div>
    </div>
  );
};

export default Library;
