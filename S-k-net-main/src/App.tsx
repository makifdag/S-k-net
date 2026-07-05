import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Compass, 
  Fingerprint, 
  Settings as SettingsIcon,
  Calendar
} from 'lucide-react';

import { Tab, LocationData, PrayerTimes } from './types';
import { POPULAR_CITIES } from './data';
import { calculatePrayerTimes, getHijriDate } from './utils';

// Views
import HomeView from './components/HomeView';
import QiblaView from './components/QiblaView';
import DhikrView from './components/DhikrView';
import SettingsView from './components/SettingsView';
import SelectLocationView from './components/SelectLocationView';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentLocation, setCurrentLocation] = useState<LocationData>(() => {
    const savedLoc = localStorage.getItem('sukunet_saved_location');
    if (savedLoc) {
      try {
        return JSON.parse(savedLoc);
      } catch (err) {
        console.error('Error parsing saved location:', err);
      }
    }
    return POPULAR_CITIES[0];
  });
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(() => {
    const savedLoc = localStorage.getItem('sukunet_saved_location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        return calculatePrayerTimes(parsed.lat, parsed.lng);
      } catch (err) {
        console.error('Error parsing saved location:', err);
      }
    }
    return calculatePrayerTimes(POPULAR_CITIES[0].lat, POPULAR_CITIES[0].lng);
  });

  // Recalculate prayer times whenever active location changes
  useEffect(() => {
    const times = calculatePrayerTimes(currentLocation.lat, currentLocation.lng);
    setPrayerTimes(times);
  }, [currentLocation]);

  const handleSelectLocation = (location: LocationData) => {
    setCurrentLocation(location);
    localStorage.setItem('sukunet_saved_location', JSON.stringify(location));
  };

  // Render current tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            currentLocation={currentLocation}
            prayerTimes={prayerTimes}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLocationSelector={() => setShowLocationModal(true)}
          />
        );
      case 'qibla':
        return (
          <QiblaView 
            currentLocation={currentLocation}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLocationSelector={() => setShowLocationModal(true)}
          />
        );
      case 'dhikr':
        return (
          <DhikrView 
            currentLocation={currentLocation}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLocationSelector={() => setShowLocationModal(true)}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            currentLocation={currentLocation}
            prayerTimes={prayerTimes}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLocationSelector={() => setShowLocationModal(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20 text-gray-950 font-sans relative flex flex-col justify-between">
      {/* Dynamic Background subtle grid dot pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden z-0">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(#064e3b 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
      </div>

      {/* Main Container Content */}
      <main className="w-full max-w-lg mx-auto px-6 pt-20 pb-28 relative z-10 flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Translucent Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white/70 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-4 pb-6 pt-3 shadow-lg shadow-emerald-950/5 rounded-t-[24px]">
        {/* Navigation Action Buttons */}
        {[
          { id: 'home' as Tab, label: 'Ana Sayfa', icon: HomeIcon },
          { id: 'qibla' as Tab, label: 'Kıble', icon: Compass },
          { id: 'dhikr' as Tab, label: 'Zikirmatik', icon: Fingerprint },
          { id: 'settings' as Tab, label: 'Ayarlar', icon: SettingsIcon }
        ].map((btn) => {
          const isSelected = activeTab === btn.id;
          const Icon = btn.icon;

          return (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all relative ${
                isSelected 
                  ? 'text-emerald-700 bg-emerald-600/10 font-bold scale-105' 
                  : 'text-gray-400 hover:text-emerald-800'
              }`}
            >
              <Icon 
                size={22} 
                className={`transition-transform duration-200 ${
                  isSelected ? 'stroke-[2.5] scale-110' : 'stroke-[1.5]'
                }`} 
              />
              <span className="font-sans text-[10px] tracking-wider uppercase font-bold mt-1">
                {btn.id === 'home' ? 'Ana Sayfa' : btn.id === 'qibla' ? 'Kıble' : btn.id === 'dhikr' ? 'Zikir' : 'Ayarlar'}
              </span>
              
              {/* Highlight Dot Indicator */}
              {isSelected && (
                <motion.span 
                  layoutId="activeTabDot"
                  className="absolute bottom-1 w-1 h-1 bg-emerald-700 rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Select Location Overlay (Full Screen Slide Up) */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-md">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-0 bg-white z-50 overflow-y-auto"
            >
              <SelectLocationView 
                activeLocationId={currentLocation.id}
                onSelectLocation={handleSelectLocation}
                onClose={() => setShowLocationModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
