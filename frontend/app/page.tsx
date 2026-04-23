"use client";

import dynamic from 'next/dynamic';
import HeroUI from './components/HeroUI';

// Dynamically import Three.js background to avoid SSR issues
const ThreeBackground = dynamic(() => import('./components/ThreeBackground'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 w-full h-full -z-10 bg-[#f4f5f7]" />
});

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#f4f5f7] overflow-hidden text-foreground selection:bg-[#d9482b] selection:text-white cloud-bg">
      {/* 3D Background Layer */}
      <ThreeBackground />
      
      {/* UI Overlay Layer */}
      <HeroUI />
    </main>
  );
}
