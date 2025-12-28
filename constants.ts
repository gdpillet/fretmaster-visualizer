import { ScaleDefinition, ChordDefinition } from './types';

// Chromatic Scale (Sharps preferred for simplicity in MVP)
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTE_COLORS: Record<string, string> = {
  'C': 'bg-red-600',
  'C#': 'bg-pink-500',
  'D': 'bg-orange-500',
  'D#': 'bg-amber-700',
  'E': 'bg-yellow-400 text-black', // Yellow often needs dark text for contrast
  'F': 'bg-green-700',
  'F#': 'bg-green-400 text-black',
  'G': 'bg-blue-700',
  'G#': 'bg-sky-400 text-black',
  'A': 'bg-black',
  'A#': 'bg-neutral-500',
  'B': 'bg-fuchsia-600'
};

// Standard Tuning (High E to Low E): E B G D A E
// Stored as indices in the NOTES array
export const TUNING_INDICES = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E

export const SCALES: ScaleDefinition[] = [
  { name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10] }, // Natural Minor
  { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] }, // Jazz/Ascending Melodic Minor
  { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
  { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
  { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
];

export const CHORDS: ChordDefinition[] = [
  // --- Essentials (The Big 5) ---
  { name: 'Major', intervals: [0, 4, 7], description: 'Happy, stable, fundamental' },
  { name: 'Minor', intervals: [0, 3, 7], description: 'Sad, serious, emotional' },
  { name: 'Dominant 7', intervals: [0, 4, 7, 10], description: 'Bluesy, tension, wants to resolve' },
  { name: 'Major 7', intervals: [0, 4, 7, 11], description: 'Dreamy, smooth, jazz staple' },
  { name: 'Minor 7', intervals: [0, 3, 7, 10], description: 'Mellow, soulful, r&b' },

  // --- Rock & Pop Staples ---
  { name: '5 (Power Chord)', intervals: [0, 7], description: 'Rock, distortion, punchy' },
  { name: 'Sus4', intervals: [0, 5, 7], description: 'Tension, usually resolves to Major' },
  { name: 'Sus2', intervals: [0, 2, 7], description: 'Bright, open, airy' },
  { name: 'Add 9', intervals: [0, 4, 7, 2], description: 'Beautiful, pop ballad sound' },

  // --- Intermediate Colors ---
  { name: 'Major 6', intervals: [0, 4, 7, 9], description: 'Sweet, country/swing vibe' },
  { name: 'Minor 6', intervals: [0, 3, 7, 9], description: 'Dark, mysterious, spy movie' },
  { name: 'Diminished', intervals: [0, 3, 6], description: 'Tense, dramatic, unstable' },
  { name: 'Augmented', intervals: [0, 4, 8], description: 'Unsettled, floating, spacey' },

  // --- Jazz & Advanced ---
  { name: 'Minor Major 7', intervals: [0, 3, 7, 11], description: 'Noir, intense, Hitchcock-style' },
  { name: 'Half-Diminished (m7b5)', intervals: [0, 3, 6, 10], description: 'Tragic, jazz minor 2-5-1' },
  { name: 'Diminished 7', intervals: [0, 3, 6, 9], description: 'Symmetrical, passing chord' },
  { name: 'Major 9', intervals: [0, 4, 7, 11, 2], description: 'Lush, sophisticated' },
  { name: 'Minor 9', intervals: [0, 3, 7, 10, 2], description: 'Deep, rich, funk/soul' },
  { name: 'Dominant 9', intervals: [0, 4, 7, 10, 2], description: 'Funky, "James Brown" chord' },

  // --- Altered (Hendrix/Neo-Soul) ---
  { name: '7#9 (Hendrix)', intervals: [0, 4, 7, 10, 3], description: 'Purple Haze, rock edge' },
  { name: '7b9', intervals: [0, 4, 7, 10, 1], description: 'Dark tension, classical resolve' },
  { name: '11th / 13th', intervals: [0, 4, 7, 10, 2, 5], description: 'Complex, modern neo-soul' }, // Merged for simplicity or keep separate? Let's keep separate but fewer.
  { name: 'Major 13', intervals: [0, 4, 7, 11, 2, 9], description: 'Very lush, ending chord' },
];