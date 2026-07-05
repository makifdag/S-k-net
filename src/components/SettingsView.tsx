import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Clock, 
  Bell, 
  Check, 
  Info, 
  Play, 
  Pause,
  Map,
  Shield,
  Moon,
  Smartphone,
  Compass,
  ChevronDown
} from 'lucide-react';
import { LocationData, PrayerTimes, Tab, PrayerNotificationSettings } from '../types';
import { getHijriDate } from '../utils';

interface SettingsViewProps {
  currentLocation: LocationData;
  prayerTimes: PrayerTimes;
  onNavigate: (tab: Tab) => void;
  onOpenLocationSelector: () => void;
}

export default function SettingsView({ currentLocation, prayerTimes, onNavigate, onOpenLocationSelector }: SettingsViewProps) {
  const [notificationSettings, setNotificationSettings] = useState<PrayerNotificationSettings>({
    Fajr: { adhanEnabled: true, reminder15m: false },
    Dhuhr: { adhanEnabled: true, reminder15m: true },
    Asr: { adhanEnabled: true, reminder15m: false },
    Maghrib: { adhanEnabled: true, reminder15m: true },
    Isha: { adhanEnabled: true, reminder15m: false }
  });

  const [activeAdhanVoice, setActiveAdhanVoice] = useState<'makkah' | 'madinah' | 'istanbul'>('makkah');
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<number>(30);
  const [autoSilent, setAutoSilent] = useState<boolean>(true);
  const [autoLocation, setAutoLocation] = useState<boolean>(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscNode, setOscNode] = useState<OscillatorNode | null>(null);

  // Preview Progress Bar animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingPreview) {
      timer = setInterval(() => {
        setPreviewProgress(prev => {
          if (prev >= 100) {
            setIsPlayingPreview(false);
            stopAudioSynth();
            return 0;
          }
          return prev + 1.5;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlayingPreview]);

  const handleToggleAdhan = (prayerKey: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [prayerKey]: {
        ...prev[prayerKey],
        adhanEnabled: !prev[prayerKey].adhanEnabled
      }
    }));
  };

  const handleToggle15m = (prayerKey: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [prayerKey]: {
        ...prev[prayerKey],
        reminder15m: !prev[prayerKey].reminder15m
      }
    }));
  };

  // Synthesize soft, ambient bell/spiritual tones using Web Audio API for interactive test feedback
  const startAudioSynth = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Let's create a soft bell sequence
      let time = ctx.currentTime;
      const pitches = activeAdhanVoice === 'makkah' 
        ? [293.66, 329.63, 392.00, 440.00] // Makkah: D4, E4, G4, A4 (peaceful major)
        : activeAdhanVoice === 'madinah'
          ? [329.63, 349.23, 440.00, 493.88] // Madinah: E4, F4, A4, B4 (phrygian)
          : [261.63, 311.13, 392.00, 466.16]; // Istanbul: C4, Eb4, G4, Bb4 (serene minor)
      
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0, time);
      
      // Loop sequence
      for (let i = 0; i < 40; i++) {
        const pitch = pitches[i % pitches.length];
        gain.gain.linearRampToValueAtTime(0.06, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
        osc.frequency.setValueAtTime(pitch, time);
        time += 1.5;
      }
      
      osc.start();
      setOscNode(osc);
    } catch (err) {
      console.warn('Audio synthesis support missing or blocked:', err);
    }
  };

  const stopAudioSynth = () => {
    if (oscNode) {
      try { oscNode.stop(); } catch(e){}
      setOscNode(null);
    }
    if (audioCtx) {
      try { audioCtx.close(); } catch(e){}
      setAudioCtx(null);
    }
  };

  const handleTogglePreview = () => {
    if (isPlayingPreview) {
      setIsPlayingPreview(false);
      stopAudioSynth();
    } else {
      setIsPlayingPreview(true);
      setPreviewProgress(0);
      startAudioSynth();
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => stopAudioSynth();
  }, []);

  const getVoiceLabel = () => {
    switch (activeAdhanVoice) {
      case 'makkah': return 'Mekke (Makkah Al-Haram)';
      case 'madinah': return 'Medine (Madinah Al-Nabawi)';
      case 'istanbul': return 'İstanbul (Makamlı Ezan)';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center px-6 h-16 max-w-full">
        <button 
          onClick={onOpenLocationSelector}
          className="flex items-center gap-2 text-emerald-600 hover:opacity-80 active:scale-95 transition-all text-left"
          id="settings-location-selector-btn"
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
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Ayarlar
        </span>
      </header>

      {/* Section: Notifications */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-extrabold text-base text-emerald-950">
            Namaz Vakit Bildirimleri
          </h2>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full">
            Ezan & Hatırlatıcı
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Detailed Example: Fajr (Imsak) Card */}
          <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-sans font-bold text-xs text-emerald-600 tracking-wider uppercase">
                  SABAH VAKTİ (DAWN)
                </p>
                <h3 className="font-sans font-black text-xl text-emerald-950">
                  Sabah (Fajr)
                </h3>
              </div>
              <span className="font-sans font-black text-3xl text-emerald-950/15 select-none">
                {prayerTimes.Fajr}
              </span>
            </div>

            <div className="flex gap-4 border-t border-gray-100 pt-4">
              {/* Toggle 1: Adhan sound */}
              <div className="flex-1 flex items-center justify-between bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-500/5">
                <span className="font-sans font-bold text-xs text-emerald-950 flex items-center gap-2">
                  <Volume2 size={14} className="text-emerald-600" />
                  Ezan Sesi
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.Fajr.adhanEnabled}
                    onChange={() => handleToggleAdhan('Fajr')}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Toggle 2: early reminder */}
              <div className="flex-1 flex items-center justify-between bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-500/5">
                <span className="font-sans font-bold text-xs text-emerald-950 flex items-center gap-2">
                  <Clock size={14} className="text-emerald-600" />
                  15dk Önce
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.Fajr.reminder15m}
                    onChange={() => handleToggle15m('Fajr')}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Other Prayers - Compact Version */}
          <div className="space-y-2">
            {['Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => {
              const label = key === 'Dhuhr' ? 'Öğle (Dhuhr)' : key === 'Asr' ? 'İkindi (Asr)' : key === 'Maghrib' ? 'Akşam (Maghrib)' : 'Yatsı (Isha)';
              const time = (prayerTimes as any)[key];
              const isAdhan = notificationSettings[key]?.adhanEnabled;
              const is15m = notificationSettings[key]?.reminder15m;

              return (
                <div key={key} className="glass-card rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-emerald-950">{label}</h4>
                      <p className="text-[10px] font-bold text-emerald-600/70 tracking-widest">{time}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleToggleAdhan(key)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isAdhan ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'
                      }`}
                      title="Ezan Sesi"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleToggle15m(key)}
                      className={`p-1.5 rounded-lg transition-all ${
                        is15m ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'
                      }`}
                      title="15 Dakika Hatırlatıcı"
                    >
                      <Clock size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section: Adhan Voice */}
      <section className="space-y-4">
        <h2 className="font-sans font-extrabold text-base text-emerald-950">Ezan Sesi Tonu</h2>
        
        <div className="glass-card rounded-2xl p-1.5 flex gap-1.5 border border-gray-100 shadow-sm">
          {(['makkah', 'madinah', 'istanbul'] as const).map((voice) => (
            <button 
              key={voice}
              onClick={() => {
                setActiveAdhanVoice(voice);
                if (isPlayingPreview) {
                  // Restart synth with new tone
                  stopAudioSynth();
                  setTimeout(() => startAudioSynth(), 100);
                }
              }}
              className={`flex-1 py-3 px-2 rounded-xl font-sans font-extrabold text-xs tracking-wider transition-all uppercase ${
                activeAdhanVoice === voice 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {voice === 'makkah' ? 'MEKKE' : voice === 'madinah' ? 'MEDİNE' : 'İSTANBUL'}
            </button>
          ))}
        </div>

        {/* Audio Preview Player */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-dashed border-emerald-600/20 shadow-sm bg-emerald-50/10">
          <button 
            onClick={handleTogglePreview}
            className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-500 text-emerald-950 flex items-center justify-center shadow-md active:scale-90 transition-transform flex-shrink-0"
            aria-label="Ezan Preview Çal/Durdur"
          >
            {isPlayingPreview ? <Pause size={20} className="fill-emerald-950 stroke-emerald-950" /> : <Play size={20} className="ml-0.5 fill-emerald-950 stroke-emerald-950" />}
          </button>

          <div className="flex-1">
            <p className="font-sans font-bold text-xs text-emerald-950">
              Ses Örniği: {getVoiceLabel()}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
              {isPlayingPreview ? 'Önizleme ses sentezi çalınıyor...' : 'Ezan sesini test etmek için çalın.'}
            </p>
            
            <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2.5 overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-600 rounded-full"
                animate={{ width: `${previewProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Global Settings */}
      <section className="space-y-4">
        <h2 className="font-sans font-extrabold text-base text-emerald-950">Cihaz & Senkronizasyon</h2>
        
        <div className="glass-card rounded-2xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-100">
          {/* Item 1 */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Smartphone size={18} />
              </span>
              <div>
                <p className="font-sans font-bold text-sm text-emerald-950">Namazda Otomatik Sessiz</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Ezan okunurken cihazı 20 dakika sessize al.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoSilent}
                onChange={() => setAutoSilent(!autoSilent)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Item 2 */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <MapPin size={18} />
              </span>
              <div>
                <p className="font-sans font-bold text-sm text-emerald-950">Otomatik Konum Güncelleme</p>
                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">GPS hareketlerine bağlı olarak vakitleri otomatik senkronize et.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoLocation}
                onChange={() => setAutoLocation(!autoLocation)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Aesthetic Card: Daily Inspiration */}
      <section className="pt-2">
        <div className="glass-card rounded-2xl p-6 text-center border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors pointer-events-none"></div>
          <p className="font-serif text-emerald-950 text-base italic leading-relaxed">
            &ldquo;Namaz, müminin kalbine huzur ve ferahlık veren manevi sığınaktır. Sükûnet içinde kılınan her vakit, ebedi mutluluğun anahtarıdır.&rdquo;
          </p>
          <div className="h-0.5 w-12 bg-emerald-600/20 mx-auto mt-4 rounded"></div>
        </div>
      </section>
    </div>
  );
}
