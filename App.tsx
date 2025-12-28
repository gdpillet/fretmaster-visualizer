import React, { useState, useMemo, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Controls } from './components/Controls';
import { Fretboard } from './components/Fretboard';
import { ChordLayout } from './components/ChordLayout';
import { Binary, Music } from 'lucide-react';
import { NOTES, SCALES, CHORDS, NOTE_COLORS } from './constants';
import { getFretboardNotes, getIntervalName, getHarmonizedChords, HarmonyLevel } from './utils/theory';
import { generateChordVoicings } from './utils/chord-generator';
import { ViewMode } from './types';

const App: React.FC = () => {
  // State
  const [root, setRoot] = useState<string>('C');
  const [mode, setMode] = useState<ViewMode>('scale');
  const [typeIndex, setTypeIndex] = useState<number>(0); // Index in SCALES or CHORDS array
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showFingering, setShowFingering] = useState<boolean>(true);
  const [harmonyLevel, setHarmonyLevel] = useState<HarmonyLevel>('triad');
  const [selectedVoicingId, setSelectedVoicingId] = useState<string | null>(null);

  // Reset selected voicing when root/type changes
  useEffect(() => {
    setSelectedVoicingId(null);
  }, [root, typeIndex, mode]);

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

  const chordVoicings = useMemo(() => {
    if (mode !== 'chord') return [];
    const intervals = CHORDS[typeIndex].intervals;
    return generateChordVoicings(root, intervals, CHORDS[typeIndex].name);
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

  const diatonicChords = useMemo(() => {
    if (mode !== 'scale') return [];
    return getHarmonizedChords(orderedNotes, harmonyLevel);
  }, [mode, orderedNotes, harmonyLevel]);

  const handleChordClick = (newRoot: string, quality: string) => {
    // Switch to Chord Mode
    setMode('chord');
    setRoot(newRoot);

    // Find the chord definition that matches the quality
    // We need to map 'Major', 'Minor', 'Diminished' etc onto our CHORDS list names
    // Simple mapping for now:
    let targetName = quality;
    if (quality === 'b5') targetName = 'Major'; // Fallback or specific handling?

    const idx = CHORDS.findIndex(c => c.name === targetName);
    if (idx !== -1) {
      setTypeIndex(idx);
    } else {
      // Fallback to Major or Minor if exact match fail
      // e.g. if we have 'Diminished' and CHORDS has 'Diminished' it works.
      setTypeIndex(0);
    }
  };

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
          showFingering={showFingering}
          setShowFingering={setShowFingering}
        />
      </aside>

      {/* Main Display Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-secondary/20">
        {/* Top Bar info */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm z-10 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
          {/* Left: Title + Scale Notes */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">{currentTitle}</h2>
              {mode === 'scale' && (
                <div className="flex gap-1">
                  {(['triad', '7th', '9th', '11th', '13th'] as HarmonyLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setHarmonyLevel(lvl)}
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-all ${harmonyLevel === lvl
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                        }`}
                    >
                      {lvl === 'triad' ? '3' : lvl}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {orderedNotes.map((note, idx) => {
                const colorClass = NOTE_COLORS[note] || 'bg-secondary';
                // Smaller bubbles
                return (
                  <div key={note} className="flex flex-col items-center gap-0.5">
                    <div className={`
                      w-8 h-8
                      rounded-full flex items-center justify-center
                      text-xs font-bold shadow-sm
                      ${colorClass} text-white
                    `}>
                      {note}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {getIntervalName(currentIntervals[idx])}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Diatonic Chords (Scale Mode Only) */}
          {mode === 'scale' && diatonicChords.length > 0 && (
            <div className="flex-1 w-full overflow-x-auto pb-2 xl:pb-0">
              <div className="flex gap-2 xl:justify-end min-w-max px-2">
                {diatonicChords.map((chord) => {
                  // Generate a preview voicing for this chord
                  // We need to approximate the interval list from the quality string?
                  // actually generateChordVoicings needs intervals.
                  // We constructed intervalStructure string in theory.ts "R-4-7".
                  // Let's parse it back or just look up CHORDS by quality name?

                  // Better approach: Look up CHORDS list for 'quality'.
                  const chordDef = CHORDS.find(c => c.name === chord.quality);
                  const intervals = chordDef ? chordDef.intervals : [0, 4, 7]; // fallback Major

                  const voicings = generateChordVoicings(chord.root, intervals, chord.quality);
                  // Pick the best one? e.g. Open position or first available.
                  // Let's pick one with startingFret <= 5 ideally for simplicity, or just the first.
                  const bestVoicing = voicings.length > 0 ? voicings[0] : null;

                  return (
                    <button
                      key={`${chord.degree}-${chord.root}`}
                      onClick={() => handleChordClick(chord.root, chord.quality)}
                      className="
                          relative flex flex-col items-center p-3 rounded-xl border border-border bg-card/40
                          hover:bg-primary/5 hover:border-primary/50 transition-all group
                          w-[140px] h-[200px] overflow-visible flex-shrink-0
                        "
                    >
                      <div className="flex justify-between w-full px-1 mb-2 z-10">
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">
                          {chord.degree}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {chord.root}{chord.quality === 'Major' ? '' : (chord.degree.includes('°') ? 'dim' : (chord.degree === chord.degree.toLowerCase() ? 'm' : ''))}
                        </span>
                      </div>

                      {/* Mini Visualization */}
                      {bestVoicing ? (
                        <div className="transform scale-[0.65] origin-top -mt-2 pointer-events-none opacity-90 group-hover:opacity-100">
                          <ChordLayout voicing={bestVoicing} showFingering={false} minimal={true} />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[10px] text-muted-foreground">
                          No shape
                        </div>
                      )}

                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Fretboard / Chord Container */}
        <div className="flex-1 relative overflow-auto fretboard-scroll">
          {mode === 'scale' ? (
            <div className="min-h-full flex items-center justify-center p-8">
              <Fretboard
                notes={currentNotes}
                orientation={orientation}
                theme={theme}
              />
            </div>
          ) : (
            <div className="flex h-full w-full gap-6 p-6">
              {chordVoicings.length > 0 ? (
                <>
                  {/* LEFT COLUMN - FIXED FEATURED CHORD */}
                  <div className="w-[45%] flex-shrink-0 flex flex-col items-center justify-center">
                    {(() => {
                      const selectedId = selectedVoicingId || chordVoicings[0].id;
                      const mainVoicing = chordVoicings.find(v => v.id === selectedId) || chordVoicings[0];

                      // Extract notes for Info Panel
                      const notesInfo = mainVoicing.strings.filter(s => s.fret !== -1).sort((a, b) => a.interval - b.interval);
                      const uniqueIntervals = Array.from(new Set(notesInfo.map(n => n.interval))).map(i => {
                        return notesInfo.find(n => n.interval === i)!;
                      });

                      return (
                        <div className="flex flex-col items-center gap-8 w-full max-w-md">
                          {/* Large Chord Diagram */}
                          <div className="relative flex flex-col items-center">
                            <div className="transform scale-150 origin-center">
                              <ChordLayout voicing={mainVoicing} showFingering={showFingering} minimal={true} />
                            </div>

                            {/* Chord Title */}
                            <h3 className="mt-16 text-3xl font-black text-foreground tracking-tight whitespace-nowrap">
                              {mainVoicing.name.split(' (')[0]}
                              {mainVoicing.name.includes(' (') && (
                                <span className="text-muted-foreground text-2xl ml-2 font-bold">
                                  ({mainVoicing.name.split(' (')[1]}
                                </span>
                              )}
                            </h3>
                          </div>

                          {/* Notes Info Legend */}
                          <div className="w-full bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-3">
                              <Binary size={14} /> Notes in this Chord
                            </div>
                            <div className="flex flex-wrap justify-center gap-6">
                              {uniqueIntervals.map(note => (
                                <div key={note.note} className="flex items-center gap-3">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                                    {getIntervalName(note.interval) === 'R' ? 'Root' : getIntervalName(note.interval)} :
                                  </span>
                                  <span className={`text-lg font-bold ${NOTE_COLORS[note.note]} bg-clip-text text-transparent`}>
                                    {note.note}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* RIGHT COLUMN - SCROLLABLE VARIATIONS GRID */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-3 gap-6 p-2 pb-6">
                      {chordVoicings.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVoicingId(v.id)}
                          className={`
                            relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300
                            ${(selectedVoicingId || chordVoicings[0].id) === v.id
                              ? 'bg-primary/10 border-primary ring-2 ring-primary/50 shadow-2xl scale-[1.02]'
                              : 'bg-card/50 border-border hover:bg-card hover:border-primary/50 opacity-70 hover:opacity-100'}
                          `}
                        >
                          <div className="pointer-events-none transform scale-100 mb-2">
                            <ChordLayout voicing={v} showFingering={showFingering} minimal={true} />
                          </div>
                          <div className={`text-[11px] font-black uppercase tracking-widest ${(selectedVoicingId || chordVoicings[0].id) === v.id ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            {v.startingFret}FR
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Music size={32} className="opacity-20" />
                  </div>
                  <p className="text-muted-foreground">No automatic voicings found for this pattern.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-2 right-4 text-[10px] text-muted-foreground flex items-center gap-1">
          <span>Designed and Developed by</span>
          <a
            href="https://gdpillet.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:text-primary/80 transition-colors underline decoration-dotted underline-offset-2"
          >
            Gaston Pillet
          </a>
          <span>—</span>
          <span>MVP Visualizer v1.1</span>
        </div>
      </main>

      <Analytics />
    </div>
  );
};

export default App;