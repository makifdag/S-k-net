import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Plus, 
  Bookmark, 
  Trash2,
  Heart,
  ChevronDown
} from 'lucide-react';
import { LocationData, DhikrItem, Tab } from '../types';
import { POPULAR_DHIKRS } from '../data';
import { getHijriDate } from '../utils';

interface DhikrViewProps {
  currentLocation: LocationData;
  onNavigate: (tab: Tab) => void;
  onOpenLocationSelector: () => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function DhikrView({ currentLocation, onNavigate, onOpenLocationSelector }: DhikrViewProps) {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [activeDhikr, setActiveDhikr] = useState<DhikrItem>(POPULAR_DHIKRS[0]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [totalDhikrs, setTotalDhikrs] = useState<number>(0);

  // Load persistence totals on mount
  useEffect(() => {
    const savedTotal = localStorage.getItem('sukunet_total_dhikrs');
    if (savedTotal) {
      setTotalDhikrs(parseInt(savedTotal));
    }
  }, []);

  // Update circular progress circumference calculations
  const radius = 130;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (Math.min(count, target) / target) * circumference;

  const handleTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Increment Count
    const nextCount = count + 1;
    setCount(nextCount);
    
    // Play subtle click sound (simulated with AudioContext so it works instantly without asset loads!)
    if (soundEnabled && window.AudioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Short wooden click tone
        osc.frequency.setValueAtTime(nextCount % target === 0 ? 523.25 : 329.63, ctx.currentTime); // C5 on target completion, E4 on tap
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch (err) {
        console.warn('AudioContext playback error', err);
      }
    }

    // Trigger haptic rumble simulation if supported
    if (navigator.vibrate) {
      if (nextCount % target === 0) {
        navigator.vibrate([100, 50, 100]); // Dual pulse on target
      } else {
        navigator.vibrate(15); // Light tap
      }
    }

    // Update total count
    const nextTotal = totalDhikrs + 1;
    setTotalDhikrs(nextTotal);
    localStorage.setItem('sukunet_total_dhikrs', nextTotal.toString());

    // Generate Ripple Interaction Wave
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y
    };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const handleReset = () => {
    setCount(0);
  };

  const handleSelectDhikr = (item: DhikrItem) => {
    setActiveDhikr(item);
    setCount(0);
    // Smooth scroll to top of viewport
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center px-6 h-16 max-w-full">
        <button 
          onClick={onOpenLocationSelector}
          className="flex items-center gap-2 text-emerald-600 hover:opacity-80 active:scale-95 transition-all text-left"
          id="dhikr-location-selector-btn"
        >
          <MapPin size={20} className="stroke-2" />
          <div className="flex items-center gap-1">
            <h1 className="font-sans font-bold text-lg tracking-tight text-emerald-950">
              {currentLocation.name}, {currentLocation.country === 'TÜRKİYE' ? 'TR' : 'Global'}
            </h1>
            <ChevronDown size={14} className="mt-0.5 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full ml-1 hidden sm:inline-block">
            {getHijriDate()}
          </span>
        </button>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            soundEnabled ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'
          }`}
          aria-label="Tık Sesi Aç/Kapat"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      {/* Main Counter Graphic & Progress Ring */}
      <section className="flex flex-col items-center pt-4">
        <div className="relative w-76 h-76 flex items-center justify-center">
          {/* Circular SVG Progress Meter */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Background Circle Track */}
            <circle 
              className="text-gray-100/80 stroke-current" 
              cx="152" 
              cy="152" 
              fill="transparent" 
              r={radius} 
              strokeWidth="6"
            />
            {/* Progress Bar Stroke */}
            <circle 
              className="text-emerald-600 stroke-current transition-all duration-150 ease-out" 
              cx="152" 
              cy="152" 
              fill="transparent" 
              r={radius} 
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '152px 152px'
              }}
            />
          </svg>

          {/* The Main Tap Button with Glassmorphic visual style */}
          <button 
            onClick={handleTap}
            className="w-64 h-64 rounded-full glass-card relative overflow-hidden flex flex-col items-center justify-center focus:outline-none transition-all duration-100 active:scale-95 group shadow-lg shadow-emerald-900/5 select-none"
            style={{
              boxShadow: count >= target ? '0 0 35px rgba(254, 214, 91, 0.3)' : ''
            }}
          >
            {/* Ambient Arabesque mask pattern */}
            <div className="absolute inset-0 arabesque-pattern rounded-full opacity-5 pointer-events-none"></div>

            {/* Tap count digits */}
            <span className="font-sans font-black text-6xl tracking-tight text-emerald-950 block tabular-nums">
              {count}
            </span>
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-emerald-600 mt-1 block">
              ZİKİR (DHIKR)
            </span>

            {/* Display total dhikrs below inside bubble */}
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full mt-3 block">
              TOPLAM: {totalDhikrs}
            </span>

            {/* Ripple Wave Render Container */}
            {ripples.map(ripple => (
              <span 
                key={ripple.id}
                className="absolute bg-emerald-500/10 rounded-full animate-ping pointer-events-none"
                style={{
                  left: ripple.x - 50,
                  top: ripple.y - 50,
                  width: 100,
                  height: 100
                }}
              />
            ))}
          </button>
        </div>

        {/* Targets & Reset Bar */}
        <div className="mt-8 glass-card rounded-2xl p-3 flex gap-4 items-center justify-between border border-gray-100 shadow-sm w-full max-w-sm">
          <div className="flex items-center gap-2 pl-1.5">
            <span className="font-sans font-bold text-xs text-emerald-900/60 uppercase tracking-wider">
              HEDEF:
            </span>
            <div className="flex gap-1.5">
              {[33, 99, 1000].map(val => (
                <button 
                  key={val}
                  onClick={() => setTarget(val)}
                  className={`px-3.5 py-1 rounded-full text-xs font-sans font-bold transition-all ${
                    target === val 
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/10' 
                      : 'text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  {val === 1000 ? '1K' : val}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleReset}
            className="bg-red-50 text-red-600 hover:bg-red-100 p-2.5 rounded-full transition-all active:scale-90"
            title="Sıfırla"
          >
            <RotateCcw size={16} className="stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* Target Completed Congratulation Popup */}
      <AnimatePresence>
        {count >= target && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-amber-500 text-emerald-950 p-4 rounded-2xl flex items-center justify-between gap-3 shadow border border-amber-300"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="animate-spin text-emerald-950 flex-shrink-0" size={22} />
              <div>
                <p className="font-sans font-black text-sm text-emerald-950">Hedefe Ulaştınız! (Target Reached)</p>
                <p className="text-xs text-emerald-950/80 font-medium mt-0.5">Tesbihatı tamamladınız. Allah kabul etsin.</p>
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="bg-emerald-950 text-white font-sans font-bold text-xs px-4 py-2 rounded-full hover:bg-emerald-900 shadow active:scale-95 transition-all"
            >
              Yeniden Başla
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Tasbih Card Details */}
      <section className="glass-card rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-bold text-xs text-emerald-800 tracking-widest uppercase">
              SEÇİLİ TESBİH (CURRENT TASBIH)
            </h2>
            <Heart size={16} className="text-amber-500 fill-amber-300" />
          </div>

          <p className="text-3xl text-right font-serif font-black text-emerald-950 leading-loose" dir="rtl">
            {activeDhikr.arabic}
          </p>

          <div className="border-t border-gray-100/50 pt-3">
            <p className="font-serif text-lg font-bold italic text-emerald-800">
              {activeDhikr.transliteration}
            </p>
            <p className="font-sans text-sm text-gray-500 mt-1 leading-relaxed">
              &ldquo;{activeDhikr.meaning}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Popular Dhikrs Bento Grid */}
      <section className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-emerald-600/70 tracking-widest uppercase pl-1.5">
          Sık Kullanılan Tesbihatlar (Popular Dhikrs)
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {POPULAR_DHIKRS.map((item, idx) => {
            const isCurrent = activeDhikr.transliteration === item.transliteration;

            return (
              <div 
                key={idx}
                onClick={() => handleSelectDhikr(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                  isCurrent 
                    ? 'bg-emerald-50 border-emerald-600/20 shadow-sm' 
                    : 'glass-card border-gray-100 hover:bg-gray-50/50'
                }`}
              >
                <div className="space-y-1">
                  <p className={`font-sans text-base ${isCurrent ? 'font-black text-emerald-950' : 'font-bold text-gray-700'}`}>
                    {item.transliteration}
                  </p>
                  <p className="text-xs text-gray-400 max-w-xs truncate">
                    {item.meaning}
                  </p>
                </div>

                <span className={`text-xl font-serif font-black ${
                  isCurrent ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-800'
                }`} dir="rtl">
                  {item.arabic.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
