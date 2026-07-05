import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Compass, 
  Info, 
  Map, 
  Check, 
  Smartphone,
  Navigation,
  RotateCw,
  ChevronDown
} from 'lucide-react';
import { LocationData, Tab } from '../types';
import { HOTLINK_IMAGES } from '../data';
import { calculateQiblaAngle, calculateDistanceToKaaba, getHijriDate } from '../utils';

interface QiblaViewProps {
  currentLocation: LocationData;
  onNavigate: (tab: Tab) => void;
  onOpenLocationSelector: () => void;
}

export default function QiblaView({ currentLocation, onNavigate, onOpenLocationSelector }: QiblaViewProps) {
  const [viewMode, setViewMode] = useState<'compass' | 'map'>('compass');
  const [deviceAlpha, setDeviceAlpha] = useState<number | null>(null);
  const [manualRotation, setManualRotation] = useState<number>(0);
  const [isFacingQibla, setIsFacingQibla] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('unknown');

  const dragStartAngle = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Retrieve calculated Qibla bearing based on location
  const qiblaResult = calculateQiblaAngle(currentLocation.lat, currentLocation.lng);
  const targetBearing = qiblaResult.angle;
  const distanceToKaaba = calculateDistanceToKaaba(currentLocation.lat, currentLocation.lng);

  // Set up device orientation listener for real mobile devices
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // e.alpha represents rotation around z-axis [0, 360]
      if (e.alpha !== null) {
        setDeviceAlpha(e.alpha);
      }
    };

    // Check if device orientation is supported
    if (window.DeviceOrientationEvent) {
      // iOS requires permission request
      const requestPermission = (DeviceOrientationEvent as any).requestPermission;
      if (typeof requestPermission === 'function') {
        setPermissionState('prompt');
      } else {
        setPermissionState('granted');
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      setPermissionState('unsupported');
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleRequestPermission = async () => {
    const requestPermission = (DeviceOrientationEvent as any).requestPermission;
    if (typeof requestPermission === 'function') {
      try {
        const state = await requestPermission();
        setPermissionState(state);
        if (state === 'granted') {
          window.addEventListener('deviceorientation', (e) => {
            if (e.alpha !== null) setDeviceAlpha(e.alpha);
          });
        }
      } catch (err) {
        console.error('orientation permission error:', err);
        setPermissionState('denied');
      }
    }
  };

  // Compute final needle rotation
  // alpha represents the heading angle (where N is pointing relative to the device).
  // Needle Rotation = (qiblaBearing - alpha)
  // If alpha is null (desktop/simulated), we use manualRotation (simulating a turn).
  const currentHeading = deviceAlpha !== null ? deviceAlpha : manualRotation;
  const needleRotation = (360 - currentHeading + targetBearing) % 360;

  // Evaluate alignment
  // If needleRotation is close to 0 (or 360), the device is facing the Qibla (Kaaba)
  useEffect(() => {
    const diff = Math.abs((needleRotation % 360) - 360) % 360;
    const aligned = diff <= 6 || diff >= 354;
    setIsFacingQibla(aligned);
  }, [needleRotation]);

  // Touch/Mouse interaction handlers to turn the device manually
  const getAngle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return (angle + 360) % 360;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (deviceAlpha !== null) return; // Ignore if real sensor active
    const angle = getAngle(e.clientX, e.clientY);
    dragStartAngle.current = (angle - manualRotation + 360) % 360;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartAngle.current === null) return;
    const angle = getAngle(e.clientX, e.clientY);
    let newRotation = (angle - dragStartAngle.current + 360) % 360;
    setManualRotation(newRotation);
  };

  const handleMouseUpOrLeave = () => {
    dragStartAngle.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (deviceAlpha !== null || e.touches.length === 0) return;
    const angle = getAngle(e.touches[0].clientX, e.touches[0].clientY);
    dragStartAngle.current = (angle - manualRotation + 360) % 360;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartAngle.current === null || e.touches.length === 0) return;
    const angle = getAngle(e.touches[0].clientX, e.touches[0].clientY);
    let newRotation = (angle - dragStartAngle.current + 360) % 360;
    setManualRotation(newRotation);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center px-6 h-16 max-w-full">
        <button 
          onClick={onOpenLocationSelector}
          className="flex items-center gap-2 text-emerald-600 hover:opacity-80 active:scale-95 transition-all text-left"
          id="qibla-location-selector-btn"
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
          Kıble (Qibla)
        </span>
      </header>

      {/* View Toggle */}
      <div className="flex justify-center pt-2">
        <div className="bg-emerald-50 p-1.5 rounded-full flex gap-1.5 tonal-glow border border-emerald-100">
          <button 
            onClick={() => setViewMode('compass')}
            className={`px-6 py-2.5 rounded-full font-sans font-extrabold text-xs tracking-widest transition-all ${
              viewMode === 'compass' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-emerald-800 hover:bg-emerald-100/50'
            }`}
          >
            PUSULA (COMPASS)
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`px-6 py-2.5 rounded-full font-sans font-extrabold text-xs tracking-widest transition-all ${
              viewMode === 'map' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-emerald-800 hover:bg-emerald-100/50'
            }`}
          >
            HARİTA (MAP VIEW)
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'compass' ? (
          /* Compass Instrumental Screen */
          <motion.section 
            key="compass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center space-y-6 pt-4"
          >
            {/* Bearing Text Block */}
            <div className={`text-center transition-all duration-300 ${isFacingQibla ? 'scale-105' : 'opacity-80'}`}>
              <p className="font-sans font-bold text-xs text-emerald-600 tracking-widest uppercase">
                KIBLE AÇISI (QIBLA DIRECTION)
              </p>
              <h2 className="font-sans font-black text-3xl text-emerald-950 mt-1">
                {targetBearing}° SE (Güneydoğu)
              </h2>
            </div>

            {/* Simulated Desktop Advice */}
            {deviceAlpha === null && (
              <div className="text-center px-4 max-w-sm">
                <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                  <Smartphone size={12} className="text-emerald-600" />
                  Pusulayı döndürmek için fareyle tutup çevirebilirsiniz.
                </p>
              </div>
            )}

            {/* Compass Sphere */}
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
              className={`relative w-76 h-76 md:w-80 md:h-80 rounded-full border border-gray-100 glass-card transition-all duration-500 cursor-grab active:cursor-grabbing flex items-center justify-center select-none ${
                isFacingQibla ? 'active-alignment' : ''
              }`}
            >
              {/* Cardonal Compass Markers */}
              <div className="absolute inset-4 rounded-full border border-gray-100/40 pointer-events-none opacity-40"></div>
              
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between items-center py-5">
                <span className="font-sans font-black text-sm text-gray-400">K (N)</span>
                <span className="font-sans font-black text-sm text-gray-400">G (S)</span>
              </div>
              <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-5">
                <span className="font-sans font-black text-sm text-gray-400">B (W)</span>
                <span className="font-sans font-black text-sm text-gray-400 font-sans font-black">D (E)</span>
              </div>

              {/* Angle scale ticks */}
              <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-dashed border-gray-100/10"></div>

              {/* Compass Ring Outer with Rotation degree */}
              <div 
                className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-100 ease-out"
                style={{ transform: `rotate(${-currentHeading}deg)` }}
              >
                {/* Visual compass ticks */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                  <div 
                    key={deg} 
                    className="absolute w-1 h-3 bg-gray-200"
                    style={{ transform: `rotate(${deg}deg) translateY(-145px)` }}
                  ></div>
                ))}
              </div>

              {/* Golden Mosque Qibla Needle */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${needleRotation}deg)` }}
              >
                <div className="relative flex flex-col items-center pointer-events-none">
                  {/* Mosque Top Indicator */}
                  <div className="bg-amber-400 text-emerald-950 p-2 rounded-full shadow-lg border border-white mb-2 transform -translate-y-5 flex items-center justify-center animate-bounce">
                    <Navigation size={18} className="fill-emerald-950 stroke-emerald-950" />
                  </div>
                  
                  {/* Golden Needle Spine */}
                  <div className="w-1.5 h-36 bg-gradient-to-t from-amber-300 via-emerald-600 to-transparent rounded-full shadow-md"></div>
                </div>
              </div>

              {/* Center Cap Axis */}
              <div className="z-20 w-5 h-5 bg-emerald-800 rounded-full border-[3px] border-white shadow-xl"></div>
            </div>

            {/* Calibration / Permission Handler for iOS */}
            {permissionState === 'prompt' && (
              <button 
                onClick={handleRequestPermission}
                className="font-sans font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition-all rounded-full px-5 py-2.5 inline-flex items-center gap-2 shadow"
              >
                <RotateCw size={14} />
                Pusula Sensör İznini Etkinleştir
              </button>
            )}

            {/* Interactive Feedback Message */}
            <div className="h-16 flex items-center justify-center">
              <AnimatePresence>
                {isFacingQibla && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="glass-card border border-emerald-200/50 bg-emerald-500/10 px-8 py-3.5 rounded-full flex items-center gap-2.5 shadow-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <Check size={18} className="text-emerald-600 stroke-[3]" />
                    <p className="font-sans font-extrabold text-emerald-950 text-sm">
                      Kıbleye Yöneldiniz (Facing Qibla)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        ) : (
          /* Map View Screen */
          <motion.section 
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col space-y-4 pt-4"
          >
            <div className="glass-card w-full h-[400px] md:h-[450px] rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative">
              <div 
                className="w-full h-full bg-cover bg-center transition-all duration-700" 
                style={{ backgroundImage: `url(${HOTLINK_IMAGES.mapView})` }}
              ></div>
              <div className="absolute top-4 left-4 bg-emerald-900 text-white border border-emerald-600/30 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Map size={16} className="text-amber-300" />
                <span className="font-sans font-black text-xs uppercase tracking-widest text-amber-300">
                  KÂBE'YE MESAFE: {distanceToKaaba.toLocaleString('tr-TR')} KM
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-xl">
                <h4 className="font-sans font-extrabold text-sm text-emerald-950">İstanbul - Mekke Hattı</h4>
                <p className="text-xs text-gray-500 mt-1">Görsel kıble çizgisi, {currentLocation.name} koordinatından Mekke-i Mükerreme'deki Kâbe-i Şerif'e uzanan en kısa yay mesafesini temsil eder.</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Informational Tip Card */}
      <div className="glass-card p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <Info size={22} className="stroke-2" />
          </div>
          <div>
            <h3 className="font-sans font-extrabold text-emerald-950 mb-1 text-sm">Kalibrasyon Önerisi</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              En doğru ölçüm ve Kıble sapmasını önlemek için cihazınızı düz bir zeminde tutun. Çevrenizde manyetik kapaklı kılıflar, metal eşyalar veya elektronik cihazlar bulundurmamaya özen gösterin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
