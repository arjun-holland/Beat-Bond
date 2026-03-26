import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import { togglePlayPause, playNext, setProgress, setDuration, setPlayState, setHostAction, clearRestriction, setVolume } from '../features/playerSlice';
import YouTube from 'react-youtube';

const Player = () => {
  const dispatch = useDispatch();
  
  const { currentSong, isPlaying, restrictionEndTime, progress, volume } = useSelector(state => state.player);
  const { userInfo } = useSelector(state => state.auth);
  
  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);

  // Sync isPlaying state to YouTube iframe
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  // Sync volume state
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume * 100); // 0-1 mapped to 0-100
    }
  }, [volume]);

  // Restriction Timer Check
  useEffect(() => {
    let interval;
    if (restrictionEndTime) {
      interval = setInterval(() => {
        if (Date.now() >= restrictionEndTime) {
          // Time is up! 
          dispatch(setPlayState(false));
          dispatch(clearRestriction());
          
          if (Notification.permission === 'granted') {
            new Notification('Endless playlist stopped', {
              body: 'endless playlist stopped if you want to listen more choose',
            });
          } else {
            alert('endless playlist stopped if you want to listen more choose');
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restrictionEndTime, dispatch]);

  // Track progress manually since YouTube API doesn't push it automatically
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setLocalProgress(time);
          dispatch(setProgress(time)); // Tell Redux so we can save it!
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, dispatch]);

  const onReady = (event) => {
    playerRef.current = event.target;
    const duration = event.target.getDuration();
    setLocalDuration(duration);
    dispatch(setDuration(duration));
    event.target.setVolume(volume * 100);
    
    // Auto-resume exactly where we left off
    if (progress > 0) {
      event.target.seekTo(progress, true);
      setLocalProgress(progress);
    }
    
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onStateChange = (event) => {
    // 0 = ended, 1 = playing, 2 = paused
    if (event.data === 0) {
      dispatch(playNext());
    } else if (event.data === 1 && !isPlaying) {
      dispatch(setPlayState(true));
      dispatch(setHostAction({ action: 'play', position: playerRef.current?.getCurrentTime() || 0, ts: Date.now() }));
    } else if (event.data === 2 && isPlaying) {
      dispatch(setPlayState(false));
      dispatch(setHostAction({ action: 'pause', position: playerRef.current?.getCurrentTime() || 0, ts: Date.now() }));
    }
  };

  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    setLocalProgress(value);
    if (playerRef.current) {
      playerRef.current.seekTo(value, true);
    }
    dispatch(setHostAction({ action: 'seek', position: value, ts: Date.now() }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!userInfo) return null;

  return (
    <div className="h-full flex items-center justify-between px-4 relative">
      {/* Hidden Authentic YouTube Player */}
      {currentSong && currentSong.id && (
        <div className="opacity-0 pointer-events-none fixed bottom-0 right-0 -z-50 w-[200px] h-[200px]">
          <YouTube 
            videoId={currentSong.id}
            opts={{
              height: '200',
              width: '200',
              playerVars: {
                autoplay: 1,
                controls: 0,
                showinfo: 0,
                origin: window.location.origin,
                enablejsapi: 1
              }
            }}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        </div>
      )}

      {/* Track Info */}
      <div className="flex items-center w-1/4 gap-4">
        {currentSong ? (
          <>
            <img 
              src={currentSong.coverImage || 'https://via.placeholder.com/64'} 
              alt="cover" 
              className="w-14 h-14 rounded-md object-cover shadow-lg"
            />
            <div className="truncate">
              <h4 className="text-white text-sm font-bold truncate hover:underline cursor-pointer">{currentSong.title}</h4>
              <p className="text-spotifyGrey text-xs truncate hover:underline cursor-pointer">{currentSong.artist}</p>
            </div>
          </>
        ) : (
          <div className="text-spotifyGrey text-sm">No track selected</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 max-w-2xl px-10 flex flex-col items-center justify-center">
        {/* Buttons */}
        <div className="flex items-center gap-6 mb-2">
          <button className="text-spotifyGrey hover:text-white transition-colors" title="Previous">
            <SkipBack className="fill-current w-5 h-5" />
          </button>
          
          <button 
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform text-black"
            onClick={() => {
              if (currentSong) {
                dispatch(togglePlayPause());
                if (!isPlaying) {
                  dispatch(setHostAction({ action: 'play', position: localProgress, ts: Date.now() }));
                } else {
                  dispatch(setHostAction({ action: 'pause', position: localProgress, ts: Date.now() }));
                }
              }
            }}
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="fill-current w-5 h-5" />
            ) : (
              <Play className="fill-current w-5 h-5 ml-1" />
            )}
          </button>
          
          <button 
            className="text-spotifyGrey hover:text-white transition-colors" 
            title="Next Track"
            onClick={() => dispatch(playNext())}
          >
            <SkipForward className="fill-current w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center w-full gap-2 text-xs text-spotifyGrey font-mono">
          <span>{formatTime(localProgress)}</span>
          <div className="flex-1 group flex items-center h-2 cursor-pointer bg-spotifyLight rounded-full relative">
            <input 
              type="range"
              min="0"
              max={localDuration || 100}
              value={localProgress}
              onChange={handleSeek}
              disabled={!currentSong}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="bg-white group-hover:bg-primary h-full rounded-full transition-colors relative"
              style={{ width: `${localDuration ? (localProgress / localDuration) * 100 : 0}%` }}
            >
              <div className="w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow"></div>
            </div>
          </div>
          <span>{formatTime(localDuration)}</span>
        </div>
      </div>

      {/* Extras (Volume, Enlarge) */}
      <div className="w-1/4 flex items-center justify-end gap-3 text-spotifyGrey">
        <Volume2 className="w-5 h-5" />
        <div className="w-24 group flex items-center h-1 cursor-pointer bg-spotifyLight rounded-full relative">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="bg-white group-hover:bg-primary h-full rounded-full transition-colors"
              style={{ width: `${volume * 100}%` }}
            ></div>
        </div>
        <button onClick={toggleFullscreen} className="hover:text-white transition-colors" title="Fullscreen">
          <Maximize2 className="w-4 h-4 ml-2 cursor-pointer" />
        </button>
      </div>
    </div>
  );
};

export default Player;
