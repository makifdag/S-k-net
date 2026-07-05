import { PrayerTimes } from './types';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Calculate Qibla angle relative to North (0 deg)
export function calculateQiblaAngle(lat: number, lng: number): { angle: number; direction: string } {
  if (Math.abs(lat - KAABA_LAT) < 0.1 && Math.abs(lng - KAABA_LNG) < 0.1) {
    return { angle: 0, direction: 'Kâbe\'desiniz' };
  }

  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const kLatRad = (KAABA_LAT * Math.PI) / 180;
  const kLngRad = (KAABA_LNG * Math.PI) / 180;

  const dLng = kLngRad - lngRad;
  const y = Math.sin(dLng);
  const x = Math.cos(latRad) * Math.tan(kLatRad) - Math.sin(latRad) * Math.cos(dLng);
  
  let angle = (Math.atan2(y, x) * 180) / Math.PI;
  angle = (angle + 360) % 360;

  // Formulate Cardinal Direction
  let direction = '';
  if (angle >= 337.5 || angle < 22.5) direction = 'N';
  else if (angle >= 22.5 && angle < 67.5) direction = 'NE';
  else if (angle >= 67.5 && angle < 112.5) direction = 'E';
  else if (angle >= 112.5 && angle < 157.5) direction = 'SE';
  else if (angle >= 157.5 && angle < 202.5) direction = 'S';
  else if (angle >= 202.5 && angle < 247.5) direction = 'SW';
  else if (angle >= 247.5 && angle < 292.5) direction = 'W';
  else if (angle >= 292.5 && angle < 337.5) direction = 'NW';

  return {
    angle: Math.round(angle * 10) / 10,
    direction: `${Math.round(angle * 10) / 10}° ${direction}`
  };
}

// Haversine formula to compute distance to Kaaba in KM
export function calculateDistanceToKaaba(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  const lat1 = (lat * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Helper to format minutes as HH:MM
function minutesToTimeStr(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Generate realistic prayer times mathematically using latitude, longitude, and day of year
export function calculatePrayerTimes(lat: number, lng: number, date: Date = new Date()): PrayerTimes {
  // Simple astronomical estimation
  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Solar declination (approximate)
  const declination = 23.45 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
  
  // Local time offset based on longitude (approximate local timezone, default to GMT +3 for Turkey if near, or calculate from lng)
  const timezoneOffset = -date.getTimezoneOffset(); // in minutes
  const timezoneHours = timezoneOffset / 60;

  // Base times at equatorial/noon
  // Solar noon is roughly around 12:00 + (timezone_longitude - actual_longitude) * 4 minutes
  const baseNoon = 720 + (timezoneHours * 15 - lng) * 4; 

  // Daytime duration varies with latitude & declination
  // angle = acos(-tan(lat) * tan(decl))
  const latRad = (lat * Math.PI) / 180;
  const declRad = (declination * Math.PI) / 180;
  
  let sunsetHourAngleRad = Math.acos(
    Math.max(-0.999, Math.min(0.999, -Math.tan(latRad) * Math.tan(declRad)))
  );
  const sunsetHourAngleMin = (sunsetHourAngleRad * 180 / Math.PI) * 4;

  // Calculate times
  const dhuhr = baseNoon;
  const sunrise = baseNoon - sunsetHourAngleMin;
  const maghrib = baseNoon + sunsetHourAngleMin;
  
  // Fajr is roughly 90 minutes before sunrise
  const fajr = sunrise - 90 - Math.abs(lat) * 0.4;
  
  // Asr is standard shadow length method (roughly midpoint between dhuhr and maghrib)
  const asr = dhuhr + (maghrib - dhuhr) * 0.58;
  
  // Isha is roughly 90 minutes after maghrib
  const isha = maghrib + 80 + Math.abs(lat) * 0.3;

  return {
    Fajr: minutesToTimeStr(fajr),
    Sunrise: minutesToTimeStr(sunrise),
    Dhuhr: minutesToTimeStr(dhuhr),
    Asr: minutesToTimeStr(asr),
    Maghrib: minutesToTimeStr(maghrib),
    Isha: minutesToTimeStr(isha)
  };
}

// Convert "HH:MM" string to minutes of the day
export function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Get Hijri Date estimation based on Gregorian Date
export function getHijriDate(date: Date = new Date()): string {
  // Approximate Islamic calendar mapping
  // Gregorian March 23, 2024 is roughly 13 Ramadan 1445
  // Current date: July 5, 2026 is roughly 20 Muharram 1448
  const baseGregorian = new Date(2024, 2, 23); // 23 March 2024
  const baseHijriDay = 13;
  const baseHijriMonth = 9; // Ramadan
  const baseHijriYear = 1445;

  const msDiff = date.getTime() - baseGregorian.getTime();
  const dayDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

  // Islamic year is approx 354.36 days, month is 29.53 days
  const totalHijriDays = Math.round(baseHijriYear * 354.36 + (baseHijriMonth - 1) * 29.53 + baseHijriDay + dayDiff);

  const hijriYear = Math.floor(totalHijriDays / 354.36);
  const remainingDaysInYear = totalHijriDays % 354.36;
  const hijriMonth = Math.floor(remainingDaysInYear / 29.53) + 1;
  const hijriDay = Math.floor(remainingDaysInYear % 29.53) + 1;

  const monthNames = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];

  const monthName = monthNames[(hijriMonth - 1) % 12];
  return `${hijriDay} ${monthName} ${hijriYear}`;
}
