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
