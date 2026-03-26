import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRestriction, clearRestriction } from '../features/playerSlice';
import { Timer, X } from 'lucide-react';

const TimeRestricted = () => {
  const dispatch = useDispatch();
  const { restrictionEndTime } = useSelector((state) => state.player);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  // Options: 5 mins, 30 mins, 1 hr, 2 hr, ..., 7 hr
  const timeOptions = [
    { label: '30 Minutes', value: 0.5 },
    { label: '1 Hour', value: 1 },
    { label: '2 Hours', value: 2 },
    { label: '3 Hours', value: 3 },
    { label: '4 Hours', value: 4 },
    { label: '5 Hours', value: 5 },
    { label: '6 Hours', value: 6 },
    { label: '7 Hours', value: 7 },
  ];

  const handleSelectTime = (hours) => {
    const ms = hours * 60 * 60 * 1000;
    const endTime = Date.now() + ms;
    dispatch(setRestriction(endTime));
  };

  const handleClear = () => {
    dispatch(clearRestriction());
  };

  useEffect(() => {
    let interval;
    if (restrictionEndTime) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = restrictionEndTime - now;
        if (diff <= 0) {
          setTimeLeftStr('Time finished!');
          return;
        }

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const hStr = h > 0 ? `${h}h ` : '';
        const mStr = `${m}m `;
        const sStr = `${s}s`;

        setTimeLeftStr(hStr + mStr + sStr);
      };

      updateTimer(); // Initial call
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimeLeftStr('');
    }

    return () => clearInterval(interval);
  }, [restrictionEndTime]);

  return (
    <div className="relative h-full overflow-y-auto bg-spotifyDark p-8 pb-24">
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex items-center gap-4 mb-4 text-white">
          <div className="bg-purple-600 p-3 rounded-full flex items-center justify-center shadow-lg">
            <Timer className="w-8 h-8 font-bold" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Time-Restricted Playback</h1>
        </div>
        <p className="text-spotifyGrey text-lg mb-10">
          Listen to your favorite songs endlessly, but with a hard stop. Select a duration below, and playback will automatically halt when the timer reaches zero. Perfect for focused working sessions or winding down before sleep.
        </p>

        {restrictionEndTime ? (
          <div className="bg-[#181818] border border-spotifyLight rounded-2xl p-10 flex flex-col items-center justify-center shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Time Remaining</h2>
            <div className="text-6xl md:text-8xl font-black text-primary mb-8 tracking-tighter">
              {timeLeftStr}
            </div>
            <p className="text-spotifyGrey mb-8">Songs will stop playing automatically when this timer hits zero.</p>
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
            >
              <X className="w-5 h-5" /> Cancel Timer
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Select Duration</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {timeOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelectTime(opt.value)}
                  className="bg-[#181818] hover:bg-[#282828] border border-transparent hover:border-spotifyLight transition-all p-8 rounded-xl cursor-pointer flex flex-col items-center justify-center group"
                >
                  <span className="text-2xl font-bold text-white group-hover:text-primary transition-colors mb-2">
                    {opt.label}
                  </span>
                  <span className="text-sm text-spotifyGrey">Endless streaming</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeRestricted;
