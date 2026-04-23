"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BookOpen, TerminalSquare, Users, Blocks, Gauge } from "lucide-react";

function TiltCard({ children, className = "", style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:bg-white/50 transition-colors duration-300 ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full w-full p-6 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

// Geometric flower logo for the center card
function CenterLogo() {
  return (
    <div className="relative w-32 h-32 mx-auto my-8 flex items-center justify-center">
      <div className="absolute w-16 h-16 border-[12px] border-[#d9482b] rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-4"></div>
      <div className="absolute w-16 h-16 border-[12px] border-[#d9482b] rounded-full bottom-0 left-1/2 -translate-x-1/2 translate-y-4"></div>
      <div className="absolute w-16 h-16 border-[12px] border-[#d9482b] rounded-full left-0 top-1/2 -translate-y-1/2 -translate-x-4"></div>
      <div className="absolute w-16 h-16 border-[12px] border-[#d9482b] rounded-full right-0 top-1/2 -translate-y-1/2 translate-x-4"></div>
      <div className="absolute w-8 h-8 bg-[#d9482b] rounded-full"></div>
    </div>
  );
}

// Half-gauge component
function HalfGauge({ color, value, label }: { color: string, value: number, label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-12 overflow-hidden mb-2">
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-[8px] border-gray-200 border-b-transparent border-r-transparent transform -rotate-45"></div>
        <div 
          className="absolute top-0 left-0 w-24 h-24 rounded-full border-[8px] border-b-transparent border-r-transparent transform"
          style={{ borderColor: color, transform: `rotate(${-135 + (value / 100) * 180}deg)` }}
        ></div>
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-10 bg-black origin-bottom rounded-full"
          style={{ transform: `translateX(-50%) rotate(${-90 + (value / 100) * 180}deg)` }}
        ></div>
        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-black rounded-full -translate-x-1/2 translate-y-1.5"></div>
      </div>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </div>
  );
}

export default function HeroUI() {
  return (
    <div className="relative z-10 w-full h-screen overflow-hidden pointer-events-none text-black">
      <div className="w-full h-full relative pointer-events-auto max-w-[1600px] mx-auto">
        
        {/* Top Left Logo */}
        <div className="absolute top-8 left-10 z-50">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Expresskit</h2>
        </div>

        {/* Floating Cards */}
        {/* Card 1: Getting Started Guide */}
        <TiltCard style={{ left: '8%', top: '22%', width: '220px', height: '220px' }} className="items-center justify-center text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-[#f28e2c] to-[#d9482b] rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/30">
            <BookOpen size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">Getting Started<br/>Guide</h3>
        </TiltCard>

        {/* Card 2: Reference API */}
        <TiltCard style={{ left: '26%', top: '38%', width: '240px', height: '240px' }} className="items-center text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-[#f28e2c] to-[#d9482b] rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-500/30">
            <TerminalSquare size={28} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Reference API</h3>
          <p className="text-xs text-gray-600">Modular API Integration.<br/>Performance API.</p>
        </TiltCard>

        {/* Card 3: Community Hub */}
        <TiltCard style={{ left: '12%', bottom: '28%', width: '280px', height: '160px' }} className="justify-center">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Community Hub</h3>
          </div>
          <p className="text-xs text-gray-600 pl-16">Modules and plugins. Dedicated<br/>support. Real-time notifications.</p>
        </TiltCard>

        {/* Card 4: Center Exp-Auth */}
        <TiltCard style={{ left: '50%', top: '15%', transform: 'translateX(-50%)', width: '380px', height: '420px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} className="items-center text-center border-white/40 shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
          <h3 className="text-xl font-semibold text-gray-800 mt-2">Exp-Auth</h3>
          <CenterLogo />
          <div className="mt-auto bg-black/5 p-4 rounded-xl backdrop-blur-sm w-full">
            <p className="text-sm font-medium text-gray-800">The Complete 3D Documentation for<br/>Expresskit. Build Smarter.</p>
          </div>
        </TiltCard>

        {/* Card 5: Performance Metrics */}
        <TiltCard style={{ right: '10%', top: '22%', width: '360px', height: '220px' }}>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="flex justify-around items-end h-full pb-4">
            <HalfGauge color="#4ade80" value={75} label="Gauge" />
            <HalfGauge color="#f87171" value={45} label="Gauge" />
          </div>
        </TiltCard>

        {/* Card 6: Modules Overview */}
        <TiltCard style={{ right: '12%', bottom: '28%', width: '300px', height: '180px' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f28e2c] to-[#d9482b] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Blocks size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Modules Overview</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Modular API Integration. Perfect<br/>State. Real-Time Webhooks.<br/>Dedicated support.
          </p>
        </TiltCard>

        {/* Bottom Small Text Left */}
        <div className="absolute bottom-12 left-10 max-w-[200px] z-20">
          <p className="text-xs text-gray-600">The Complete 3D Documentation for Expresskit.<br/>Build Smarter.</p>
        </div>

        {/* Bottom Small Text Right */}
        <div className="absolute bottom-12 right-10 max-w-[250px] text-right z-20">
          <p className="text-xs text-gray-600">Modular API Integration. Perfect State.<br/>Real-Time Webhooks. Dedicated support.</p>
        </div>

        {/* Bottom Center Huge Title */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center z-10">
          <h1 
            className="text-[8vw] leading-none font-black text-gray-900 tracking-tighter"
            style={{ 
              fontFamily: '"Arial Black", Impact, sans-serif',
              transform: 'scaleY(1.1)',
              WebkitTextStroke: '2px rgba(0,0,0,0.1)',
              textShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            YOUR KIT, UNPACKED
          </h1>
        </div>

      </div>
    </div>
  );
}
