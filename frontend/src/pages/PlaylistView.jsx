import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaylistDetails } from '../features/playlistSlice';
import { setCurrentSong, setQueue, setPlayState } from '../features/playerSlice';
import { Play, Clock } from 'lucide-react';
import axios from 'axios';

const PlaylistView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentPlaylist, loading } = useSelector(state => state.playlist);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    dispatch(fetchPlaylistDetails(id));
  }, [dispatch, id]);

  const handlePlayAll = () => {
    if (currentPlaylist && currentPlaylist.songs.length > 0) {
      dispatch(setCurrentSong(currentPlaylist.songs[0]));
      dispatch(setQueue(currentPlaylist.songs.slice(1)));
      dispatch(setPlayState(true));
    }
  };

  const playSpecificSong = (song, idx) => {
    dispatch(setCurrentSong(song));
    dispatch(setQueue(currentPlaylist.songs.slice(idx + 1)));
    dispatch(setPlayState(true));
  };

  const removeSong = async (songId, e) => {
    e.stopPropagation();
    try {
      setRemovingId(songId);
      await axios.put(`/api/playlists/${id}/remove`, { songId });
      dispatch(fetchPlaylistDetails(id)); // refresh
    } catch (err) {
      console.error(err);
      alert('Failed to remove song');
    } finally {
      setRemovingId(null);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading || !currentPlaylist) {
    return <div className="p-8 text-white h-full bg-spotifyDark animate-pulse flex items-center justify-center">Loading playlist...</div>;
  }

  return (
    <div className="h-full bg-spotifyDark overflow-y-auto pb-24 relative">
      {/* Dynamic Header */}
      <div className="h-64 sm:h-80 bg-gradient-to-b from-[#4A4A4A] to-spotifyDark p-8 flex items-end gap-6 relative">
        <div className="w-48 h-48 sm:w-56 sm:h-56 shadow-2xl flex-shrink-0 bg-spotifyBlack overflow-hidden">
          {currentPlaylist.coverImage ? (
            <img src={currentPlaylist.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-spotifyGrey">No Cover</div>
          )}
        </div>
        <div className="text-white flex flex-col justify-end">
          <span className="uppercase text-xs font-bold tracking-widest mb-2">Playlist</span>
          <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter truncate">{currentPlaylist.name}</h1>
          <p className="text-sm font-semibold opacity-80">{currentPlaylist.songs.length} songs</p>
        </div>
      </div>

      <div className="p-8">
        {/* Play Button Row */}
        <div className="mb-8 flex items-center gap-6">
          <button 
            onClick={handlePlayAll}
            disabled={currentPlaylist.songs.length === 0}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
          >
            <Play className="fill-black text-black w-6 h-6 ml-1" />
          </button>
        </div>

        {/* Songs Table Header */}
        <div className="grid grid-cols-[16px_1fr_auto_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-spotifyLight/50 text-spotifyGrey text-sm mb-4">
          <div>#</div>
          <div>Title</div>
          <div></div>{/* Remove Button Column */}
          <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
        </div>

        {/* Songs List */}
        <div className="space-y-1">
          {currentPlaylist.songs.length === 0 ? (
            <div className="text-center py-10 text-spotifyGrey">
              <h3 className="text-xl font-bold text-white mb-2">Let's find some podcasts or songs for your playlist</h3>
              <p>Go to the Search tab to add items here.</p>
            </div>
          ) : (
            currentPlaylist.songs.map((song, idx) => (
              <div 
                key={song._id || song.id} 
                onClick={() => playSpecificSong(song, idx)}
                className="grid grid-cols-[16px_1fr_auto_minmax(120px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md group text-white items-center cursor-pointer transition-colors"
              >
                <div className="text-spotifyGrey group-hover:hidden">{idx + 1}</div>
                <div className="hidden group-hover:block text-white"><Play className="w-4 h-4 fill-current" /></div>
                
                <div className="flex items-center gap-4 truncate">
                  <img src={song.coverImage || 'https://via.placeholder.com/40'} alt="cover" className="w-10 h-10 object-cover" />
                  <div className="truncate">
                    <p className="text-base truncate">{song.title}</p>
                    <p className="text-sm text-spotifyGrey truncate">{song.artist}</p>
                  </div>
                </div>

                {/* Remove button (appears on hover) */}
                <div className="opacity-0 group-hover:opacity-100 px-4">
                   <button 
                     onClick={(e) => removeSong(song._id || song.id, e)}
                     disabled={removingId === (song._id || song.id)}
                     className="text-spotifyGrey hover:text-white text-xs uppercase hover:underline"
                   >
                     {removingId === (song._id || song.id) ? 'Removing...' : 'Remove'}
                   </button>
                </div>

                <div className="text-spotifyGrey text-right text-sm">
                  {formatDuration(song.duration)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
