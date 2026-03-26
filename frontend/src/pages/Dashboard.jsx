import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentSong, setQueue, setPlayState } from '../features/playerSlice';
import { Play } from 'lucide-react';

// Real-world podcast mocks for visual fidelity using reliable Unsplash images
const MOCK_PODCASTS = [
  { id: 'p1', title: 'The Joe Rogan Experience', publisher: 'Joe Rogan', coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&q=80' },
  { id: 'p2', title: 'Huberman Lab', publisher: 'Scicomm Media', coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&q=80' },
  { id: 'p3', title: 'Call Her Daddy', publisher: 'Alex Cooper', coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&q=80' },
  { id: 'p4', title: 'Crime Junkie', publisher: 'audiochuck', coverImage: 'https://images.unsplash.com/photo-1629844812316-6086f5c8bf08?w=300&q=80' },
  { id: 'p5', title: 'Lex Fridman Podcast', publisher: 'Lex Fridman', coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=80' },
];

const MOCK_SONGS = [
  { _id: 's1', id: 'fHI8X4OXluQ', title: 'Blinding Lights', artist: 'The Weeknd', coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80' },
  { _id: 's2', id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
  { _id: 's3', id: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5', coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
  { _id: 's4', id: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa', coverImage: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?w=300&q=80' },
  { _id: 's5', id: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
];

const Dashboard = () => {
  const [popularSongs, setPopularSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const { data } = await axios.get('/api/songs/popular');
        if (data && data.length > 0) {
          setPopularSongs(data);
        } else {
          setPopularSongs(MOCK_SONGS);
        }
      } catch (error) {
        console.error('Failed to fetch songs', error);
        setPopularSongs(MOCK_SONGS);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularSongs();
  }, []);

  const playSong = (song, index) => {
    dispatch(setCurrentSong(song));
    dispatch(setQueue(popularSongs.slice(index + 1)));
    dispatch(setPlayState(true));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Mocking 6 recent items using our popular songs (or fallbacks)
  const recentGrids = popularSongs.slice(0, 6);

  if (loading) {
    return (
      <div className="p-8 bg-spotifyDark h-full animate-pulse">
        <h1 className="text-3xl font-bold mb-6 mt-8 h-8 w-64 bg-spotifyLight rounded"></h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[1,2,3,4,5,6].map(n => <div key={n} className="h-20 bg-spotifyLight rounded-md"></div>)}
        </div>
        <h2 className="text-2xl font-bold mb-4 h-6 w-48 bg-spotifyLight rounded"></h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1,2,3,4,5].map(n => <div key={n} className="h-64 bg-spotifyLight rounded-md"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto bg-spotifyDark pb-24">
      {/* Decorative top gradient mimicking real Spotify */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1E3264] to-spotifyDark opacity-80 pointer-events-none -mr-4" />
      
      <div className="relative p-6 pt-12 z-10">
        <h1 className="text-[2rem] font-bold text-white tracking-tight mb-6">{getGreeting()}</h1>
        
        {/* Top 6 Grid - Recently Played */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {recentGrids.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center bg-white/10 hover:bg-white/20 transition-colors rounded-md overflow-hidden cursor-pointer group"
              onClick={() => playSong(item, idx)}
            >
              <img src={item.coverImage || 'https://via.placeholder.com/80'} alt={item.title} className="w-20 h-20 object-cover shadow-[4px_0_10px_rgba(0,0,0,0.3)] z-10" />
              <div className="flex-1 px-4 font-bold text-white text-sm line-clamp-2">{item.title}</div>
              <div className="mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-105 shadow-xl hover:bg-green-400">
                  <Play className="w-6 h-6 text-black fill-black ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Songs Section */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer tracking-tight">Popular Songs</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {popularSongs.map((song, idx) => (
              <div 
                key={song._id} 
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition duration-300 group cursor-pointer flex flex-col items-center sm:items-start"
                onClick={() => playSong(song, idx)}
              >
                <div className="relative w-full aspect-square mb-4 shadow-xl rounded-md overflow-hidden bg-spotifyBlack">
                  {song.coverImage ? (
                    <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-spotifyGrey">No Cover</div>
                  )}
                  
                  {/* Play button overlay */}
                  <button 
                    className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-105 hover:bg-green-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(song, idx);
                    }}
                  >
                    <Play className="w-6 h-6 text-black fill-black ml-1" />
                  </button>
                </div>
                
                <h3 className="font-bold text-white truncate w-full">{song.title}</h3>
                <p className="text-sm text-spotifyGrey truncate mt-1 line-clamp-2 leading-tight w-full">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>


      </div>
    </div>
  );
};

export default Dashboard;
