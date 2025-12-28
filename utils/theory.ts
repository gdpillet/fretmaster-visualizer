import { NOTES, TUNING_INDICES } from '../constants';
import { FretboardNote } from '../types';

/**
 * Calculates all notes on the fretboard that match the given root and intervals.
 */
export const getFretboardNotes = (
  rootNote: string,
  intervals: number[]
): FretboardNote[] => {
  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) return [];

  // Determine the target note indices (0-11) relative to chromatic scale
  const targetIndices = intervals.map((interval) => (rootIndex + interval) % 12);
  const notes: FretboardNote[] = [];

  // Loop through strings (0 = High E, 5 = Low E)
  // Standard Tuning Array is [4, 11, 7, 2, 9, 4] corresponding to indices in NOTES
  TUNING_INDICES.forEach((openStringNoteIndex, stringIdx) => {
    // Loop through frets 0 to 15
    for (let fret = 0; fret <= 15; fret++) {
      const currentNoteIndex = (openStringNoteIndex + fret) % 12;

      // Check if this note is in our target intervals
      if (targetIndices.includes(currentNoteIndex)) {
        // Find which interval this corresponds to (for coloring logic)
        // We need to match the currentNoteIndex back to the interval
        // interval = (currentNoteIndex - rootIndex + 12) % 12
        const interval = (currentNoteIndex - rootIndex + 12) % 12;

        notes.push({
          string: stringIdx + 1, // 1-based index for UI
          fret,
          note: NOTES[currentNoteIndex],
          interval,
          isRoot: interval === 0,
        });
      }
    }
  });

  return notes;
};

export const getIntervalName = (interval: number): string => {
  const names: Record<number, string> = {
    0: 'R',
    1: 'b2',
    2: '2',
    3: 'b3',
    4: '3',
    5: '4',
    6: 'b5',
    7: '5',
    8: 'b6',
    9: '6',
    10: 'b7',
    11: '7'
  };
  return names[interval] || '?';
};

export interface HarmonizedChord {
  degree: string;
  root: string;
  quality: string; // 'Major', 'Minor', 'Diminished', 'Augmented'
  intervalStructure: string; // '1 3 5', '1 b3 5', etc. for debug
}

/**
 * Harmonizes a scale by stacking thirds for each degree.
 * @param scaleNotes Ordered array of note names (e.g. ['C', 'D', 'E', 'F', 'G', 'A', 'B'])
 */
export type HarmonyLevel = 'triad' | '7th' | '9th' | '11th' | '13th';

export const getHarmonizedChords = (scaleNotes: string[], level: HarmonyLevel = 'triad'): HarmonizedChord[] => {
  const len = scaleNotes.length;
  // Standard diatonic is heptatonic (7 notes).
  // If not 7 notes, behavior is undefined but we try best effort wrapping.

  const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  return scaleNotes.map((rootNote, i) => {
    // Stack thirds
    const thirdNote = scaleNotes[(i + 2) % len];
    const fifthNote = scaleNotes[(i + 4) % len];
    const seventhNote = scaleNotes[(i + 6) % len];
    const ninthNote = scaleNotes[(i + 8) % len];
    const eleventhNote = scaleNotes[(i + 10) % len];
    const thirteenthNote = scaleNotes[(i + 12) % len];

    return analyzeChord(rootNote, [thirdNote, fifthNote, seventhNote, ninthNote, eleventhNote, thirteenthNote], i, ROMAN_NUMERALS[i] || '?', level);
  });
};

const analyzeChord = (root: string, extensions: string[], degreeIdx: number, romanBase: string, level: HarmonyLevel): HarmonizedChord => {
  const getIndex = (n: string) => NOTES.indexOf(n);
  const rIdx = getIndex(root);

  // Helper to get semitone interval
  const getSemi = (note: string) => (getIndex(note) - rIdx + 12) % 12;

  const semi3 = getSemi(extensions[0]);
  const semi5 = getSemi(extensions[1]);
  const semi7 = getSemi(extensions[2]);
  const semi9 = getSemi(extensions[3]);
  const semi11 = getSemi(extensions[4]);
  const semi13 = getSemi(extensions[5]);

  let quality = 'Major'; // Default name used for linking
  let shortName = '';
  let roman = romanBase;
  let intervals = [0, semi3, semi5]; // Base Triad

  // --- Triad Analysis ---
  let isMajor = false;
  let isMinor = false;
  let isDim = false;
  let isAug = false;

  if (semi3 === 4 && semi5 === 7) isMajor = true;
  else if (semi3 === 3 && semi5 === 7) isMinor = true;
  else if (semi3 === 3 && semi5 === 6) isDim = true;
  else if (semi3 === 4 && semi5 === 8) isAug = true;

  // --- Base Roman ---
  if (isMajor || isAug) {
    // Uppercase I, etc
  } else if (isMinor || isDim) {
    roman = romanBase.toLowerCase();
  }

  if (level === 'triad') {
    if (isMajor) quality = 'Major';
    if (isMinor) quality = 'Minor';
    if (isDim) { quality = 'Diminished'; roman += '°'; }
    if (isAug) { quality = 'Augmented'; roman += '+'; }
    if (semi5 === 6 && semi3 === 4) { quality = '7b5 (Alt)'; roman += '(b5)'; } // Lydian workaround?
  }

  if (level !== 'triad') {
    // Add 7th
    intervals.push(semi7);

    if (isMajor && semi7 === 11) { quality = 'Major 7'; roman += 'maj7'; }
    else if (isMajor && semi7 === 10) { quality = 'Dominant 7'; roman += '7'; }
    else if (isMinor && semi7 === 10) { quality = 'Minor 7'; roman += '7'; }
    else if (isMinor && semi7 === 11) { quality = 'Minor Major 7'; roman += 'm(maj7)'; }
    else if (isDim && semi7 === 10) { quality = 'Half-Diminished (m7b5)'; roman += 'ø7'; }
    else if (isDim && semi7 === 9) { quality = 'Diminished 7'; roman += '°7'; }
    else if (isAug && semi7 === 10) { quality = '7#5 (Alt)'; roman += '+7'; }
    else if (isAug && semi7 === 11) { quality = 'Major 7'; roman += '+maj7'; } // AugMaj7
  }

  if (level === '9th' || level === '11th' || level === '13th') {
    intervals.push(semi9);
    // Simplify logic: Just map to common names
    // If Major7 + 9 (2) -> Maj9
    // If Dom7 + 9 -> Dom9
    // If Min7 + 9 -> Min9
    // If HalfDim + 9 (2 or 1?) -> usually m9b5? Not in our list.
    // 7b9? 

    // Check semi9
    const isNatural9 = semi9 === 2;
    const isFlat9 = semi9 === 1;
    const isSharp9 = semi9 === 3;

    if (quality === 'Major 7' && isNatural9) { quality = 'Major 9'; roman = roman.replace('maj7', 'maj9'); }
    if (quality === 'Dominant 7') {
      if (isNatural9) { quality = 'Dominant 9'; roman = roman.replace('7', '9'); }
      if (isFlat9) { quality = '7b9'; roman += 'b9'; }
      if (isSharp9) { quality = '7#9 (Hendrix)'; roman += '#9'; }
    }
    if (quality === 'Minor 7' && isNatural9) { quality = 'Minor 9'; roman = roman.replace('7', '9'); }
  }

  if (level === '11th') {
    // We don't have many 11th chords in CHORDS list except Maj11, Min11, Dom11
    intervals.push(semi11);
    if (quality.includes('Major') || quality.includes('maj')) { quality = 'Major 11'; roman = roman.replace('9', '11').replace('7', '11'); }
    if (quality.includes('Minor')) { quality = 'Minor 11'; roman = roman.replace('9', '11').replace('7', '11'); }
    if (quality.includes('Dominant') || quality === '9') { quality = 'Dominant 11'; roman = roman.replace('9', '11').replace('7', '11'); }
  }

  if (level === '13th') {
    intervals.push(semi11); // standard stacking
    intervals.push(semi13);
    if (quality.includes('Major') || quality.includes('maj')) { quality = 'Major 13'; roman = roman.replace('11', '13').replace('9', '13').replace('7', '13'); }
    if (quality.includes('Minor')) { quality = 'Minor 13'; roman = roman.replace('11', '13').replace('9', '13').replace('7', '13'); }
    if (quality.includes('Dominant') || quality.includes('11') || quality === '9') { quality = 'Dominant 13'; roman = roman.replace('11', '13').replace('9', '13').replace('7', '13'); }
  }

  return {
    degree: roman,
    root,
    quality,
    intervalStructure: intervals.join(' ')
  };
};
