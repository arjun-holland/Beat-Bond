import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Users, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { fetchUserPlaylists, createPlaylist } from '../features/playlistSlice';
import axios from 'axios';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { playlists } = useSelector(state => state.playlist);

  React.useEffect(() => {
    if (userInfo) {
      dispatch(fetchUserPlaylists());
    }
  }, [dispatch, userInfo]);

  if (!userInfo) return null; // Don't show sidebar if not logged in

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    dispatch(logout());
  };

  const handleCreatePlaylist = () => {
    const name = window.prompt("Enter new playlist name:");
    if (name && name.trim()) {
      dispatch(createPlaylist({ name: name.trim() }));
    }
  };

  return (
    <aside className="w-64 bg-black h-full flex flex-col pt-6 pb-24 px-4 hidden md:flex">
      <div className="flex items-center gap-2 px-2 mb-8 cursor-pointer">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <span className="text-2xl font-bold text-white tracking-tighter">Beat Bond</span>
      </div>

      <nav className="space-y-4 flex-1">
        <div className="space-y-2">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 px-2 py-2 font-bold transition-colors ${isActive ? 'text-white' : 'text-spotifyGrey hover:text-white'}`}>
            <Home className="w-6 h-6" />
            Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `flex items-center gap-4 px-2 py-2 font-bold transition-colors ${isActive ? 'text-white' : 'text-spotifyGrey hover:text-white'}`}>
            <Search className="w-6 h-6" />
            Search
          </NavLink>
        </div>

        <div className="pt-6 space-y-2">
          <div
            onClick={handleCreatePlaylist}
            className="flex items-center gap-4 px-2 py-2 text-spotifyGrey hover:text-white font-bold cursor-pointer transition-colors"
          >
            <div className="bg-spotifyGrey p-1 rounded-sm group-hover:bg-white text-black"><PlusSquare className="w-4 h-4" /></div>
            Create Playlist
          </div>
          <NavLink to="/time-restricted" className={({ isActive }) => `flex items-center gap-4 px-2 py-2 font-bold transition-colors ${isActive ? 'text-white' : 'text-spotifyGrey hover:text-white'}`}>
            <div className="bg-purple-600 p-1 rounded-sm text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            Time Restricted
          </NavLink>
          <NavLink to="/rooms" className={({ isActive }) => `flex items-center gap-4 px-2 py-2 font-bold transition-colors ${isActive ? 'text-white' : 'text-spotifyGrey hover:text-white'}`}>
            <div className="bg-primary p-1 rounded-sm text-black"><Users className="w-4 h-4" /></div>
            Listen Together
          </NavLink>
        </div>

        {/* User Playlists List */}
        <div className="pt-6 border-t border-[#282828] mt-4 flex-1 overflow-y-auto space-y-3 px-2 custom-scrollbar">
          {playlists.map((pl) => (
            <NavLink
              key={pl._id}
              to={`/playlist/${pl._id}`}
              className={({ isActive }) =>
                `block truncate text-sm transition-colors ${isActive ? 'text-white' : 'text-spotifyGrey hover:text-white'}`
              }
            >
              {pl.name}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-spotifyLight pt-4 space-y-2">
        <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-4 px-2 py-2 font-bold transition-colors ${isActive ? 'text-white' : 'text-spotifyGrey hover:text-white'}`}>
          <img
            src={userInfo.profileImage ? (userInfo.profileImage.startsWith('http') ? userInfo.profileImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${userInfo.profileImage}`) : 'https://via.placeholder.com/32'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          {userInfo.name}
        </NavLink>
        <button onClick={handleLogout} className="flex items-center gap-4 px-2 py-2 text-spotifyGrey hover:text-white font-bold w-full text-left transition-colors">
          <LogOut className="w-6 h-6" />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
