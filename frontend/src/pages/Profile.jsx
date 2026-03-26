import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../features/authSlice';
import { Headphones } from 'lucide-react';

const Profile = () => {
  const { userInfo } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(null);

  // For update
  const [name, setName] = useState(userInfo?.name || '');
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put('/api/users/profile', { name, password });
      dispatch(setCredentials({ ...userInfo, name: data.name, profileImage: data.profileImage }));
      alert('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      alert('Error updating profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userInfo.token}`
        }
      };

      const { data } = await axios.post('/api/upload/profile', formData, config);

      dispatch(setCredentials({ ...userInfo, profileImage: data.profileImage }));
      alert('Profile picture updated successfully!');
    } catch (err) {
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const formatListeningTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200';
    if (url.startsWith('http')) return url;
    return (import.meta.env.VITE_API_URL || 'http://localhost:5000') + url;
  };

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex items-end gap-6 mb-10">
        <label className="w-48 h-48 rounded-full bg-spotifyLight overflow-hidden shadow-2xl relative group cursor-pointer block">
          <img src={getImageUrl(userInfo?.profileImage)} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 items-center justify-center hidden group-hover:flex transition-opacity">
            <span className="font-bold text-sm">{uploading ? 'Uploading...' : 'Choose photo'}</span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>

        <div className="pb-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-spotifyGrey">Profile</h2>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{userInfo.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Update Form */}
        <div className="bg-spotifyLight p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-6">Edit Profile</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-bold text-spotifyGrey">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-spotifyDark text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-spotifyGrey">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-spotifyDark text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button type="submit" className="px-8 py-3 bg-white text-black font-bold uppercase rounded-full hover:scale-105 transition-transform mt-4">
              Save Changes
            </button>
          </form>
        </div>

        {/* Aesthetic Cover */}
        <div className="flex flex-col h-full rounded-lg overflow-hidden group relative shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=800&q=80"
            alt="Vibes"
            className="w-full h-full min-h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 blur-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">Immerse Yourself</h3>
            <p className="text-white/80 max-w-sm text-sm font-medium drop-shadow">
              Your personal gateway to a world of endless soundscapes. Let the rhythm guide your mind and lose yourself in the music.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
