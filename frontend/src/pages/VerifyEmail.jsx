import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      try {
        const { data } = await axios.get(`/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
      }
    };
    verifyUser();
  }, [token]);

  return (
    <div className="flex h-screen items-center justify-center bg-spotifyBlack text-white">
      <div className="w-full max-w-md p-8 pt-12 space-y-8 bg-black rounded-lg sm:p-10 shadow-xl border border-spotifyLight text-center">
        {status === 'verifying' && (
          <div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold">Verifying your email...</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-black text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
            <p className="text-spotifyGrey mb-8">{message}</p>
            <Link to="/login" className="px-8 py-3 bg-primary text-black font-bold uppercase rounded-full hover:scale-105 transition-transform inline-block">
              Log In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">✗</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
            <p className="text-spotifyGrey mb-8">{message}</p>
            <Link to="/signup" className="text-white hover:text-primary transition-colors hover:underline font-bold">
              Try signing up again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
