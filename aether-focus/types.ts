export enum BackgroundType {
  SOLID = 'SOLID',
  MESH = 'MESH',
  IMAGE = 'IMAGE'
}

export interface Preset {
  id: string;
  name: string;
  durationMinutes: number;
}

export interface BackgroundConfig {
  type: BackgroundType;
  value: string; // Hex color or Image URL
}

export interface Song {
  videoId: string;
  title: string;
  artist: string;
  coverUrl: string;
  isAmbient?: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type RepeatMode = 'OFF' | 'ONE';