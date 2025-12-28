import React from 'react';
import { NOTES, SCALES, CHORDS } from '../constants';
import { ViewMode } from '../types';
import { Music, Zap, Layout, Smartphone, Moon, Sun, Layers, Binary } from 'lucide-react';

interface ControlsProps {
  root: string;
  setRoot: (r: string) => void;
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  typeIndex: number;
  setTypeIndex: (i: number) => void;
  orientation: 'horizontal' | 'vertical';
  setOrientation: (o: 'horizontal' | 'vertical') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  showFingering: boolean;
  setShowFingering: (s: boolean) => void;
}

// Interval definitions for the visualization grid
const INTERVAL_GRID = [
  { label: 'R', semitones: 0, fullLabel: 'Root' },
  { label: 'b2', semitones: 1, fullLabel: 'Minor 2nd' },
  { label: '2', semitones: 2, fullLabel: 'Major 2nd' },
  { label: 'b3', semitones: 3, fullLabel: 'Minor 3rd' },
  { label: '3', semitones: 4, fullLabel: 'Major 3rd' },
  { label: '4', semitones: 5, fullLabel: 'Perfect 4th' },
  { label: 'b5', semitones: 6, fullLabel: 'Dim 5th' },
  { label: '5', semitones: 7, fullLabel: 'Perfect 5th' },
  { label: '#5', semitones: 8, fullLabel: 'Aug 5th / b6' },
  { label: '6', semitones: 9, fullLabel: 'Major 6th' },
  { label: 'b7', semitones: 10, fullLabel: 'Minor 7th' },
  { label: '7', semitones: 11, fullLabel: 'Major 7th' },
];

export const Controls: React.FC<ControlsProps> = ({
  root,
  setRoot,
  mode,
  setMode,
  typeIndex,
  setTypeIndex,
  orientation,
  setOrientation,
  theme,
  toggleTheme,
  showFingering,
  setShowFingering
}) => {

  // Helper to find index of specific scales for the Quick Actions buttons
  const findScaleIndex = (nameIncludes: string) => {
    return SCALES.findIndex(s => s.name.toLowerCase().includes(nameIncludes.toLowerCase()));
  };

  const naturalMinorIdx = findScaleIndex('Minor (Aeolian)');
  const harmonicMinorIdx = findScaleIndex('Harmonic Minor');
  const melodicMinorIdx = findScaleIndex('Melodic Minor');

  // Check if current selection is one of the minors
  const isMinorFamily = mode === 'scale' &&
    [naturalMinorIdx, harmonicMinorIdx, melodicMinorIdx].includes(typeIndex);

  // Get current active intervals
  const currentIntervals = (mode === 'scale' ? SCALES : CHORDS)[typeIndex].intervals;

  return (
    <div className="bg-card border-b md:border-b-0 md:border-r border-border p-6 flex flex-col gap-6 h-full transition-colors duration-300 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-1">
            FretMaster
          </h1>
          <p className="text-xs text-muted-foreground">
            Interactive visualizer.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 bg-muted p-1 rounded-lg">
        <button
          onClick={() => { setMode('scale'); setTypeIndex(0); }}
          className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'scale'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Zap size={16} /> Scale
        </button>
        <button
          onClick={() => { setMode('chord'); setTypeIndex(0); }}
          className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${mode === 'chord'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <Music size={16} /> Chord
        </button>
      </div>

      {/* Root Note Grid Selector (Replaces Dropdown) */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Root Note
        </label>
        <div className="grid grid-cols-4 gap-2">
          {NOTES.map((note) => {
            const isActive = root === note;
            return (
              <button
                key={note}
                onClick={() => setRoot(note)}
                className={`
                  h-10 text-sm font-bold rounded-md transition-all border
                  ${isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted'}
                `}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type Selector & Minor Variations */}
      <div className="space-y-4">
        {/* Fingering Toggle (Chord Mode Only) */}
        {mode === 'chord' && (
          <div className="pb-2 mb-2 border-b border-border">
            <button
              onClick={() => setShowFingering(!showFingering)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-xs font-bold uppercase tracking-wider transition-all ${showFingering
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-card border-border text-muted-foreground hover:bg-muted'
                }`}
            >
              <span>Show Fingering (1-4)</span>
              <span className={`block w-2 h-2 rounded-full ${showFingering ? 'bg-primary' : 'bg-muted-foreground'}`} />
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {mode === 'scale' ? "Pattern Type" : "Chord Quality"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(mode === 'scale' ? SCALES : CHORDS).map((item, idx) => (
              <button
                key={item.name}
                onClick={() => setTypeIndex(idx)}
                className={`
                  flex flex-col justify-center py-2 px-3 rounded-md border text-left transition-all leading-tight
                  ${typeIndex === idx
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-primary/30'}
                `}
              >
                <span className="text-xs font-bold truncate w-full">{item.name}</span>
                {/* Render description if available (for chords) */}
                {(item as any).description && (
                  <span className={`text-[10px] mt-0.5 truncate w-full ${typeIndex === idx ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {(item as any).description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orientation Toggle */}
      <div className="pt-4 border-t border-border mt-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setOrientation('vertical')}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${orientation === 'vertical'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-muted text-muted-foreground'
              }`}
          >
            <Smartphone size={16} />
            <span className="text-xs font-medium">Vertical</span>
          </button>
          <button
            onClick={() => setOrientation('horizontal')}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${orientation === 'horizontal'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-muted text-muted-foreground'
              }`}
          >
            <Layout size={16} />
            <span className="text-xs font-medium">Horizontal</span>
          </button>
        </div>
      </div>
    </div>
  );
};