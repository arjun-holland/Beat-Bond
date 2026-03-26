import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sidebar from './components/Sidebar.jsx';
import Player from './components/Player.jsx';
import RoomView from './pages/RoomView.jsx';
import Profile from './pages/Profile.jsx';
import Search from './pages/Search.jsx';
import Library from './pages/Library.jsx';
import ListenTogether from './pages/ListenTogether.jsx';
import TimeRestricted from './pages/TimeRestricted.jsx';
import PlaylistView from './pages/PlaylistView.jsx';

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-spotifyDark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative">
        {/* Navbar */}
        
        <main className="flex-1 overflow-y-auto w-full p-4 relative z-0">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/time-restricted" element={<TimeRestricted />} />
              <Route path="/rooms" element={<ListenTogether />} />
              <Route path="/room/:id" element={<RoomView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/playlist/:id" element={<PlaylistView />} />
            </Route>
          </Routes>
        </main>
        
        {/* Persistent Bottom Music Player */}
        <div className="h-24 bg-spotifyBlack border-t border-spotifyLight w-full sticky bottom-0 z-50">
          <Player />
        </div>
      </div>
    </div>
  );
}

export default App;
