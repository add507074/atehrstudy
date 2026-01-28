import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Maximize2, Minimize2, 
  Music, Search, CloudRain, Coffee, Trees, Loader2, 
  ListMusic, Repeat, Plus, PlayCircle, X 
} from 'lucide-react';
import { Song, RepeatMode } from '../types';
import { AMBIENT_SOUNDS } from '../constants';
import { searchYouTube } from '../utils/gemini';

interface MusicPlayerProps {
  song: Song;
  onSongChange: (song: Song) => void;
  isFloating: boolean;
  onToggleFloat: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ song, onSongChange, isFloating, onToggleFloat }) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'MUSIC' | 'AMBIENT'>('MUSIC');
  const [queue, setQueue] = useState<Song[]>([]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('OFF');
  
  // UI State
  const [activeOverlay, setActiveOverlay] = useState<'NONE' | 'SEARCH' | 'QUEUE'>('NONE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // Thumbnail fallback state
  const [imgError, setImgError] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // --- Effects ---

  // When song changes, reset image error and set playing state
  useEffect(() => {
    setImgError(false);
    setIsPlaying(true);
  }, [song.videoId]);

  // Listen for YouTube Iframe Messages to detect "Ended" state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
            const data = JSON.parse(event.data);
            
            // Player Status Change
            if (data.event === 'infoDelivery' && data.info) {
                // State 0 = Ended
                if (data.info.playerState === 0) {
                    handleSongEnd();
                }
                // State 1 = Playing
                if (data.info.playerState === 1) {
                    setIsPlaying(true);
                }
                // State 2 = Paused
                if (data.info.playerState === 2) {
                    setIsPlaying(false);
                }
            }
        } catch (e) {
            // ignore
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [repeatMode, queue, song]);

  // --- Logic ---

  const handleIframeLoad = () => {
      // Force play command when iframe loads
      if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          setIsPlaying(true);
      }
  };

  const handleSongEnd = () => {
      if (repeatMode === 'ONE') {
          const iframe = iframeRef.current;
          if (iframe) {
              iframe.contentWindow?.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', '*');
              iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          }
      } else if (queue.length > 0) {
          playNext();
      } else {
          setIsPlaying(false);
      }
  };

  const togglePlay = () => {
    const action = !isPlaying ? 'playVideo' : 'pauseVideo';
    if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(`{"event":"command","func":"${action}","args":""}`, '*');
        setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
      if (queue.length > 0) {
          const nextSong = queue[0];
          setQueue(prev => prev.slice(1));
          onSongChange(nextSong);
      }
  };

  const toggleRepeat = () => {
      setRepeatMode(prev => prev === 'OFF' ? 'ONE' : 'OFF');
  };

  // --- Search Logic ---

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]); 
    
    const results = await searchYouTube(searchQuery);
    setIsSearching(false);

    if (results && results.length > 0) {
        const mappedSongs: Song[] = results.map(r => ({
            videoId: r.videoId,
            title: r.title,
            artist: r.artist,
            // Use hqdefault as base, fallback logic is handled in render
            coverUrl: `https://img.youtube.com/vi/${r.videoId}/hqdefault.jpg`,
            isAmbient: false
        }));
        setSearchResults(mappedSongs);
    }
  };

  const handlePlayNow = (selectedSong: Song) => {
      onSongChange(selectedSong);
      setMode('MUSIC');
      setActiveOverlay('NONE');
      setSearchQuery('');
      setSearchResults([]);
  };

  const handleAddToQueue = (selectedSong: Song) => {
      setQueue(prev => [...prev, selectedSong]);
  };

  // --- Render Helpers ---

  // Helper to get reliable image source
  const getCoverSrc = (s: Song) => {
      // Ambient sounds might have static URLs, logic primarily for YouTube
      if (s.isAmbient) return s.coverUrl;
      // If error occurred previously, try mqdefault (lower res but safer)
      if (imgError) return `https://img.youtube.com/vi/${s.videoId}/mqdefault.jpg`;
      return `https://img.youtube.com/vi/${s.videoId}/hqdefault.jpg`;
  };

  const renderOverlay = () => {
      if (activeOverlay === 'NONE') return null;

      return (
          <div className="absolute inset-0 z-20 backdrop-blur-xl bg-black/80 rounded-[2rem] flex flex-col p-6 animate-fadeIn transition-all">
              <button 
                  onClick={() => setActiveOverlay('NONE')}
                  className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors z-30"
              >
                  <X size={16} />
              </button>

              {activeOverlay === 'SEARCH' && (
                  <div className="flex flex-col h-full">
                      <h3 className="text-white font-medium mb-4 text-center">بحث في يوتيوب</h3>
                      <form onSubmit={handleSearch} className="relative mb-4 shrink-0">
                          <input 
                              autoFocus
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="اسم الأغنية..."
                              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-white text-sm text-right focus:outline-none focus:border-white/40"
                          />
                          <button type="submit" disabled={isSearching} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                          </button>
                      </form>

                      {/* Search Results List */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2 custom-scrollbar">
                        {searchResults.length === 0 && !isSearching && searchQuery && (
                             <div className="text-center text-white/30 text-xs mt-10">لا توجد نتائج</div>
                        )}
                        
                        {searchResults.map((result) => (
                            <div key={result.videoId} className="bg-white/5 hover:bg-white/10 rounded-xl p-2 flex gap-3 items-center border border-white/5 transition-colors group">
                                <img src={result.coverUrl} className="w-16 h-16 rounded-lg object-cover shadow-sm shrink-0 bg-black/50" alt="Result" />
                                
                                <div className="flex-1 min-w-0 text-right flex flex-col justify-center">
                                    <div className="text-white/60 text-[10px] uppercase tracking-wider truncate mb-0.5">{result.artist}</div>
                                    <div className="text-white font-bold text-xs truncate leading-tight">{result.title}</div>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <button 
                                        onClick={() => handlePlayNow(result)} 
                                        className="p-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                                        title="تشغيل الآن"
                                    >
                                        <PlayCircle size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleAddToQueue(result)} 
                                        className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                        title="إضافة للقائمة"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                      </div>
                  </div>
              )}

              {activeOverlay === 'QUEUE' && (
                  <div className="flex flex-col h-full">
                       <h3 className="text-white font-medium mb-4 text-center">قائمة الانتظار</h3>
                       <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {queue.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-40 text-white/30 text-sm">
                                  <ListMusic size={32} className="mb-2 opacity-50" />
                                  القائمة فارغة
                              </div>
                          ) : (
                              queue.map((qSong, idx) => (
                                  <div key={`${qSong.videoId}-${idx}`} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-transparent hover:border-white/10 group">
                                      <img src={qSong.coverUrl} className="w-10 h-10 rounded-lg object-cover bg-black/50" alt="Art" />
                                      <div className="flex-1 min-w-0 text-right">
                                          <div className="text-white text-xs font-medium truncate">{qSong.title}</div>
                                          <div className="text-white/40 text-[10px] truncate">{qSong.artist}</div>
                                      </div>
                                      <button 
                                        onClick={() => {
                                            const newQueue = [...queue];
                                            newQueue.splice(idx, 1);
                                            setQueue(newQueue);
                                        }}
                                        className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                          <X size={14} />
                                      </button>
                                  </div>
                              ))
                          )}
                       </div>
                  </div>
              )}
          </div>
      );
  };


  // --- Floating View ---
  if (isFloating) {
    return (
      <div className="fixed bottom-8 right-8 z-50 group">
        <div className="relative flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
                        w-16 h-16 rounded-full 
                        group-hover:w-80 group-hover:h-28 group-hover:rounded-[2rem]
                        backdrop-blur-[30px] bg-white/10 border border-white/20 shadow-2xl overflow-hidden">
          
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
             <img 
                src={getCoverSrc(song)} 
                onError={() => setImgError(true)}
                alt="Album" 
                className={`w-full h-full object-cover opacity-80 ${isPlaying ? 'animate-spin-slow' : ''}`}
                style={{ animationDuration: '10s' }}
             />
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                {isPlaying ? <div className="w-3 h-3 bg-white rounded-full animate-pulse" /> : <Music size={20} className="text-white" />}
             </div>
          </div>

          <div className="absolute inset-0 flex flex-row items-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
            <img 
                src={getCoverSrc(song)} 
                onError={() => setImgError(true)}
                className="w-16 h-16 rounded-xl shadow-lg shrink-0 object-cover bg-black/50" 
                alt="Cover" 
            />
            
            <div className="flex flex-col flex-1 mx-4 overflow-hidden text-right">
                <span className="text-white font-medium text-sm truncate">{song.title}</span>
                <span className="text-white/60 text-xs truncate">{song.artist}</span>
            </div>

            <div className="flex gap-2">
                <button onClick={togglePlay} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
                <button onClick={onToggleFloat} className="p-2 text-white/50 hover:text-white transition-colors">
                    <Maximize2 size={16} />
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Central View ---
  return (
    <div className="w-full max-w-lg mx-auto mt-6 transition-all duration-500 animate-slideUp">
      <div className="relative backdrop-blur-[30px] bg-white/5 border border-white/10 shadow-xl rounded-[2.5rem] p-6 flex flex-col gap-4 overflow-hidden">
        
        {/* Top Controls Row */}
        <div className="flex justify-between items-center z-10 relative">
             <div className="flex gap-2">
                <button 
                    onClick={onToggleFloat}
                    className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    title="تصغير"
                >
                    <Minimize2 size={16} />
                </button>
                <button 
                    onClick={() => setActiveOverlay(activeOverlay === 'QUEUE' ? 'NONE' : 'QUEUE')}
                    className={`p-2 rounded-full transition-colors ${activeOverlay === 'QUEUE' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                    title="قائمة الانتظار"
                >
                    <ListMusic size={16} />
                    {queue.length > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></span>
                    )}
                </button>
             </div>

             {/* Mode Toggles (Subtle) */}
             <div className="flex bg-black/20 rounded-full p-1 gap-1">
                 <button 
                    onClick={() => setMode('MUSIC')}
                    className={`p-1.5 rounded-full transition-all ${mode === 'MUSIC' ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                 >
                    <Music size={14} />
                 </button>
                 <button 
                    onClick={() => setMode('AMBIENT')}
                    className={`p-1.5 rounded-full transition-all ${mode === 'AMBIENT' ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                 >
                    <CloudRain size={14} />
                 </button>
             </div>

             <button 
                onClick={() => setActiveOverlay(activeOverlay === 'SEARCH' ? 'NONE' : 'SEARCH')}
                className={`p-2 rounded-full transition-colors ${activeOverlay === 'SEARCH' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                title="بحث"
            >
                <Search size={16} />
             </button>
        </div>

        {/* Main Content Area */}
        <div className="relative aspect-video w-full bg-black/20 rounded-2xl overflow-hidden shadow-inner group-image">
             {/* Overlays (Search/Queue) */}
             {renderOverlay()}

             {mode === 'MUSIC' ? (
                <>
                    {/* Art Background */}
                    <img 
                        src={getCoverSrc(song)} 
                        onError={() => setImgError(true)}
                        alt={song.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-image-hover:scale-105 transition-transform duration-1000 bg-black"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Song Info */}
                    <div className="absolute bottom-4 right-4 text-right max-w-[80%] z-10 pointer-events-none">
                        <h3 className="text-white font-bold text-lg leading-tight truncate drop-shadow-md">{song.title}</h3>
                        <p className="text-white/70 text-xs truncate drop-shadow-md">{song.artist}</p>
                    </div>

                    {/* Actual YouTube Iframe - Hidden behind but active */}
                    {/* We position it behind the image (-z-10) but display block so it runs */}
                    <div className="absolute inset-0 -z-10 pointer-events-none opacity-0">
                         <iframe 
                            key={song.videoId} 
                            ref={iframeRef}
                            width="100%" 
                            height="100%"
                            src={`https://www.youtube.com/embed/${song.videoId}?enablejsapi=1&autoplay=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&origin=${window.location.origin}`}
                            allow="autoplay; encrypted-media"
                            title="Audio Player"
                            onLoad={handleIframeLoad}
                        />
                    </div>
                </>
             ) : (
                 <div className="absolute inset-0 p-4 grid grid-cols-3 gap-3 overflow-y-auto">
                    {AMBIENT_SOUNDS.map((sound) => {
                        const isActive = song.videoId === sound.videoId;
                        return (
                            <button 
                                key={sound.videoId}
                                onClick={() => { onSongChange(sound); setIsPlaying(true); }}
                                className={`rounded-xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 ${isActive ? 'bg-white/20 border-white text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                            >
                                {sound.title.includes('Rain') && <CloudRain size={20} />}
                                {sound.title.includes('Coffee') && <Coffee size={20} />}
                                {sound.title.includes('Forest') && <Trees size={20} />}
                                <span className="text-[10px] font-medium">{sound.title.split(' ')[0]}</span>
                            </button>
                        )
                    })}
                 </div>
             )}
        </div>

        {/* Playback Controls */}
        {mode === 'MUSIC' && (
            <div className="flex items-center justify-between px-2">
                 <button 
                    onClick={toggleRepeat}
                    className={`p-2 transition-colors ${repeatMode === 'ONE' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/30 hover:text-white'}`}
                    title="تكرار أغنية واحدة"
                 >
                    <Repeat size={18} />
                    {repeatMode === 'ONE' && <div className="absolute -top-1 right-2 text-[8px] font-bold">1</div>}
                 </button>

                 <div className="flex items-center gap-6">
                     <button className="text-white/60 hover:text-white transition-colors" title="السابق">
                        <SkipBack size={24} fill="currentColor" />
                     </button>
                     
                     <button 
                        onClick={togglePlay}
                        className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-white/20"
                     >
                        {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                     </button>

                     <button 
                        onClick={playNext}
                        className="text-white/60 hover:text-white transition-colors disabled:opacity-30" 
                        disabled={queue.length === 0}
                        title="التالي"
                     >
                        <SkipForward size={24} fill="currentColor" />
                     </button>
                 </div>
                 
                 {/* Empty spacer for balance */}
                 <div className="w-9"></div> 
            </div>
        )}

      </div>
    </div>
  );
};

export default MusicPlayer;