import React, { useState, useMemo, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Fretboard } from './components/Fretboard';
import { NOTES, SCALES, CHORDS, NOTE_COLORS } from './constants';
import { getFretboardNotes, getIntervalName } from './utils/theory';
import { ViewMode } from './types';

const App: React.FC = () => {
  // State
  const [root, setRoot] = useState<string>('C');
  const [mode, setMode] = useState<ViewMode>('scale');
  const [typeIndex, setTypeIndex] = useState<number>(0); // Index in SCALES or CHORDS array
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Theme Toggle Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Responsive check for initial load
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOrientation('horizontal');
      } else {
        setOrientation('vertical');
      }
    };

    // Set initial
    handleResize();

    // Listen
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Derived Data for Fretboard visualization
  const currentNotes = useMemo(() => {
    const intervals = mode === 'scale'
      ? SCALES[typeIndex].intervals
      : CHORDS[typeIndex].intervals;

    return getFretboardNotes(root, intervals);
  }, [root, mode, typeIndex]);

  // Derived Data for Header Display (Ordered Notes)
  const orderedNotes = useMemo(() => {
    const intervals = mode === 'scale'
      ? SCALES[typeIndex].intervals
      : CHORDS[typeIndex].intervals;

    const rootIdx = NOTES.indexOf(root);
    if (rootIdx === -1) return [];

    return intervals.map(interval => {
      const noteIdx = (rootIdx + interval) % 12;
      return NOTES[noteIdx];
    });
  }, [root, mode, typeIndex]);

  const currentTitle = useMemo(() => {
    const typeName = mode === 'scale'
      ? SCALES[typeIndex].name
      : CHORDS[typeIndex].name;
    return `${root} ${typeName}`;
  }, [root, mode, typeIndex]);

  const currentIntervals = useMemo(() => {
    return mode === 'scale'
      ? SCALES[typeIndex].intervals
      : CHORDS[typeIndex].intervals;
  }, [mode, typeIndex]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden transition-colors duration-300">

      {/* Sidebar / Controls */}
      <aside className="w-full md:w-80 flex-shrink-0 z-20">
        <Controls
          root={root}
          setRoot={setRoot}
          mode={mode}
          setMode={setMode}
          typeIndex={typeIndex}
          setTypeIndex={setTypeIndex}
          orientation={orientation}
          setOrientation={setOrientation}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </aside>

      {/* Main Display Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-secondary/20">
        {/* Top Bar info */}
        <div className="p-4 md:p-6 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">{currentTitle}</h2>
            <div className="flex gap-4 mt-4">
              {orderedNotes.map((note, idx) => {
                const colorClass = NOTE_COLORS[note] || 'bg-secondary';
                const hasTextClass = colorClass.includes('text-');
                // If the color class doesn't specify text color, default to white.
                // Most standard tailwind colors like red-600 need white text for contrast.
                const textColor = hasTextClass ? '' : 'text-white';

                return (
                  <div key={note} className="flex flex-col items-center gap-1">
                    <div className={`
                      w-10 h-10 md:w-12 md:h-12 
                      rounded-full flex items-center justify-center 
                      text-base md:text-lg font-bold shadow-md
                      ${colorClass} ${textColor}
                    `}>
                      {note}
                    </div>
                    <span className="text-sm md:text-base font-bold text-muted-foreground">
                      {getIntervalName(currentIntervals[idx])}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fretboard Container */}
        <div className="flex-1 relative overflow-auto fretboard-scroll p-4 md:p-10 flex items-center justify-center">
          <Fretboard
            notes={currentNotes}
            orientation={orientation}
          />
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-2 right-4 text-[10px] text-muted-foreground pointer-events-none">
          MVP Visualizer v1.1
        </div>
      </main>

    </div>
  );
};

export default App;