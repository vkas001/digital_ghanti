import type { AudioSource } from 'expo-audio';

export type ToneId =
  | 'temple'
  | 'ghanta'
  | 'church'
  | 'school'
  | 'dingdong'
  | 'handbell'
  | 'alarm'
  | 'ding';

export type BellTone = {
  id: ToneId;
  label: string;
  description: string;
  source: AudioSource;
};

export const BELL_TONES: BellTone[] = [
  {
    id: 'temple',
    label: 'Temple Bell',
    description: 'Deep · warm',
    source: require('../../../assets/sounds/temple.wav'),
  },
  {
    id: 'ghanta',
    label: 'Ghanta',
    description: 'Heavy · metallic',
    source: require('../../../assets/sounds/ghanta.wav'),
  },
  {
    id: 'church',
    label: 'Church Bell',
    description: 'Grand · sonorous',
    source: require('../../../assets/sounds/church.wav'),
  },
  {
    id: 'school',
    label: 'School Bell',
    description: 'Bright · sharp',
    source: require('../../../assets/sounds/school.wav'),
  },
  {
    id: 'dingdong',
    label: 'Ding-Dong',
    description: 'Two-tone chime',
    source: require('../../../assets/sounds/dingdong.wav'),
  },
  {
    id: 'handbell',
    label: 'Handbell',
    description: 'Silver · two-stroke',
    source: require('../../../assets/sounds/handbell.wav'),
  },
  {
    id: 'alarm',
    label: 'Alarm Bell',
    description: 'Fast · rattling',
    source: require('../../../assets/sounds/alarm.wav'),
  },
  {
    id: 'ding',
    label: 'Ding',
    description: 'Quick · crisp',
    source: require('../../../assets/sounds/ding.wav'),
  },
];

export function getTone(id: ToneId): BellTone {
  const tone = BELL_TONES.find((t) => t.id === id);
  if (!tone) {
    throw new Error(`Unknown bell tone: ${id}`);
  }
  return tone;
}