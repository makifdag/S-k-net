import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Sun, 
  Sunset, 
  Moon, 
  Bell, 
  BellRing, 
  Share2, 
  Sparkles, 
  Compass, 
  BookOpen, 
  ChevronDown,
  Volume2,
  VolumeX
} from 'lucide-react';
import { LocationData, PrayerTimes, Tab } from '../types';
import { DAILY_VERSES, HOTLINK_IMAGES } from '../data';
import { timeStrToMinutes, getHijriDate } from '../utils';

interface HomeViewProps {
  currentLocation: LocationData;
  prayerTimes: PrayerTimes;
  onNavigate: (tab: Tab) => void;
  onOpenLocationSelector: () => void;
}

export default function HomeView({
  currentLocation,
  prayerTimes,
  onNavigate,
  onOpenLocationSelector
}: HomeViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showDuasModal, setShowDuasModal] = useState(false);

  // Keep track of time and countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update daily verse on a timer or load
  useEffect(() => {
    const day = new Date().getDate();
    setActiveVerseIndex(day % DAILY_VERSES.length);
  }, []);

  // Calculate current active prayer & next prayer
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
  
  const prayerList = [
    { name: 'Fajr', label: 'İmsak (Fajr)', time: prayerTimes.Fajr, icon: Sunset },
    { name: 'Sunrise', label: 'Güneş (Sunrise)', time: prayerTimes.Sunrise, icon: Sun },
    { name: 'Dhuhr', label: 'Öğle (Dhuhr)', time: prayerTimes.Dhuhr, icon: Sun },
    { name: 'Asr', label: 'İkindi (Asr)', time: prayerTimes.Asr, icon: Sun },
    { name: 'Maghrib', label: 'Akşam (Maghrib)', time: prayerTimes.Maghrib, icon: Sunset },
    { name: 'Isha', label: 'Yatsı (Isha)', time: prayerTimes.Isha, icon: Moon },
  ];

  // Map schedule items to minutes
  const prayerMinutes = prayerList.map(p => ({
    ...p,
    minutes: timeStrToMinutes(p.time)
  }));

  // Determine current active and next prayer
  let currentIdx = prayerMinutes.length - 1; // Default to Isha if before Fajr of next day
  let nextIdx = 0; // Default to Fajr

  for (let i = 0; i < prayerMinutes.length; i++) {
    if (nowMinutes >= prayerMinutes[i].minutes) {
      currentIdx = i;
      nextIdx = (i + 1) % prayerMinutes.length;
    }
  }

  // Handle case where we are before the first prayer (Fajr)
  if (nowMinutes < prayerMinutes[0].minutes) {
    currentIdx = prayerMinutes.length - 1; // Isha of previous day is active
    nextIdx = 0; // Fajr is next
  }

  const nextPrayer = prayerMinutes[nextIdx];
  const currentPrayer = prayerMinutes[currentIdx];

  // Calculate time remaining until next prayer
  let diffMinutes = nextPrayer.minutes - nowMinutes;
  if (diffMinutes < 0) {
    // Next prayer is tomorrow
    diffMinutes += 24 * 60;
  }

  const remainingHours = Math.floor(diffMinutes / 60);
  const remainingMins = Math.floor(diffMinutes % 60);
  const remainingSecs = Math.floor((diffMinutes * 60) % 60);

  const countdownStr = `${remainingHours.toString().padStart(2, '0')}:${remainingMins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  // Calculate progress percentage (how much time has elapsed in the current prayer window)
  const currentPrayerStart = currentPrayer.minutes;
  let currentPrayerEnd = nextPrayer.minutes;
  if (currentPrayerEnd < currentPrayerStart) {
    currentPrayerEnd += 24 * 60;
  }
  
  let elapsed = nowMinutes - currentPrayerStart;
  if (elapsed < 0) {
    elapsed += 24 * 60;
  }
  
  const totalDuration = currentPrayerEnd - currentPrayerStart;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  // Hijri representation
  const hijriStr = getHijriDate(currentTime);
  const verse = DAILY_VERSES[activeVerseIndex];

  const handleShare = () => {
    const textToCopy = `${verse.text}\n— ${verse.surah}\n\nSükûnet Uygulaması`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Static list of Duas for the Daily Duas modal
  const popularDuas = [
    { title: "Namaz Sonrası Tesbihat Duası", arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", meaning: "Allah'ım! Sen selamsın, selamet de ancak Sendendir. Ey Celal ve İkram Sahibi! Sen yücesin." },
    { title: "Sıkıntı ve Zorluk Anında Okunacak Dua", arabic: "لا إِلَهَ إِلا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لا إِلَهَ إِلا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ", meaning: "Azîm ve Halîm olan Allah'tan başka ilah yoktur. Büyük Arş'ın sahibi Allah'tan başka ilah yoktur." },
    { title: "Şükür ve Hamd Duası", arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ", meaning: "Lütfuyla güzel işlerin tamamlandığı Allah'a hamdolsun." },
    { title: "Tövbe ve Bağışlanma (Seyyidül İstiğfar)", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّA أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ", meaning: "Allah'ım Sen benim Rabbimsin. Senden başka ilah yoktur. Beni Sen yarattın, ben Senin kulunum." }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center px-6 h-16 max-w-full">
        <button 
          onClick={onOpenLocationSelector}
          className="flex items-center gap-2 text-emerald-600 hover:opacity-80 active:scale-95 transition-all text-left"
          id="location-selector-btn"
        >
          <MapPin size={20} className="stroke-2" />
          <div className="flex items-center gap-1">
            <h1 className="font-sans font-bold text-lg tracking-tight text-emerald-950">
              {currentLocation.name}, {currentLocation.country === 'TÜRKİYE' ? 'TR' : 'Global'}
            </h1>
            <ChevronDown size={14} className="mt-0.5 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full ml-1">
            {hijriStr}
          </span>
        </button>

        <button 
          onClick={onOpenLocationSelector}
          className="p-2 text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all rounded-full"
          aria-label="Takvim Seç"
        >
          <Calendar size={20} />
        </button>
      </header>

      {/* Hero Section: Countdown Card */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative pt-6"
      >
        <div className="active-prayer-gradient rounded-3xl p-6 shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden min-h-[200px] flex flex-col justify-center">
          {/* Subtle Arabesque BG */}
          <div className="absolute inset-0 arabesque-pattern opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 opacity-90">
              <Clock size={16} className="text-emerald-200" />
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-emerald-200">
                Sıradaki Vakit
              </span>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-sans font-bold text-3xl tracking-tight text-white">
                  {nextPrayer.label.split(' ')[0]}
                </h2>
                <div className="font-sans font-extrabold text-5xl tracking-tight text-white mt-1 tabular-nums">
                  {countdownStr}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle 
                    cx="40" 
                    cy="40" 
                    fill="transparent" 
                    opacity="0.15" 
                    r="34" 
                    stroke="white" 
                    strokeWidth="3.5"
                  />
                  <motion.circle 
                    cx="40" 
                    cy="40" 
                    fill="transparent" 
                    r="34" 
                    stroke="#fed65b" 
                    strokeWidth="3.5"
                    strokeDasharray={213.6}
                    initial={{ strokeDashoffset: 213.6 }}
                    animate={{ strokeDashoffset: 213.6 - (213.6 * progressPercent) / 100 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-sans font-extrabold text-xs text-amber-300">
                  %{progressPercent}
                </span>
              </div>
            </div>

            <p className="text-emerald-200 text-sm font-medium">
              Bugün {prayerTimes.Maghrib} saatinde akşam ezanı okunacak.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Daily Prayer Times List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-sans font-extrabold text-lg text-emerald-950">Günlük Vakitler</h3>
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-emerald-600">
            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {prayerList.map((prayer, idx) => {
            const isActive = idx === currentIdx;
            const PrayerIcon = prayer.icon;

            return (
              <motion.div 
                key={prayer.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-2xl flex justify-between items-center transition-all ${
                  isActive 
                    ? 'bg-emerald-50 border-2 border-emerald-600/30 ring-4 ring-emerald-500/5' 
                    : 'glass-card border border-gray-100 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <PrayerIcon size={20} className={isActive ? 'stroke-2' : ''} />
                  </div>
                  <div>
                    <p className={`font-sans text-xs tracking-wider uppercase ${
                      isActive ? 'text-emerald-700 font-bold' : 'text-gray-400 font-medium'
                    }`}>
                      {prayer.label}
                    </p>
                    <p className={`font-sans text-lg ${
                      isActive ? 'font-black text-emerald-900' : 'font-semibold text-gray-700'
                    }`}>
                      {prayer.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  {prayer.name !== 'Sunrise' ? (
                    <Bell className={`w-5 h-5 ${isActive ? 'text-emerald-600 fill-emerald-100' : 'text-gray-300'}`} />
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Daily Verse / Reflection Card */}
      <section>
        <div className="relative glass-card rounded-3xl overflow-hidden shadow-sm p-6 border border-gray-100">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles size={120} className="text-emerald-950" />
          </div>

          <div className="relative space-y-4 z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 fill-amber-300" />
              <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-emerald-800">
                Günün Ayeti
              </h4>
            </div>

            <blockquote className="font-serif text-lg italic text-emerald-950 leading-relaxed">
              {verse.text}
            </blockquote>
            
            <p className="font-serif text-sm italic text-emerald-800/80 leading-relaxed border-l-2 border-emerald-200 pl-3">
              {verse.translation}
            </p>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <cite className="block font-sans font-bold text-xs text-emerald-600 not-italic">
                — {verse.surah}
              </cite>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 font-semibold text-xs py-1.5 px-3 rounded-full hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <Share2 size={14} />
                <span>{copied ? 'Kopyalandı!' : 'Ayet Paylaş'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bento Grid */}
      <section className="grid grid-cols-2 gap-4 pb-12">
        <div 
          onClick={() => onNavigate('qibla')}
          className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 hover:bg-emerald-50/50 transition-colors cursor-pointer group border border-gray-100 tonal-glow"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Compass size={24} className="stroke-[1.5]" />
          </div>
          <div>
            <span className="font-sans font-bold text-sm text-emerald-950 block">Kıble Pusulası</span>
            <span className="text-[10px] font-bold text-emerald-600/70 tracking-widest uppercase mt-0.5 block">Qibla Finder</span>
          </div>
        </div>

        <div 
          onClick={() => setShowDuasModal(true)}
          className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 hover:bg-emerald-50/50 transition-colors cursor-pointer group border border-gray-100 tonal-glow"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <BookOpen size={24} className="stroke-[1.5]" />
          </div>
          <div>
            <span className="font-sans font-bold text-sm text-emerald-950 block">Günün Duaları</span>
            <span className="text-[10px] font-bold text-emerald-600/70 tracking-widest uppercase mt-0.5 block">Daily Duas</span>
          </div>
        </div>
      </section>

      {/* Daily Duas Modal */}
      <AnimatePresence>
        {showDuasModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-emerald-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[32px] w-full max-w-lg max-h-[85vh] overflow-y-auto no-scrollbar p-6 shadow-2xl relative"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-sans font-extrabold text-2xl text-emerald-950">Günün Duaları</h3>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">Manevi Yakınlık ve Sükûnet Kapıları</p>
                </div>
                <button 
                  onClick={() => setShowDuasModal(false)}
                  className="bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full px-4 py-2 font-bold text-xs"
                >
                  Kapat
                </button>
              </div>

              <div className="space-y-6 pb-8">
                {popularDuas.map((dua, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl border border-emerald-100/50 space-y-3">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block">
                      Dua #{idx + 1}: {dua.title}
                    </span>
                    
                    <p className="text-right text-2xl font-serif font-bold text-emerald-900 leading-loose" dir="rtl">
                      {dua.arabic}
                    </p>

                    <p className="font-sans text-sm text-gray-600 italic border-l-2 border-amber-300 pl-3 leading-relaxed">
                      <strong>Anlamı:</strong> {dua.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
