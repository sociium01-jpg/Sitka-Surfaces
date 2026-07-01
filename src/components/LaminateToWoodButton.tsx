'use client';

import React, { useState } from 'react';

type ButtonProps = {
  onClick?: () => void;
  className?: string;
  label: string;
  loadingLabel?: string;
  isLoadingExternal?: boolean;
};

export default function LaminateToWoodButton({ 
  onClick, 
  className = '', 
  label, 
  loadingLabel = 'Processing...',
  isLoadingExternal
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const loading = isLoadingExternal !== undefined ? isLoadingExternal : isLoadingLocal;

  const handleClick = () => {
    if (loading) return;
    if (onClick) {
      onClick();
    } else {
      setIsLoadingLocal(true);
      setTimeout(() => setIsLoadingLocal(false), 2500);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading}
      className={`relative overflow-hidden group select-none text-parchment text-xs font-mono tracking-widest uppercase py-4 px-8 rounded-sm transition-all duration-500 border border-line cursor-pointer min-w-[220px] text-center shadow-lg ${className}`}
    >
      {/* 1. Base Laminate Color layer (Sitka Brand Yellow) */}
      <div 
        className="absolute inset-0 bg-ember transition-colors duration-500 z-0" 
        style={{ 
          backgroundColor: loading ? '#e59b1a' : isHovered ? '#ffc24d' : '#f9ac20' 
        }} 
      />

      {/* 2. Woodgrain Texture Overlay (fades in on hover/load) */}
      <div 
        className="absolute inset-0 z-10 transition-opacity duration-700 pointer-events-none bg-cover bg-center mix-blend-multiply"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80")',
          opacity: loading ? 0.95 : isHovered ? 0.70 : 0,
        }}
      />

      {/* 3. Press / Edge Highlight Lines */}
      <div 
        className="absolute inset-x-0 bottom-0 h-px bg-white/25 z-20 transition-opacity duration-500"
        style={{ opacity: isHovered || loading ? 1 : 0 }}
      />
      <div 
        className="absolute inset-y-0 left-0 w-px bg-white/25 z-20 transition-opacity duration-500"
        style={{ opacity: isHovered || loading ? 1 : 0 }}
      />

      {/* 4. Text Label Wrapper */}
      <span className="relative z-20 flex items-center justify-center gap-2 drop-shadow-sm font-semibold transition-all duration-300">
        {loading ? (
          <>
            {/* Spinning indicator */}
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-parchment" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{loadingLabel}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </span>

      {/* 5. Tactile Scan Ripple sweep */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer z-10 pointer-events-none"
        style={{ animationDuration: '1.5s' }}
      />
    </button>
  );
}
