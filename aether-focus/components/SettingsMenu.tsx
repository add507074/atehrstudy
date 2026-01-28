import React, { useState, useEffect } from 'react';
import { Settings, Clock, Plus, Trash2, Image as ImageIcon, Grid, AppWindow } from 'lucide-react';
import { Preset, BackgroundConfig, BackgroundType } from '../types';

interface SettingsMenuProps {
  presets: Preset[];
  onSelectPreset: (preset: Preset) => void;
  onAddPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  currentBg: BackgroundConfig;
  onUpdateBg: (config: BackgroundConfig) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  presets, onSelectPreset, onAddPreset, onDeletePreset, currentBg, onUpdateBg 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'appearance'>('presets');
  
  // New Preset State
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDuration, setNewPresetDuration] = useState(25);

  const handleCreatePreset = () => {
    if (!newPresetName) return;
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      durationMinutes: newPresetDuration
    };
    onAddPreset(newPreset);
    setNewPresetName('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateBg({ type: BackgroundType.IMAGE, value: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed top-8 left-8 z-50 flex flex-col items-start">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-[1.5rem] backdrop-blur-[30px] border border-white/20 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
      >
        <Settings size={24} className={isOpen ? 'animate-spin-slow' : ''} />
      </button>

      {/* Menu Panel */}
      <div className={`mt-4 w-80 backdrop-blur-[40px] bg-black/40 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 origin-top-left ${isOpen ? 'opacity-100 scale-100 max-h-[600px]' : 'opacity-0 scale-90 max-h-0 pointer-events-none'}`}>
        
        {/* Tabs */}
        <div className="flex p-2 gap-2 border-b border-white/10">
            <button 
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'presets' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
            >
                التقنيات
            </button>
            <button 
                onClick={() => setActiveTab('appearance')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
            >
                المظهر
            </button>
        </div>

        <div className="p-4">
            {activeTab === 'presets' ? (
                <div className="space-y-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {presets.map(preset => (
                            <div key={preset.id} className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 cursor-pointer" onClick={() => { onSelectPreset(preset); setIsOpen(false); }}>
                                <div className="flex items-center gap-3">
                                    <Clock size={16} className="text-white/60" />
                                    <div>
                                        <div className="text-white text-sm font-medium">{preset.name}</div>
                                        <div className="text-white/40 text-xs">{preset.durationMinutes} دقيقة</div>
                                    </div>
                                </div>
                                {!['pomo-25', 'short-break', 'long-session'].includes(preset.id) && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeletePreset(preset.id); }}
                                        className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Preset */}
                    <div className="pt-4 border-t border-white/10">
                        <label className="text-xs text-white/50 mb-2 block">إضافة تخصيص جديد</label>
                        <input 
                            type="text" 
                            placeholder="اسم الجلسة..." 
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:bg-white/10 mb-2"
                        />
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="دقيقة" 
                                value={newPresetDuration}
                                onChange={(e) => setNewPresetDuration(Number(e.target.value))}
                                className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:bg-white/10"
                            />
                            <button 
                                onClick={handleCreatePreset}
                                disabled={!newPresetName}
                                className="flex-1 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                حفظ
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => onUpdateBg({ type: BackgroundType.MESH, value: '' })}
                            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${currentBg.type === BackgroundType.MESH ? 'bg-purple-500/20 border-purple-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
                            <span className="text-white text-xs">تدرج لوني</span>
                        </button>

                        <button 
                            onClick={() => onUpdateBg({ type: BackgroundType.SOLID, value: '#1a1a1a' })}
                            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${currentBg.type === BackgroundType.SOLID ? 'bg-white/20 border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/20"></div>
                            <span className="text-white text-xs">داكن</span>
                        </button>
                    </div>

                    <div className="relative">
                        <label className={`w-full p-4 rounded-2xl border border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${currentBg.type === BackgroundType.IMAGE ? 'border-white bg-white/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}>
                            <ImageIcon size={20} className="text-white/70" />
                            <span className="text-white/70 text-sm">رفع صورة خاصة</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;