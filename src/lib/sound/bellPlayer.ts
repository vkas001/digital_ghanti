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
  ringSource: AudioSource;
};

export const BELL_TONES: BellTone[] = [
  {
    id: 'temple',
    label: 'Temple Bell',
    description: 'Deep · warm',
    source: require('../../../assets/sounds/temple.wav'),
    ringSource: require('../../../assets/sounds/temple.ring.wav'),
  },
  {
    id: 'ghanta',
    label: 'Ghanta',
    description: 'Heavy · metallic',
    source: require('../../../assets/sounds/ghanta.wav'),
    ringSource: require('../../../assets/sounds/ghanta.ring.wav'),
  },
  {
    id: 'church',
    label: 'Church Bell',
    description: 'Grand · sonorous',
    source: require('../../../assets/sounds/church.wav'),
    ringSource: require('../../../assets/sounds/church.ring.wav'),
  },
  {
    id: 'puja',
    label: 'Puja Bell',
    description: 'Bright · rapid',
    source: require('../../../assets/sounds/puja.wav'),
    ringSource: require('../../../assets/sounds/puja.ring.wav'),
  },
  {
    id: 'school',
    label: 'School Bell',
    description: 'Bright · sharp',
    source: require('../../../assets/sounds/school.wav'),
    ringSource: require('../../../assets/sounds/school.ring.wav'),
  },
  {
    id: 'dingdong',
    label: 'Ding-Dong',
    description: 'Two-tone chime',
    source: require('../../../assets/sounds/dingdong.wav'),
    ringSource: require('../../../assets/sounds/dingdong.ring.wav'),
  },
  {
    id: 'handbell',
    label: 'Handbell',
    description: 'Silver · two-stroke',
    source: require('../../../assets/sounds/handbell.wav'),
    ringSource: require('../../../assets/sounds/handbell.ring.wav'),
  },
  {
    id: 'dinner',
    label: 'Dinner Bell',
    description: 'Classic · double-strike',
    source: require('../../../assets/sounds/dinner.wav'),
    ringSource: require('../../../assets/sounds/dinner.ring.wav'),
  },
  {
    id: 'cowbell',
    label: 'Cow Bell',
    description: 'Rustic · clang',
    source: require('../../../assets/sounds/cowbell.wav'),
    ringSource: require('../../../assets/sounds/cowbell.ring.wav'),
  },
  {
    id: 'alarm',
    label: 'Alarm Bell',
    description: 'Fast · rattling',
    source: require('../../../assets/sounds/alarm.wav'),
    ringSource: require('../../../assets/sounds/alarm.ring.wav'),
  },
  {
    id: 'ding',
    label: 'Ding',
    description: 'Quick · crisp',
    source: require('../../../assets/sounds/ding.wav'),
    ringSource: require('../../../assets/sounds/ding.ring.wav'),
  },
  {
    id: 'tibetan',
    label: 'Tibetan Bowl',
    description: 'Resonant · sustained',
    source: require('../../../assets/sounds/tibetan.wav'),
    ringSource: require('../../../assets/sounds/tibetan.ring.wav'),
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