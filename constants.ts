import { ScaleDefinition, ChordDefinition } from './types';

// Chromatic Scale (Sharps preferred for simplicity in MVP)
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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
  { name: 'Major', intervals: [0, 4, 7] },
  { name: 'Minor', intervals: [0, 3, 7] },
  { name: '5 (Power Chord)', intervals: [0, 7] },
  { name: 'Major 7', intervals: [0, 4, 7, 11] },
  { name: 'Minor 7', intervals: [0, 3, 7, 10] },
  { name: 'Dominant 7', intervals: [0, 4, 7, 10] },
  { name: 'Sus2', intervals: [0, 2, 7] },
  { name: 'Sus4', intervals: [0, 5, 7] },
  { name: 'Diminished', intervals: [0, 3, 6] },
  { name: 'Augmented', intervals: [0, 4, 8] },
];