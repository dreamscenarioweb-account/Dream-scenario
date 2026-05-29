import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

// Helper component for star sparkle
const Sparkle: React.FC<{ cx: number; cy: number; r: number; className?: string }> = ({ cx, cy, r, className }) => (
  <path
    d={`M ${cx} ${cy - r} Q ${cx} ${cy} ${cx + r} ${cy} Q ${cx} ${cy} ${cx} ${cy + r} Q ${cx} ${cy} ${cx - r} ${cy} Q ${cx} ${cy} ${cx} ${cy - r} Z`}
    fill="currentColor"
    stroke="none"
    className={className}
  />
);

// 1. Weddings: Premium clinking champagne flutes with hearts and floating bubbles
export const WeddingsIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Left Glass (Tilted Right) */}
    <g transform="rotate(15 12 12)">
      {/* Bowl */}
      <path d="M 8 5 L 8 12 C 8 14.5 10 15 10 15 C 10 15 12 14.5 12 12 L 12 5 Z" />
      {/* Stem */}
      <path d="M 10 15 L 10 20" />
      {/* Base */}
      <path d="M 8 20 L 12 20" />
      {/* Liquid level */}
      <path d="M 8 9 L 12 9" strokeDasharray="1 1" />
    </g>

    {/* Right Glass (Tilted Left) */}
    <g transform="translate(4, 0) rotate(-15 12 12)">
      {/* Bowl */}
      <path d="M 8 5 L 8 12 C 8 14.5 10 15 10 15 C 10 15 12 14.5 12 12 L 12 5 Z" />
      {/* Stem */}
      <path d="M 10 15 L 10 20" />
      {/* Base */}
      <path d="M 8 20 L 12 20" />
      {/* Liquid level */}
      <path d="M 8 9 L 12 9" strokeDasharray="1 1" />
    </g>

    {/* Sparkling Toast details & Hearts */}
    <path
      d="M 12 2.5 C 12.5 1.5 13.5 1.5 14 2 C 14.5 2.5 14.5 3.5 13.5 4 L 12 5 L 10.5 4 C 9.5 3.5 9.5 2.5 10 2 C 10.5 1.5 11.5 1.5 12 2.5 Z"
      fill="currentColor"
      stroke="none"
      opacity="0.8"
    />
    <circle cx="12" cy="7" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="9" cy="8" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="15" cy="8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

// 2. Engagements: High-quality faceted diamond ring
export const EngagementsIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Ring Band (Double circle for depth) */}
    <circle cx="12" cy="14.5" r="5" />
    <circle cx="12" cy="14.5" r="4" strokeDasharray="1 1.5" />

    {/* Diamond Facets */}
    {/* Crown outline */}
    <path d="M 9.5 9.5 L 14.5 9.5 L 16.5 6.5 L 14.5 4.5 L 9.5 4.5 L 7.5 6.5 Z" fill="none" />
    
    {/* Inner facet lines */}
    <path d="M 9.5 4.5 L 12 9.5 L 14.5 4.5" />
    <path d="M 7.5 6.5 L 16.5 6.5" />
    <path d="M 9.5 9.5 L 9.5 4.5" />
    <path d="M 14.5 9.5 L 14.5 4.5" />
    <path d="M 12 4.5 L 12 9.5" />

    {/* Sparkle star */}
    <Sparkle cx="6.5" cy="4" r="1.5" />
    <Sparkle cx="17.5" cy="4" r="1.2" />
  </svg>
);

// 3. Casual Shoots: Detailed SLR Camera with reflections
export const CasualShootsIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Main Body */}
    <path d="M 3 8 C 3 7 4 6 5 6 L 8 6 L 9.5 4.5 C 9.8 4.2 10.2 4 10.6 4 L 13.4 4 C 13.8 4 14.2 4.2 14.5 4.5 L 16 6 L 19 6 C 20 6 21 7 21 8 L 21 18 C 21 19 20 20 19 20 L 5 20 C 4 20 3 19 3 18 Z" />
    
    {/* Lens Barrel */}
    <circle cx="12" cy="13" r="4.5" />
    <circle cx="12" cy="13" r="3.5" />
    <circle cx="12" cy="13" r="2" />
    
    {/* Lens reflection highlight */}
    <path d="M 10.5 11.5 A 2 2 0 0 1 13.5 11.5" strokeWidth="0.8" />
    
    {/* Dials & Buttons */}
    <path d="M 5 6 L 5 5 L 7 5 L 7 6" /> {/* Shutter Button */}
    <circle cx="18.5" cy="8" r="0.8" fill="currentColor" stroke="none" /> {/* Red eye reduction/timer light */}
    <path d="M 17 6 C 17 5.5 17.5 5 18 5 C 18.5 5 19 5.5 19 6" /> {/* Mode dial */}
  </svg>
);

// 4. Homecomings: Intricate floral archway with curtains
export const HomecomingsIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Main Arch structure */}
    <path d="M 4 21 V 9 C 4 4.5 7.5 3 12 3 C 16.5 3 20 4.5 20 9 V 21" />
    <path d="M 6 21 V 9 C 6 5.5 8.5 4.5 12 4.5 C 15.5 4.5 18 5.5 18 9 V 21" strokeDasharray="1 1.5" />

    {/* Curtain Drape details */}
    <path d="M 4 9 Q 8 10 10 21" />
    <path d="M 20 9 Q 16 10 14 21" />
    <path d="M 4 9 C 8 8 16 8 20 9" opacity="0.5" />

    {/* Detailed flowers along the archway */}
    <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="9" cy="4" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="4" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="6" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="18" cy="6.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="10" r="1" fill="currentColor" stroke="none" />
    
    {/* Hanging lantern in center */}
    <path d="M 12 4.5 V 7.5" />
    <rect x="11" y="7.5" width="2" height="3" rx="0.5" />
    <path d="M 11.5 10.5 L 12.5 10.5" />
  </svg>
);

// 5. Cinematography: Elegant Movie/Film camera with dual reels
export const CinematographyIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Dual Film Reels */}
    <circle cx="7" cy="6" r="3.5" />
    <circle cx="7" cy="6" r="1.5" strokeDasharray="1 1" />
    <circle cx="15" cy="6" r="3.5" />
    <circle cx="15" cy="6" r="1.5" strokeDasharray="1 1" />

    {/* Camera Body */}
    <path d="M 3 10 C 3 9 4 9 5 9 L 16 9 C 17 9 18 10 18 11 L 18 17 C 18 18 17 19 16 19 L 5 19 C 4 19 3 18 3 17 Z" />
    
    {/* Viewfinder/Side screen */}
    <rect x="5" y="11" width="5" height="4" rx="0.5" />
    
    {/* Lens and Matte box */}
    <path d="M 18 12.5 L 22 10.5 L 22 17.5 L 18 15.5" />
    <path d="M 21.5 10.5 L 21.5 17.5" />

    {/* Heart symbol of passion on side screen */}
    <path
      d="M 7.5 12.5 C 7.2 12.2 6.8 12.2 6.6 12.5 C 6.4 12.8 6.4 13.2 6.6 13.4 L 7.5 14.3 L 8.4 13.4 C 8.6 13.2 8.6 12.8 8.4 12.5 C 8.2 12.2 7.8 12.2 7.5 12.5 Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

// 6. Photobooths: Floating heart balloons with ribbons and stars
export const PhotoboothsIcon: React.FC<IconProps> = ({ className, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Left Heart Balloon */}
    <g transform="translate(-1, -1)">
      <path
        d="M 8.5 13.5 C 5.5 13.5 3 11 3 8 C 3 5 5.5 3.5 7.5 5 C 8 5.5 8.5 6 8.5 6 C 8.5 6 9 5.5 9.5 5 C 11.5 3.5 14 5 14 8 C 14 11 11.5 13.5 8.5 13.5 Z"
        fill="none"
        stroke="currentColor"
      />
      {/* Ribbon tie knot */}
      <path d="M 8 13.5 L 9 13.5 L 8.5 14.5 Z" fill="currentColor" />
      {/* Curly string */}
      <path d="M 8.5 14.5 Q 7 17.5 9 20" />
    </g>

    {/* Right Heart Balloon */}
    <g transform="translate(4, 2)">
      <path
        d="M 8.5 13.5 C 5.5 13.5 3 11 3 8 C 3 5 5.5 3.5 7.5 5 C 8 5.5 8.5 6 8.5 6 C 8.5 6 9 5.5 9.5 5 C 11.5 3.5 14 5 14 8 C 14 11 11.5 13.5 8.5 13.5 Z"
        fill="none"
        stroke="currentColor"
      />
      {/* Ribbon tie knot */}
      <path d="M 8 13.5 L 9 13.5 L 8.5 14.5 Z" fill="currentColor" />
      {/* Curly string */}
      <path d="M 8.5 14.5 Q 10 17 8 19" />
    </g>

    {/* Glint sparkles */}
    <Sparkle cx="3" cy="3" r="1.2" />
    <Sparkle cx="21" cy="6" r="1.5" />
    <Sparkle cx="19" cy="18" r="1" />
  </svg>
);

// Unified lookup map supporting descriptive names and fallback icon keys
export const customIconsMap: Record<string, React.FC<IconProps>> = {
  // Descriptive names (for new selects / admin configuration)
  Weddings: WeddingsIcon,
  Engagements: EngagementsIcon,
  CasualShoots: CasualShootsIcon,
  Homecomings: HomecomingsIcon,
  Cinematography: CinematographyIcon,
  Photobooths: PhotoboothsIcon,

  // Fallback keys (to support older db entries)
  Heart: WeddingsIcon,
  Gem: EngagementsIcon,
  Camera: CasualShootsIcon,
  PartyPopper: HomecomingsIcon,
  Video: CinematographyIcon,
  Smile: PhotoboothsIcon,
};
