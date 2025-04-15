export type Language = {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  flagUri: string;
};

export const languages: Language[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'İngilizce',
    flag: '🇬🇧',
    flagUri: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  },
  {
    id: 'de',
    name: 'German',
    nativeName: 'Almanca',
    flag: '🇩🇪',
    flagUri: 'https://images.unsplash.com/photo-1527866512907-a35a62a0f6c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  },
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Fransızca',
    flag: '🇫🇷',
    flagUri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  },
  {
    id: 'es',
    name: 'Spanish',
    nativeName: 'İspanyolca',
    flag: '🇪🇸',
    flagUri: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  },
  {
    id: 'it',
    name: 'Italian',
    nativeName: 'İtalyanca',
    flag: '🇮🇹',
    flagUri: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  },
];

export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const proficiencyLevels: { id: ProficiencyLevel; name: string }[] = [
  { id: 'A1', name: 'A1 - Başlangıç' },
  { id: 'A2', name: 'A2 - Temel' },
  { id: 'B1', name: 'B1 - Orta Altı' },
  { id: 'B2', name: 'B2 - Orta' },
  { id: 'C1', name: 'C1 - İleri' },
  { id: 'C2', name: 'C2 - Ustalaşmış' },
];