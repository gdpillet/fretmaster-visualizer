import React, { useState, useMemo, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Fretboard } from './components/Fretboard';
import { ChordLayout } from './components/ChordLayout';
import { Binary, Music, X, RefreshCcw, Play } from 'lucide-react';
import { NOTES, SCALES, CHORDS, NOTE_COLORS } from './constants';
import { getFretboardNotes, getIntervalName, getHarmonizedChords, HarmonyLevel } from './utils/theory';
import { generateChordVoicings } from './utils/chord-generator';
import { audioEngine } from './utils/audio-engine';
import { ViewMode } from './types';
import { RootSelector } from './components/RootSelector';
import { PatternSelector } from './components/PatternSelector';

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

  // Dismissed chord voicings (shown grayed out at the end)
  const [dismissedVoicingIds, setDismissedVoicingIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('dismissedChordVoicings');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persist dismissed voicings to localStorage
  useEffect(() => {
    localStorage.setItem('dismissedChordVoicings', JSON.stringify(Array.from(dismissedVoicingIds)));
  }, [dismissedVoicingIds]);

  // Custom chord voicing order (persisted in localStorage per chord)
  const [customVoicingOrder, setCustomVoicingOrder] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem('customChordOrder');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Drag state for visual feedback
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Handle dismissing/restoring a chord voicing
  const handleDismissVoicing = (voicingId: string) => {
    setDismissedVoicingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(voicingId)) {
        newSet.delete(voicingId); // Restore
      } else {
        newSet.add(voicingId); // Dismiss
      }
      return newSet;
    });
  };

  // Apply custom voicing order
  const orderedVoicings = useMemo(() => {
    if (mode !== 'chord') return [];
    const orderKey = `${root}-${CHORDS[typeIndex].name}`;
    const customOrder = customVoicingOrder[orderKey];

    if (!customOrder || customOrder.length === 0) return chordVoicings;

    // Sort by custom order, putting unordered items at the end
    return [...chordVoicings].sort((a, b) => {
      const aIndex = customOrder.indexOf(a.id);
      const bIndex = customOrder.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [chordVoicings, customVoicingOrder, root, typeIndex, mode]);

  // Drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent, voicingId: string, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('voicingId', voicingId);
    e.dataTransfer.setData('sourceIndex', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'));

    if (sourceIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    // Reorder array
    const newOrder = [...orderedVoicings];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Save to localStorage
    const orderKey = `${root}-${CHORDS[typeIndex].name}`;
    const newCustomOrder = {
      ...customVoicingOrder,
      [orderKey]: newOrder.map(v => v.id)
    };
    setCustomVoicingOrder(newCustomOrder);
    localStorage.setItem('customChordOrder', JSON.stringify(newCustomOrder));

    setDraggedIndex(null);
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

            {/* Play Scale Button */}
            {mode === 'scale' && (
              <button
                onClick={() => {
                  let currentOctave = 3;
                  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

                  orderedNotes.forEach((note, idx) => {
                    const noteIndex = notes.indexOf(note);
                    const prevNoteIndex = idx > 0 ? notes.indexOf(orderedNotes[idx - 1]) : -1;

                    // Logic to increment octave
                    // Usually scales go UP in pitch.
                    // If current note index is LOWER than previous note index, we likely crossed the octave boundary (B -> C)
                    // e.g. B (11) -> C (0)
                    if (prevNoteIndex !== -1 && noteIndex < prevNoteIndex) {
                      currentOctave++;
                    }

                    audioEngine.playNote(note, currentOctave, idx * 0.3, 1.0);
                  });

                  // Play Root one octave up to resolve? 
                  // Usually scales repeat the Octave.
                  // Let's check if the user wants just the displayed notes or a full octave range.
                  // renderedNotes usually is 7 notes for a major scale.
                  // Let's add the octave root for resolution if it's a 7 note scale.
                  if (orderedNotes.length === 7) {
                    const rootNote = orderedNotes[0];
                    const rootIndex = notes.indexOf(rootNote);
                    const lastNoteIndex = notes.indexOf(orderedNotes[orderedNotes.length - 1]);
                    if (rootIndex < lastNoteIndex) {
                      // If root index < last note index, it means we haven't wrapped YET in the last step?
                      // Actually we compare Root vs Last.
                      // B (11) -> C (0) (wrapped).
                      // If Last is B(11) and Root is C(0). B->C wraps.
                      // If Last is G(7) and Root is A(9). G->A doesn't wrap? Wait.
                    }

                    // Just blindly play root one octave up from start?
                    // Wait, we need to track currentOctave properly across the whole sequence.
                    // Let's just play the notes in 'orderedNotes' for now as that's what's visible.
                    // Or add the resolution note at the end.
                    const finalOctave = currentOctave + (notes.indexOf(orderedNotes[0]) < notes.indexOf(orderedNotes[orderedNotes.length - 1]) ? 1 : 0);
                    audioEngine.playNote(orderedNotes[0], finalOctave, orderedNotes.length * 0.3, 1.0);
                  }
                }}
                className="
                  mt-2 px-6 py-1.5 rounded-full
                  bg-emerald-500/10 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400
                  hover:bg-emerald-500 hover:text-white transition-all
                  flex items-center gap-2 text-xs font-bold uppercase tracking-wider
                "
              >
                <Play size={10} fill="currentColor" /> Play Scale
              </button>
            )}
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

                  // Pick the best voicing:
                  // 1. Check if there is a custom order for this chord
                  const orderKey = `${chord.root}-${chord.quality}`;
                  const customOrder = customVoicingOrder[orderKey];

                  let bestVoicing = null;

                  if (customOrder && customOrder.length > 0) {
                    // Try to find the user's preferred first voicing
                    const preferredId = customOrder[0];
                    bestVoicing = voicings.find(v => v.id === preferredId) || null;
                  }

                  // 2. Fallback to default logic (first one)
                  if (!bestVoicing && voicings.length > 0) {
                    bestVoicing = voicings[0];
                  }

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

        {/* NEW: Root & Pattern Selectors in Main Area */}
        <div className="flex flex-col z-10 w-full relative">
          <RootSelector root={root} setRoot={setRoot} />
          <PatternSelector
            mode={mode}
            typeIndex={typeIndex}
            setTypeIndex={setTypeIndex}
            showFingering={showFingering}
            setShowFingering={setShowFingering}
          />
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
            <div className="flex h-full w-full gap-6 p-6 overflow-hidden">
              {orderedVoicings.length > 0 ? (
                <>
                  {/* LEFT COLUMN - FIXED FEATURED CHORD */}
                  <div className="w-[350px] xl:w-[400px] flex-shrink-0 flex flex-col items-center pt-4 overflow-y-auto custom-scrollbar">
                    {(() => {
                      const selectedId = selectedVoicingId || orderedVoicings[0].id;
                      const mainVoicing = orderedVoicings.find(v => v.id === selectedId) || orderedVoicings[0];

                      // Extract notes for Info Panel
                      const notesInfo = mainVoicing.strings.filter(s => s.fret !== -1).sort((a, b) => a.interval - b.interval);
                      const uniqueIntervals = Array.from(new Set(notesInfo.map(n => n.interval))).map(i => {
                        return notesInfo.find(n => n.interval === i)!;
                      });

                      return (
                        <div className="flex flex-col items-center gap-6 w-full">
                          {/* Large Chord Diagram */}
                          <div className="relative flex flex-col items-center">
                            <div className="transform scale-125 origin-center mb-4">
                              <ChordLayout voicing={mainVoicing} showFingering={showFingering} minimal={true} />
                            </div>

                            {/* Strum Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const notesToPlay = mainVoicing.strings
                                  .filter(s => s.fret !== -1)
                                  .map(s => {
                                    // Calculate Octave logic
                                    const stringNum = s.string;
                                    const baseSemitones = [52, 47, 43, 38, 33, 28][stringNum - 1];
                                    const totalSemitones = baseSemitones + s.fret;
                                    const octave = Math.floor(totalSemitones / 12);
                                    return { note: s.note!, octave };
                                  });
                                audioEngine.playChord(notesToPlay);
                              }}
                              className="
                                flex items-center gap-2 px-5 py-2 rounded-full
                                bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-primary/25
                                hover:scale-105 active:scale-95 transition-all
                                group z-10 -mt-2
                              "
                            >
                              <div className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                                <Play size={12} fill="currentColor" />
                              </div>
                              <span className="tracking-wide text-xs">STRUM</span>
                            </button>

                            {/* Chord Title */}
                            <h3 className="mt-4 text-2xl font-black text-foreground tracking-tight whitespace-nowrap">
                              {mainVoicing.name.split(' (')[0]}
                              {mainVoicing.name.includes(' (') && (
                                <span className="text-muted-foreground text-xl ml-2 font-bold">
                                  ({mainVoicing.name.split(' (')[1]}
                                </span>
                              )}
                            </h3>
                          </div>

                          {/* Notes Info Legend - Compact */}
                          <div className="w-full bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-xl">
                            <div className="flex flex-wrap justify-center gap-3">
                              {uniqueIntervals.map(note => (
                                <div key={note.note} className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                                    {getIntervalName(note.interval) === 'R' ? 'Root' : getIntervalName(note.interval)}
                                  </span>
                                  <span className={`text-sm font-bold ${NOTE_COLORS[note.note]} bg-clip-text text-transparent`}>
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
                  <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-6">
                      {orderedVoicings.map((v, index) => {
                        const isSelected = (selectedVoicingId || orderedVoicings[0].id) === v.id;
                        const isDragging = draggedIndex === index;
                        const isDismissed = dismissedVoicingIds.has(v.id);

                        return (
                          <div
                            key={v.id}
                            className="relative group"
                            draggable={!isDismissed}
                            onDragStart={(e) => !isDismissed && handleDragStart(e, v.id, index)}
                            onDragOver={!isDismissed ? handleDragOver : undefined}
                            onDragEnd={!isDismissed ? handleDragEnd : undefined}
                            onDrop={(e) => !isDismissed && handleDrop(e, index)}
                          >
                            <button
                              onClick={() => setSelectedVoicingId(v.id)}
                              disabled={isDismissed}
                              className={`
                                w-full relative flex flex-col items-center p-2 py-4 rounded-xl border transition-all duration-300
                                ${isSelected && !isDismissed
                                  ? 'bg-primary/10 border-primary ring-2 ring-primary/50 shadow-xl scale-[1.02]'
                                  : isDismissed
                                    ? 'bg-card/20 border-border/30 opacity-40 cursor-not-allowed'
                                    : 'bg-card/50 border-border hover:bg-card hover:border-primary/50 opacity-70 hover:opacity-100'}
                                ${isDragging ? 'opacity-40 scale-95' : ''}
                                ${!isDismissed ? 'cursor-move' : ''}
                              `}
                            >
                              <div className={`pointer-events-none transform scale-[0.8] origin-center -my-2 ${isDismissed ? 'grayscale' : ''}`}>
                                <ChordLayout voicing={v} showFingering={showFingering} minimal={true} />
                              </div>
                            </button>

                            {/* Dismiss/Restore Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissVoicing(v.id);
                              }}
                              className={`
                                absolute top-1 right-1 z-10
                                w-5 h-5 rounded-full
                                backdrop-blur-md border border-border/50
                                flex items-center justify-center
                                opacity-0 group-hover:opacity-100
                                transition-all duration-300
                                ${isDismissed
                                  ? 'bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                                  : 'bg-card/80 text-muted-foreground hover:bg-red-500 hover:border-red-500 hover:text-white hover:scale-110'}
                              `}
                              title={isDismissed ? "Restore this voicing" : "Dismiss this voicing"}
                            >
                              {isDismissed ? <RefreshCcw size={10} strokeWidth={2.5} /> : <X size={12} strokeWidth={2.5} />}
                            </button>
                          </div>
                        );
                      })}
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

    </div>
  );
};

export default App;