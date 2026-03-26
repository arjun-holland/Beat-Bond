import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentSong, setPlayState, playNext } from '../features/playerSlice';
import { addSongToPlaylist } from '../features/playlistSlice';
import { Play, Plus } from 'lucide-react';
import axios from 'axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [playlistModal, setPlaylistModal] = useState({ isOpen: false, song: null });

  const dispatch = useDispatch();
  const { currentSong, isPlaying } = useSelector(state => state.player);
  const { playlists } = useSelector(state => state.playlist);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        searchSongs(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchSongs = async (searchTerm) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/songs/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (song) => {
    dispatch(setCurrentSong(song));
    dispatch(setPlayState(true));
  };

  const openPlaylistModal = (e, song) => {
    e.stopPropagation();
    setPlaylistModal({ isOpen: true, song });
  };

  const handleAddToPlaylist = async (playlistId, song) => {
    try {
      await dispatch(addSongToPlaylist({ playlistId, song })).unwrap();
      alert('Song added to playlist!');
      setPlaylistModal({ isOpen: false, song: null });
    } catch (err) {
      alert(err || 'Failed to add song');
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="p-8 pb-32 h-full overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search for Songs</h1>
        
        <div className="relative mb-10">
          <input 
            type="text" 
            placeholder="What do you want to listen to?" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-spotifyLight text-white px-6 py-4 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-white border border-transparent shadow-lg"
            autoFocus
          />
        </div>

        {loading && <div className="text-spotifyGrey font-bold text-center mt-10">Searching the web...</div>}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold mb-4">Top Results (Playable Previews)</h2>
            {results.map((song, idx) => (
              <div 
                key={song.id} 
                className="group flex items-center justify-between p-3 rounded-md hover:bg-spotifyLight transition-colors cursor-pointer"
                onDoubleClick={() => handlePlay(song)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img src={song.coverImage} alt={song.title} className="w-12 h-12 rounded shadow object-cover" />
                    <button 
                      onClick={() => handlePlay(song)}
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center rounded transition-opacity ${currentSong?.id === song.id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <Play className="w-6 h-6 text-white fill-current ml-1" />
                    </button>
                  </div>
                  <div>
                    <h3 className={`font-bold text-base truncate ${currentSong?.id === song.id ? 'text-primary' : 'text-white'}`}>
                      {song.title}
                    </h3>
                    <p className="text-sm text-spotifyGrey truncate">{song.artist}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-6 w-1/3">
                  <div className="hidden md:block w-full text-sm text-spotifyGrey truncate">
                    {song.album}
                  </div>
                  
                  <button 
                    onClick={(e) => openPlaylistModal(e, song)}
                    className="opacity-0 group-hover:opacity-100 text-spotifyGrey hover:text-white transition-all hover:scale-110"
                    title="Add to Playlist"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <div className="text-sm text-spotifyGrey w-12 text-right">
                    {formatTime(song.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center mt-20 text-spotifyGrey">
            <h3 className="text-xl font-bold text-white mb-2">No results found for "{query}"</h3>
            <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        )}

        {/* Add to Playlist Modal */}
        {playlistModal.isOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={() => setPlaylistModal({ isOpen: false, song: null })}>
            <div className="bg-[#282828] p-6 rounded-lg shadow-2xl w-80 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Add to Playlist</h2>
              
              {playlists.length === 0 ? (
                <div className="text-spotifyGrey text-sm mb-4">You don't have any playlists yet.</div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {playlists.map(pl => (
                    <button 
                      key={pl._id}
                      onClick={() => handleAddToPlaylist(pl._id, playlistModal.song)}
                      className="w-full text-left bg-black/20 hover:bg-white/10 px-4 py-3 rounded text-white transition-colors truncate"
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => setPlaylistModal({ isOpen: false, song: null })}
                className="mt-6 w-full py-2 font-bold text-spotifyGrey hover:text-white uppercase text-sm tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
