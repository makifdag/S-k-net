export type Tab = 'home' | 'qibla' | 'dhikr' | 'settings' | 'location';

export interface LocationData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  qiblaAngle: number;
  hijriDate: string;
  isRamadan: boolean;
  distanceToKaaba: number; // in KM
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface DhikrItem {
  arabic: string;
  transliteration: string;
  meaning: string;
}

export interface DailyVerse {
  text: string;
  surah: string;
  translation: string;
}

export interface PrayerNotificationSettings {
  [key: string]: {
    adhanEnabled: boolean;
    reminder15m: boolean;
  };
}
