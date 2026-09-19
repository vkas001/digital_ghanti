import type { AudioSource } from 'expo-audio';

export type ToneId =
  | 'temple'
  | 'ghanta'
  | 'church'
  | 'puja'
  | 'school'
  | 'dingdong'
  | 'handbell'
  | 'dinner'
  | 'cowbell'
  | 'alarm'
  | 'ding'
  | 'tibetan';

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
    id: 'puja',
    label: 'Puja Bell',
    description: 'Bright · rapid',
    source: require('../../../assets/sounds/puja.wav'),
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
    id: 'dinner',
    label: 'Dinner Bell',
    description: 'Classic · double-strike',
    source: require('../../../assets/sounds/dinner.wav'),
  },
  {
    id: 'cowbell',
    label: 'Cow Bell',
    description: 'Rustic · clang',
    source: require('../../../assets/sounds/cowbell.wav'),
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
  {
    id: 'tibetan',
    label: 'Tibetan Bowl',
    description: 'Resonant · sustained',
    source: require('../../../assets/sounds/tibetan.wav'),
  },
];

export function getTone(id: ToneId): BellTone {
  const tone = BELL_TONES.find((t) => t.id === id);
  if (!tone) {
    throw new Error(`Unknown bell tone: ${id}`);
  }
  return tone;
}

export function getToneIndex(id: ToneId): number {
  return BELL_TONES.findIndex((t) => t.id === id);
}

export function getToneByIdx(index: number): BellTone {
  const wrapped = ((index % BELL_TONES.length) + BELL_TONES.length) % BELL_TONES.length;
  return BELL_TONES[wrapped];
}

export function getNextTone(id: ToneId): ToneId {
  return getToneByIdx(getToneIndex(id) + 1).id;
}

export function getPreviousTone(id: ToneId): ToneId {
  return getToneByIdx(getToneIndex(id) - 1).id;
}