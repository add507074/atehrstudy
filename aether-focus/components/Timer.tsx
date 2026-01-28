import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Edit2, RotateCcw, Check } from 'lucide-react';

interface TimerProps {
  initialMinutes: number;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(initialMinutes);

  // Update timer when preset changes externally
  useEffect(() => {
    setTimeLeft(initialMinutes * 60);
    setIsActive(false);
    setEditMinutes(initialMinutes);
  }, [initialMinutes]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Could play sound here
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialMinutes * 60);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    setTimeLeft(editMinutes * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100;

  return (
    <div className="relative group w-full max-w-md mx-auto">
      {/* Glass Panel */}
      <div className="backdrop-blur-[30px] bg-white/10 border border-white/20 shadow-2xl rounded-[3rem] p-10 flex flex-col items-center justify-center text-white transition-all duration-500 hover:bg-white/15">
        
        {/* Progress Ring Indicator (Subtle background) */}
        <div className="absolute inset-0 rounded-[3rem] overflow-hidden pointer-events-none opacity-10">
            <div 
                className="h-full bg-white transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>

        {isEditing ? (
          <div className="flex flex-col items-center animate-fadeIn">
            <label className="text-sm font-light text-white/70 mb-2">تعيين الدقائق</label>
            <div className="flex items-center gap-2">
                <input
                type="number"
                value={editMinutes}
                onChange={(e) => setEditMinutes(Number(e.target.value))}
                className="bg-transparent border-b-2 border-white/30 text-6xl font-thin text-center w-32 focus:outline-none focus:border-white transition-colors"
                autoFocus
                />
                <button 
                    onClick={handleEditSave}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all text-white"
                >
                    <Check size={24} />
                </button>
            </div>
          </div>
        ) : (
          <div className="relative mb-6">
             <div className="text-[7rem] leading-none font-extralight tracking-tighter tabular-nums select-none">
              {formatTime(timeLeft)}
            </div>
            <button 
                onClick={() => setIsEditing(true)}
                className="absolute -right-4 top-0 p-2 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="تعديل الوقت"
            >
                <Edit2 size={18} />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6 mt-4">
          <button 
            onClick={resetTimer}
            className="p-4 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-all"
            title="إعادة ضبط"
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
          >
            {isActive ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;