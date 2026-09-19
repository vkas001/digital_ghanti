#!/usr/bin/env node
/**
 * Generates the bundled bell tones in assets/sounds/*.wav
 *
 * A struck bell is INHARMONIC: its partials sit near ratios like
 * 1.0, 2.0, 2.71, 4.09, 5.4 of the fundamental (not integer multiples),
 * each with its own amplitude and exponential decay — the clash of the
 * high "strike" partials over the long-lived fundamental is what sounds
 * like a bell instead of a sine note.
 *
 * Each tone can state:
 *   - `strikes`: absolute times (s) at which the bell is re-struck, so a
 *     single file models a two-stroke handbell, a ding-dong chime or a
 *     rattling alarm clapper.
 *   - `clapper`: 0..1 percussive strike — a short low-passed noise burst
 *     (the mechanical "clack" of the struck bell, heavier on big bells).
 *
 * Pure Node (no external audio): writes 16-bit PCM mono WAVs.
 * Deterministic: a seeded PRNG adds a whisper of detune for shimmer.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {{ baseHz: number, duration: number, partials: [number, number, number][], strikes: number[], clapper?: number, detune?: number }} spec
 *   partials = [ratio, amplitude, decaySec]
 */
function synthesizeBell(spec) {
  const rand = mulberry32(Math.round(spec.baseHz * 1000 + spec.duration * 100));
  const n = Math.floor(SAMPLE_RATE * spec.duration);
  const samples = new Float64Array(n);
  const strikes = spec.strikes ?? [0];

  for (const [ratio, amp, decay] of spec.partials) {
    const freq = spec.baseHz * ratio * (1 + (rand() - 0.5) * (spec.detune ?? 0.002));
    const phase = rand() * Math.PI * 2;
    const omega = (2 * Math.PI * freq) / SAMPLE_RATE;
    const decayPerSample = Math.exp(-1 / (SAMPLE_RATE * decay));
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      let env = 0;
      for (const s of strikes) {
        if (t >= s) env += Math.exp(-(t - s) / decay);
      }
      samples[i] += amp * Math.sin(omega * i + phase) * env * decayPerSample;
    }
  }

  const clapper = spec.clapper ?? 0;
  if (clapper > 0) {
    const burstLen = Math.floor(SAMPLE_RATE * 0.05);
    const tau = 0.012;
    for (const s of strikes) {
      const start = Math.floor(s * SAMPLE_RATE);
      const end = Math.min(n, start + burstLen);
      let prev = 0;
      for (let i = start; i < end; i++) {
        const raw = rand() * 2 - 1;
        const lp = prev + 0.7 * (raw - prev);
        prev = lp;
        const t = (i - start) / SAMPLE_RATE;
        samples[i] += clapper * lp * Math.exp(-t / tau);
      }
    }
  }

  const attack = Math.floor(SAMPLE_RATE * (spec.attack ?? 0.004));
  for (let i = 0; i < n; i++) {
    if (i < attack) samples[i] *= i / attack;
    const tail = n - 1 - i;
    if (tail < Math.floor(SAMPLE_RATE * 0.03)) samples[i] *= tail / Math.floor(SAMPLE_RATE * 0.03);
  }

  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const gain = peak > 0 ? 0.9 / peak : 0;

  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] * gain));
    pcm.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  return pcm;
}

function writeWav(file, pcm) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, pcm]));
  console.log(`wrote ${file} (${pcm.length / 2} samples, ${((pcm.length + 44) / 1024).toFixed(1)} KiB)`);
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

const TONES = {
  'temple.wav': {
    baseHz: 220,
    duration: 2.8,
    detune: 0.002,
    strikes: [0],
    clapper: 0.35,
    partials: [
      [0.5, 0.7, 2.4],
      [1.0, 1.0, 1.5],
      [2.0, 0.5, 1.0],
      [2.71, 0.55, 0.7],
      [3.4, 0.28, 0.45],
      [4.09, 0.34, 0.3],
      [5.4, 0.18, 0.17],
    ],
  },
  'puja.wav': {
    baseHz: 1046,
    duration: 1.8,
    detune: 0.004,
    strikes: [0, 0.14, 0.28],
    clapper: 0.35,
    partials: [
      [1.0, 1.0, 0.75],
      [2.0, 0.55, 0.55],
      [2.71, 0.55, 0.42],
      [4.09, 0.42, 0.24],
      [5.4, 0.28, 0.15],
    ],
  },
  'ghanta.wav': {
    baseHz: 98,
    duration: 4.0,
    detune: 0.0015,
    strikes: [0],
    clapper: 0.85,
    partials: [
      [0.5, 0.6, 2.8],
      [1.0, 1.0, 2.0],
      [1.5, 0.5, 1.5],
      [2.0, 0.6, 1.3],
      [2.71, 0.6, 0.9],
      [3.4, 0.4, 0.6],
      [4.09, 0.45, 0.4],
      [5.4, 0.28, 0.26],
      [6.71, 0.18, 0.17],
    ],
  },
  'church.wav': {
    baseHz: 130,
    duration: 4.2,
    detune: 0.0015,
    strikes: [0],
    clapper: 0.7,
    partials: [
      [0.5, 0.7, 2.6],
      [1.0, 1.0, 1.9],
      [2.0, 0.45, 1.3],
      [2.71, 0.5, 0.85],
      [3.4, 0.3, 0.6],
      [4.09, 0.35, 0.4],
      [5.4, 0.2, 0.23],
    ],
  },
  'dinner.wav': {
    baseHz: 330,
    duration: 2.0,
    detune: 0.003,
    strikes: [0, 0.7],
    clapper: 0.4,
    partials: [
      [1.0, 1.0, 1.15],
      [2.0, 0.55, 0.7],
      [2.71, 0.5, 0.5],
      [4.09, 0.35, 0.28],
      [5.4, 0.18, 0.15],
    ],
  },
  'cowbell.wav': {
    baseHz: 392,
    duration: 1.6,
    detune: 0.004,
    strikes: [0],
    clapper: 0.9,
    partials: [
      [1.0, 1.0, 0.7],
      [2.71, 0.6, 0.45],
      [4.09, 0.5, 0.3],
      [5.4, 0.4, 0.18],
      [6.71, 0.3, 0.12],
    ],
  },
  'tibetan.wav': {
    baseHz: 264,
    duration: 4.0,
    detune: 0.001,
    strikes: [0],
    clapper: 0,
    attack: 0.05,
    partials: [
      [0.5, 0.6, 3.4],
      [1.0, 1.0, 3.2],
      [1.5, 0.4, 2.6],
      [2.0, 0.3, 2.0],
      [2.71, 0.12, 1.4],
    ],
  },
  'dingdong.wav': {
    baseHz: 660,
    duration: 1.9,
    detune: 0.003,
    strikes: [0, 0.55],
    clapper: 0.25,
    partials: [
      [1.0, 1.0, 1.1],
      [2.0, 0.6, 0.75],
      [2.71, 0.5, 0.5],
      [3.1, 0.28, 0.36],
      [4.09, 0.32, 0.24],
      [5.4, 0.15, 0.13],
    ],
  },
  'handbell.wav': {
    baseHz: 587,
    duration: 2.1,
    detune: 0.003,
    strikes: [0, 0.85],
    clapper: 0.5,
    partials: [
      [1.0, 1.0, 0.95],
      [2.0, 0.4, 0.65],
      [2.71, 0.55, 0.5],
      [4.09, 0.4, 0.3],
      [5.4, 0.18, 0.17],
    ],
  },
  'school.wav': {
    baseHz: 660,
    duration: 1.7,
    detune: 0.003,
    strikes: [0],
    clapper: 0.2,
    partials: [
      [1.0, 1.0, 1.0],
      [2.0, 0.6, 0.7],
      [2.71, 0.5, 0.45],
      [3.1, 0.28, 0.32],
      [4.09, 0.32, 0.22],
      [5.4, 0.15, 0.12],
    ],
  },
  'alarm.wav': {
    baseHz: 880,
    duration: 1.6,
    detune: 0.004,
    strikes: [0, 0.18, 0.36, 0.54],
    clapper: 0.6,
    partials: [
      [1.0, 1.0, 0.55],
      [2.0, 0.5, 0.45],
      [2.71, 0.45, 0.3],
      [4.09, 0.28, 0.18],
    ],
  },
  'ding.wav': {
    baseHz: 1320,
    duration: 1.1,
    detune: 0.004,
    strikes: [0],
    clapper: 0.15,
    partials: [
      [1.0, 1.0, 0.55],
      [2.0, 0.35, 0.4],
      [2.71, 0.42, 0.28],
      [4.09, 0.2, 0.15],
    ],
  },
};

for (const [file, spec] of Object.entries(TONES)) {
  const pcm = synthesizeBell(spec);
  writeWav(path.join(outDir, file), pcm);
}

console.log('done.');