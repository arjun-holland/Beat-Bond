import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      setSuccess(data.message);
      setError('');
      // They need to verify email before logging in, so we don't automatically dispatch setCredentials
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSuccess('');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[url('https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat text-white relative">
      {/* Overlay to darken background slightly for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md p-8 pt-10 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl sm:p-10 shadow-2xl border border-white/20 overflow-y-auto max-h-[90vh]">
        <h2 className="text-3xl font-bold text-center text-white drop-shadow-md tracking-wide mb-6">Sign up to listen</h2>
        
        {error && <div className="p-3 bg-red-500/80 backdrop-blur-sm border border-red-500/50 rounded text-center text-sm text-white">{error}</div>}
        {success && <div className="p-3 bg-primary/90 backdrop-blur-sm rounded text-white font-bold text-center text-sm shadow-lg">{success}</div>}

        <form className="mt-6 space-y-4" onSubmit={submitHandler}>
          <div>
            <input 
              id="name" 
              type="text" 
              placeholder="What's your name?"
              className="w-full px-4 py-3.5 text-white rounded-lg bg-black/30 border border-white/10 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div>
            <input 
              id="email" 
              type="email" 
              placeholder="What's your email?"
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
              placeholder="Create a password"
              className="w-full px-4 py-3.5 text-white rounded-lg bg-black/30 border border-white/10 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>
          <div>
            <input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm password"
              className="w-full px-4 py-3.5 text-white rounded-lg bg-black/30 border border-white/10 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3.5 mt-6 font-bold text-white bg-primary rounded-full shadow-[0_0_15px_rgba(29,185,84,0.4)] hover:shadow-[0_0_20px_rgba(29,185,84,0.6)] hover:bg-[#1ed760] hover:scale-[1.02] transition-all transform active:scale-95 text-base cursor-pointer"
          >
            Sign Up
          </button>
        </form>
        
        <p className="text-center text-gray-300 font-medium mt-6">
          Have an account?{' '}
          <Link to="/login" className="text-[#1DB954] hover:text-white transition-colors hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
