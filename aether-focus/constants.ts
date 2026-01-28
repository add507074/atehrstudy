import { Preset, Song } from './types';

export const DEFAULT_PRESETS: Preset[] = [
  { id: 'pomo-25', name: 'طماطم (Pomodoro)', durationMinutes: 25 },
  { id: 'short-break', name: 'استراحة قصيرة', durationMinutes: 5 },
  { id: 'long-session', name: 'جلسة عميقة', durationMinutes: 50 },
];

// Lofi Girl stream ID as default
export const DUMMY_SONG: Song = {
  videoId: "jfKfPfyJRdk", 
  title: "Lofi Girl Study Beats",
  artist: "Lofi Girl",
  coverUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
  isAmbient: false,
};

export const AMBIENT_SOUNDS: Song[] = [
  {
    videoId: "mPZkdNFkNps",
    title: "Heavy Rain & Thunder",
    artist: "Ambient Nature",
    coverUrl: "https://img.youtube.com/vi/mPZkdNFkNps/mqdefault.jpg",
    isAmbient: true
  },
  {
    videoId: "gaGrHUekGrc",
    title: "Coffee Shop Vibes",
    artist: "Ambient Noise",
    coverUrl: "https://img.youtube.com/vi/gaGrHUekGrc/mqdefault.jpg",
    isAmbient: true
  },
  {
    videoId: "xNN7iTA57jM",
    title: "Forest Birds",
    artist: "Nature Sounds",
    coverUrl: "https://img.youtube.com/vi/xNN7iTA57jM/mqdefault.jpg",
    isAmbient: true
  }
];