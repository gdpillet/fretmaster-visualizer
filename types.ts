export type Note = string;

export interface ScaleDefinition {
  name: string;
  intervals: number[];
}

export interface ChordDefinition {
  name: string;
  intervals: number[];
}

export type ViewMode = 'scale' | 'chord';

export interface FretboardNote {
  string: number; // 1-6 (High E is 1)
  fret: number;
  note: string;
  interval: number; // Interval from root
  isRoot: boolean;
}

export interface NotePosition {
  stringIdx: number; // 0-5 (0 is High E)
  fret: number;
}
