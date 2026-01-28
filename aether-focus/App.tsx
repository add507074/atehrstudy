import React, { useState, useEffect } from 'react';
import Background from './components/Background';
import Timer from './components/Timer';
import MusicPlayer from './components/MusicPlayer';
import SettingsMenu from './components/SettingsMenu';
import TaskManager from './components/TaskManager';
import { BackgroundConfig, BackgroundType, Preset, Song } from './types';
import { DEFAULT_PRESETS, DUMMY_SONG } from './constants';

const App: React.FC = () => {
  // State
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({
    type: BackgroundType.MESH,
    value: '',
  });

  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [currentTimerMinutes, setCurrentTimerMinutes] = useState(25);
  const [isPlayerFloating, setIsPlayerFloating] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song>(DUMMY_SONG);

  // Load saved presets from LocalStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('study-timer-presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        if (Array.isArray(parsed) && parsed.length > 0) {
            setPresets(parsed);
        }
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  // Save presets
  const savePresetsToStorage = (newPresets: Preset[]) => {
    setPresets(newPresets);
    localStorage.setItem('study-timer-presets', JSON.stringify(newPresets));
  };

  const handleAddPreset = (preset: Preset) => {
    const updated = [...presets, preset];
    savePresetsToStorage(updated);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    savePresetsToStorage(updated);
  };

  const handleSelectPreset = (preset: Preset) => {
    setCurrentTimerMinutes(preset.durationMinutes);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      <Background config={backgroundConfig} />

      <SettingsMenu 
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onAddPreset={handleAddPreset}
        onDeletePreset={handleDeletePreset}
        currentBg={backgroundConfig}
        onUpdateBg={setBackgroundConfig}
      />

      <TaskManager />

      {/* Main Layout Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Timer is always central */}
        <div className={`transition-all duration-700 ease-out ${isPlayerFloating ? 'translate-y-0 scale-110' : '-translate-y-8'}`}>
            <Timer initialMinutes={currentTimerMinutes} />
        </div>

        {/* Player */}
        <MusicPlayer 
          song={currentSong} 
          onSongChange={setCurrentSong}
          isFloating={isPlayerFloating} 
          onToggleFloat={() => setIsPlayerFloating(!isPlayerFloating)} 
        />
        
      </div>
      
      {/* Decorative Branding */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/20 text-xs font-light tracking-[0.2em] pointer-events-none">
        AETHER FOCUS OS
      </div>
    </div>
  );
};

export default App;