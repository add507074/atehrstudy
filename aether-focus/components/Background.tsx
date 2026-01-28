import React from 'react';
import { BackgroundConfig, BackgroundType } from '../types';

interface BackgroundProps {
  config: BackgroundConfig;
}

const Background: React.FC<BackgroundProps> = ({ config }) => {
  if (config.type === BackgroundType.IMAGE) {
    return (
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out z-0"
        style={{ backgroundImage: `url(${config.value})` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      </div>
    );
  }

  if (config.type === BackgroundType.SOLID) {
    return (
      <div 
        className="fixed inset-0 w-full h-full transition-colors duration-700 ease-in-out z-0"
        style={{ backgroundColor: config.value }}
      />
    );
  }

  // Mesh Gradient (Animated)
  return (
    <div className="fixed inset-0 w-full h-full bg-slate-900 overflow-hidden z-0">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[100px]" /> 
    </div>
  );
};

export default Background;