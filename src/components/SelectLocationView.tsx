import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Compass, 
  ChevronRight, 
  History, 
  Check 
} from 'lucide-react';
import { LocationData, Tab } from '../types';
import { POPULAR_CITIES, OTHER_COUNTRIES, HOTLINK_IMAGES } from '../data';
import { calculateQiblaAngle, calculateDistanceToKaaba, getHijriDate } from '../utils';
import { TURKEY_PROVINCES } from '../turkeyProvinces';

interface SelectLocationViewProps {
  activeLocationId: string;
  onSelectLocation: (location: LocationData) => void;
  onClose: () => void;
}

export default function SelectLocationView({
  activeLocationId,
  onSelectLocation,
  onClose
}: SelectLocationViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  // Turkish localization helper for search queries
  const toLocaleLower = (str: string) => str.toLocaleLowerCase('tr-TR');

  // Filter popular cities and countries based on search
  const filteredCities = POPULAR_CITIES.filter(city => 
    toLocaleLower(city.name).includes(toLocaleLower(searchQuery)) ||
    toLocaleLower(city.country).includes(toLocaleLower(searchQuery))
  );

  const filteredCountries = OTHER_COUNTRIES.filter(country => 
    toLocaleLower(country).includes(toLocaleLower(searchQuery))
  );

  // Filter and compute full LocationData for 81 Turkish Provinces dynamically
  const filteredProvinces = TURKEY_PROVINCES.filter(city =>
    toLocaleLower(city.name).includes(toLocaleLower(searchQuery))
  ).map(city => {
    const qiblaCalc = calculateQiblaAngle(city.lat, city.lng);
    const distance = calculateDistanceToKaaba(city.lat, city.lng);
    return {
      id: city.id,
      name: city.name,
      country: 'TÜRKİYE',
      lat: city.lat,
      lng: city.lng,
      qiblaAngle: qiblaCalc.angle,
      hijriDate: getHijriDate(new Date()),
      isRamadan: false,
      distanceToKaaba: distance
    } as LocationData;
  });

  // Geolocation trigger to fetch actual physical location coordinates
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocatingError('Tarayıcınız konum servislerini desteklemiyor.');
      return;
    }

    setIsLocating(true);
    setLocatingError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const qiblaCalc = calculateQiblaAngle(latitude, longitude);
        const distance = calculateDistanceToKaaba(latitude, longitude);
        
        const customLoc: LocationData = {
          id: 'custom_gps',
          name: 'Mevcut Konum (GPS)',
          country: 'TÜRKİYE',
          lat: latitude,
          lng: longitude,
          qiblaAngle: qiblaCalc.angle,
          hijriDate: getHijriDate(new Date()),
          isRamadan: false,
          distanceToKaaba: distance
        };
        
        setIsLocating(false);
        onSelectLocation(customLoc);
        onClose();
      },
      (error) => {
        console.error('Konum alınamadı:', error);
        setIsLocating(false);
        setLocatingError('Konum servislerine erişilemedi. Lütfen izinleri kontrol edin.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const getCityImage = (id: string) => {
    switch (id) {
      case 'istanbul': return HOTLINK_IMAGES.istanbul;
      case 'mecca': return HOTLINK_IMAGES.mecca;
      case 'medina': return HOTLINK_IMAGES.medina;
      case 'london': return HOTLINK_IMAGES.london;
      case 'newyork': return HOTLINK_IMAGES.newyork;
      default: return HOTLINK_IMAGES.istanbul;
    }
  };

  // Select a generic country to compute a custom capital city simulation
  const handleSelectCountry = (countryName: string) => {
    // Generate dummy location data for countries in list
    const qiblaCalc = calculateQiblaAngle(35, 45); // General middle east center estimation
    const distance = calculateDistanceToKaaba(35, 45);
    
    const countryLoc: LocationData = {
      id: `country_${countryName.toLowerCase()}`,
      name: countryName,
      country: 'ÜLKE',
      lat: 35,
      lng: 45,
      qiblaAngle: qiblaCalc.angle,
      hijriDate: getHijriDate(new Date()),
      isRamadan: false,
      distanceToKaaba: distance
    };

    onSelectLocation(countryLoc);
    onClose();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 relative select-none">
      {/* Background patterns */}
      <div className="absolute inset-0 pattern-overlay pointer-events-none opacity-5"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center px-6 justify-between">
        <button 
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:scale-95 transition-transform text-emerald-800"
          aria-label="Geri Dön"
        >
          <ArrowLeft size={20} className="stroke-[2.5]" />
        </button>
        <h1 className="font-sans font-black text-lg tracking-tight text-emerald-950">
          Konum Seçin
        </h1>
        <div className="w-10"></div> {/* Spacer balance */}
      </header>

      {/* Main Container */}
      <main className="pt-20 px-6 max-w-lg mx-auto space-y-8 relative z-10">
        
        {/* Search & GPS GPS button */}
        <section className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-white glass-card focus:ring-2 focus:ring-emerald-600 transition-all placeholder:text-gray-400 font-sans text-sm shadow-sm"
              placeholder="Şehir veya ülke arayın..."
            />
          </div>

          <button 
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="w-full h-14 flex items-center justify-center gap-2.5 rounded-full bg-emerald-900 text-white font-sans font-bold text-xs tracking-widest hover:bg-emerald-800 transition-all active:scale-[0.98] shadow-md shadow-emerald-950/10"
          >
            <MapPin size={16} className="fill-white stroke-emerald-900" />
            <span>{isLocating ? 'KONUM ALINIYOR...' : 'MEVCUT KONUMU KULLAN (GPS)'}</span>
          </button>

          {locatingError && (
            <p className="text-center text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
              {locatingError}
            </p>
          )}
        </section>

        {/* Popular Cities */}
        {filteredCities.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-sans font-bold text-xs text-gray-400 tracking-widest uppercase pl-1">
              Popüler Şehirler
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {filteredCities.map((city) => {
                const isActive = city.id === activeLocationId;
                
                return (
                  <div 
                    key={city.id}
                    onClick={() => {
                      onSelectLocation(city);
                      onClose();
                    }}
                    className={`relative h-28 rounded-2xl overflow-hidden group cursor-pointer active:scale-95 transition-transform shadow-sm border border-white ${
                      isActive ? 'ring-4 ring-emerald-600/30' : ''
                    }`}
                  >
                    {/* Background City Hotlink Cover */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                      style={{ backgroundImage: `url(${getCityImage(city.id)})` }}
                    />
                    {/* Shading gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/40 to-transparent"></div>
                    
                    {/* Check icon if active */}
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full border border-white shadow-md">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="font-sans font-black text-sm">{city.name}</p>
                      <p className="text-[9px] font-bold tracking-wider text-emerald-200 mt-0.5">
                        {city.country}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Searches */}
        {searchQuery === '' && (
          <section className="space-y-3">
            <h2 className="font-sans font-bold text-xs text-gray-400 tracking-widest uppercase pl-1">
              Son Aramalar
            </h2>
            
            <div className="space-y-2.5">
              {[
                { name: 'Dubai, BAE', lat: 25.2048, lng: 55.2708, qibla: 261.3, km: 1475 },
                { name: 'Kahire, Mısır', lat: 30.0444, lng: 31.2357, qibla: 135.8, km: 1285 }
              ].map((recent, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    const customRecent: LocationData = {
                      id: `recent_${idx}`,
                      name: recent.name.split(',')[0],
                      country: recent.name.split(',')[1].trim(),
                      lat: recent.lat,
                      lng: recent.lng,
                      qiblaAngle: recent.qibla,
                      hijriDate: getHijriDate(new Date()),
                      isRamadan: false,
                      distanceToKaaba: recent.km
                    };
                    onSelectLocation(customRecent);
                    onClose();
                  }}
                  className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-emerald-50/40 cursor-pointer transition-colors border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <History size={16} className="text-gray-400" />
                    <span className="font-sans font-bold text-sm text-emerald-950">
                      {recent.name}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Turkey Provinces List */}
        {filteredProvinces.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between pl-1">
              <h2 className="font-sans font-bold text-xs text-gray-400 tracking-widest uppercase">
                Türkiye İlleri ({filteredProvinces.length} İl)
              </h2>
            </div>
            
            <div className="glass-card rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white max-h-80 overflow-y-auto divide-y divide-gray-100/50">
              {filteredProvinces.map((province) => {
                const isActive = province.id === activeLocationId;
                return (
                  <button
                    key={province.id}
                    onClick={() => {
                      onSelectLocation(province);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-5 py-4 hover:bg-emerald-50/25 active:bg-emerald-50/50 text-left transition-colors ${
                      isActive ? 'bg-emerald-600/5 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className={isActive ? 'text-emerald-700 stroke-[2.5]' : 'text-gray-400'} />
                      <span className={`font-sans text-sm ${isActive ? 'text-emerald-950 font-bold' : 'text-gray-700 font-medium'}`}>
                        {province.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-400 tracking-wider">
                        {province.lat.toFixed(2)}°N, {province.lng.toFixed(2)}°E
                      </span>
                      {isActive && (
                        <span className="bg-emerald-600 text-white p-0.5 rounded-full border border-white shadow-sm">
                          <Check size={10} className="stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Browse Countries List */}
        {filteredCountries.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between pl-1">
              <h2 className="font-sans font-bold text-xs text-gray-400 tracking-widest uppercase">
                Ülkeye Göre Ara
              </h2>
            </div>
            
            <div className="glass-card rounded-2xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-100/50 bg-white">
              {filteredCountries.map((country, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSelectCountry(country)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-emerald-50/20 active:bg-emerald-50/50 text-left transition-colors"
                >
                  <span className="font-sans font-bold text-sm text-emerald-950">
                    {country}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">
                    {country.charAt(0)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Decorative footer */}
        <footer className="py-8 flex flex-col items-center gap-4 opacity-40 select-none">
          <div className="h-0.5 w-16 bg-emerald-700 rounded"></div>
          <p className="font-sans font-bold text-[10px] tracking-widest text-emerald-950 uppercase">
            SÜKÛNET MANEVİ REHBER • EST. 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
