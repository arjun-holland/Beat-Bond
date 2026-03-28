import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../features/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      dispatch(setCredentials(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[url('https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat text-white relative">
      {/* Overlay to darken background slightly for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md p-8 pt-10 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl sm:p-10 shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-center text-white drop-shadow-md tracking-wide mb-8">Beat Bond</h2>
        
        {error && <div className="p-3 bg-red-500/80 backdrop-blur-sm border border-red-500/50 rounded text-center text-sm text-white">{error}</div>}

        <form className="mt-8 space-y-5" onSubmit={submitHandler}>
          <div>
            <input 
              id="email" 
              type="email" 
              placeholder="Enter Email"
              className="w-full px-4 py-3.5 text-white rounded-lg bg-black/30 border border-white/10 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <input 
              id="password" 
              type="password" 
              placeholder="Enter Password"
              className="w-full px-4 py-3.5 text-white rounded-lg bg-black/30 border border-white/10 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3.5 mt-8 font-bold text-white bg-primary rounded-full shadow-[0_0_15px_rgba(29,185,84,0.4)] hover:shadow-[0_0_20px_rgba(29,185,84,0.6)] hover:bg-[#1ed760] hover:scale-[1.02] transition-all transform active:scale-95 text-base cursor-pointer"
          >
            Login
          </button>
        </form>
        
        <p className="text-center text-gray-300 font-medium mt-6">
          Don't have account?{' '}
          <Link to="/signup" className="text-[#1DB954] hover:text-white transition-colors hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
