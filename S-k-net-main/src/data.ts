import { LocationData, DhikrItem, DailyVerse } from './types';

export const POPULAR_CITIES: LocationData[] = [
  {
    id: 'istanbul',
    name: 'İstanbul',
    country: 'TÜRKİYE',
    lat: 41.0082,
    lng: 28.9784,
    qiblaAngle: 154.2,
    hijriDate: '20 Muharrem 1448',
    isRamadan: false,
    distanceToKaaba: 2384,
  },
  {
    id: 'mecca',
    name: 'Mekke',
    country: 'SUUDİ ARABİSTAN',
    lat: 21.4225,
    lng: 39.8262,
    qiblaAngle: 0,
    hijriDate: '20 Muharrem 1448',
    isRamadan: false,
    distanceToKaaba: 0,
  },
  {
    id: 'medina',
    name: 'Medine',
    country: 'SUUDİ ARABİSTAN',
    lat: 24.4672,
    lng: 39.6112,
    qiblaAngle: 182.5,
    hijriDate: '20 Muharrem 1448',
    isRamadan: false,
    distanceToKaaba: 339,
  },
  {
    id: 'london',
    name: 'Londra',
    country: 'BİRLEŞİK KRALLIK',
    lat: 51.5074,
    lng: -0.1278,
    qiblaAngle: 118.8,
    hijriDate: '20 Muharrem 1448',
    isRamadan: false,
    distanceToKaaba: 4791,
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'ABD',
    lat: 40.7128,
    lng: -74.0060,
    qiblaAngle: 58.5,
    hijriDate: '20 Muharrem 1448',
    isRamadan: false,
    distanceToKaaba: 10287,
  }
];

export const OTHER_COUNTRIES = [
  'Afganistan', 'Arnavutluk', 'Cezayir', 'Avustralya', 'Bangladeş', 'Belçika', 'Kanada',
  'Mısır', 'Fransa', 'Almanya', 'Endonezya', 'İran', 'Irak', 'Ürdün', 'Kuveyt', 'Malezya',
  'Fas', 'Hollanda', 'Pakistan', 'Katar', 'Singapur', 'Suriye', 'Tunus', 'Yemen'
];

export const POPULAR_DHIKRS: DhikrItem[] = [
  {
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    meaning: 'Allah\'ı her türlü noksanlıktan tenzih ederim (O noksansızdır).'
  },
  {
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    meaning: 'Bütün hamd ve şükürler alemlerin Rabbi olan Allah\'adır.'
  },
  {
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰه',
    transliteration: 'La ilaha illallah',
    meaning: 'Allah\'tan başka ibadete layık hiçbir ilah yoktur.'
  },
  {
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah en büyüktür, şanı her şeyden yücedir.'
  },
  {
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    meaning: 'Allah\'tan beni bağışlamasını ve affetmesini dilerim.'
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subhanallahi ve Bihamdihi',
    meaning: 'Allah\'ı hamdederek, tüm noksan sıfatlardan tenzih ederim.'
  },
  {
    arabic: 'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ',
    transliteration: 'La Hawla Wa La Quwwata Illa Billah',
    meaning: 'Güç ve kuvvet ancak şanı yüce olan Allah\'ın yardımıyladır.'
  }
];

export const DAILY_VERSES: DailyVerse[] = [
  {
    text: '“Şüphesiz zorlukla beraber bir kolaylık vardır. Gerçekten zorlukla beraber bir kolaylık vardır.”',
    surah: 'İNŞİRÂH SURESİ 94:5-6',
    translation: '"So verily, with every difficulty, there is relief. Verily, with every difficulty, there is relief."'
  },
  {
    text: '“Kullarım beni sana soracak olursa, muhakkak ki ben onlara çok yakınım. Bana dua ettiği zaman dua edenin duasına cevap veririm.”',
    surah: 'BAKARA SURESİ 2:186',
    translation: '"When My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me."'
  },
  {
    text: '“Ey iman edenler! Allah’ı çokça zikredin ve O’nu sabah akşam tesbih edin.”',
    surah: 'AHZÂB SURESİ 33:41-42',
    translation: '"O you who have believed, remember Allah with much remembrance and exalt Him morning and afternoon."'
  },
  {
    text: '“Öyleyse beni anın ki ben de sizi anayım. Bana şükredin ve nankörlük etmeyin.”',
    surah: 'BAKARA SURESİ 2:152',
    translation: '"So remember Me; I will remember you. And be grateful to Me and do not deny Me."'
  }
];

// Screen Hotlink Images matching exactly the specifications
export const HOTLINK_IMAGES = {
  istanbul: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEV3leeqb4pcRSOMhCv34xL6-inTzcKUnQBcj2PrsdDR-kkUkaGX2abeinAEvnqTvmIRGnoXXDaa9WPaG_wl5boW31IMSQxWP_5HlSGOc82NRFlqfM3LV6qhQ5oX2mrVl9InkT0u7BS0v4efghkQ9ZKy9a64hCaPcTJhYHi1_YAJxoyCra_cC07PTnn3M6dV4KhQNrBQpiFSt_yCXHng1Ok5tr7ddorG_Xut-OeDX1yAXvYc0py_ewxQ',
  mecca: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHPx0yzKV58QpxgnRn8C7sFp_dA3X8CxhFHdiRYLZj7K2wbgTnsEeE-pKRIM65Nk9pcq6k7gXaNeclhcwklLSKIDSJVIbfn8lUwqY8CypATq-9JlJvEeAWGqVWZhXt1PT3pDtWCakUyzewFZ_i-W-DxovA4mnHZLiVTcNhy2ocP1IN_DOCHaX_zclhdNSOl-jC7aJ5PKjU14IOhHxBldrZA2WMI_plaUije9RMqYxTGYVT8g8bJzQIvw',
  london: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIzs6tXg2JVcRA7eoGdu-pzUVCq3q80Atuok-_3_L1APt61P7PfEXhRTL8X_oeswnmj6HSVj7CfwWBDG-ggnteEx4r8Knqd1EBS0thd7Mjty1ym9n1ukk50cbSYvkDA6YStUElroZm8Adbj3z08JTRxq07kOhvw1cJcA7jjOUann4MZsYA8e_LkUETBlGCFXsiWhGuaImpxaiTZnG6kHyVpvhb8ylHXYSpFZFWK74t-7pGJeU8-IyFqA',
  newyork: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxYf3vpun2CUpLHeh0WuunUjleAyzcpnFOhSNWcrj3BjAwTBNjohnu69qCaQUHAiK9qcE0EPJ4LJmoQSwQ-FPQ8Nokv_jkPqfNKI5o3QLx4CftLrKfsH_BOzNX4UKjH57U25kby8EjYKP_7ng_2qSLeXhoUZJKfKyUvgVQUC7ImzM3MVl1V774XLf9zdiStJrAMBVoKzfQU3-eWfZmKBi5yRkrcw5kX609c5vLWrMs1gba_nGFuBsLlw',
  medina: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClypVPsMkpnVCaWFaS2XY9EJjjWGPD53DvXjuZgW85HpI77-vSzvP308iP5chkbXIz8QNW5ULSuHjfCsNK4EAR2ifw-USNcQ6SVsJfwXh6cwMl50TCOKb_eMugAX6VUvZEtsYPbk7B6CCPGB4b4q39AFvyrdx2PjG9nP9R6K-DIY3hhxwMekmRKr5zGXtpRQmRFkXEyP8gqd2H-ibZSJnmWyH5irw7X_4gs9kpzQIhMUYKPs-DdnkyIw',
  arabesque: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS6e1gEpm2Flb0TXyq6lA0p38_KZvNfeHNPkpFNV_a06uk36aF6JAVoLXDOylYnYqOFw319mj1jS-Nkkkyx0oUHHKI7vBbRvWoahqtEZZu0SFXVjETIbnMcC0SF-DozV81YB18jxNn3qq63g0GE9pOSbf2PXsyHhAivasO1Ic9X7GidAUtugFWDwRMBDBB47rQua_Bep0v94RYz7mxJtN-noRkLDQYxcsZ42dwWG9OYd_20BjVi6LUmA',
  mapView: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2EPcvLlPACYY5xOr-VtVmRc4kWKaKp3UGn6iPEaqDrs98Bb8xslDSIpJCAunTAge1S9qXu9nzXFfNuhCydibFGSi6JnBbGRCwbRA7xNxi5pDtuODHN72GikmDn8O_ORlxZTWeazrQeqjvaYXynyzHa5HJFT78UNagYnGxOia8FtCiBMaB9skcdANFXTdMk1IJt-nN6z16sO9L70hc0Ccxwk30iTFmisciwU-N1TBpoaEneJPeY7-tVQ'
};
