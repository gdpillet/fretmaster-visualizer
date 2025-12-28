import React from 'react';
import { ChordVoicing } from '../utils/chord-generator';
import { NOTE_COLORS } from '../constants';
import { getIntervalName } from '../utils/theory';

interface ChordLayoutProps {
    voicing: ChordVoicing;
    showFingering?: boolean;
    minimal?: boolean;
}

export const ChordLayout: React.FC<ChordLayoutProps> = ({ voicing, showFingering = false, minimal = false }) => {
    // Determine dynamic number of frets (default 4, expand if needed)
    const activeFrets = voicing.strings
        .filter(s => s.fret > 0)
        .map(s => s.fret - voicing.startingFret);

    const maxRel = activeFrets.length > 0 ? Math.max(...activeFrets) : 0;
    const numFrets = maxRel >= 4 ? 5 : 4;

    const numStrings = 6;

    // Create array for rendering grid
    const frets = Array.from({ length: numFrets }, (_, i) => i + voicing.startingFret);
    // Strings from High E (0) to Low E (5) - actually diagram is usually Low E left to High E right?
    // Standard chord boxes: Vertical lines = Strings. Low E is usually on the LEFT.
    // Strings: 5 (Low E), 4, 3, 2, 1, 0 (High E).
    const stringOrder = [5, 4, 3, 2, 1, 0];

    return (
        <div className="flex flex-col items-center p-4">
            {/* Chord Box Container */}
            <div className={`relative p-5 pt-8 rounded-xl border shadow-xl min-w-[200px] flex flex-col items-center transition-all duration-300 ${minimal ? 'bg-transparent border-transparent shadow-none' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                }`}>

                {/* The Grid Area */}
                <div className={`relative w-[140px] h-[180px] mt-2 border-t-4 ${voicing.startingFret === 1 ? 'border-zinc-800 dark:border-zinc-200' : 'border-zinc-400/50 dark:border-zinc-600/50'
                    } bg-[#fdfbf3] dark:bg-[#1a1a1a] shadow-inner`}>
                    {/* Fret Label (if displaced) - Inside Grid now for relative positioning */}
                    {voicing.startingFret > 1 && (
                        <div
                            className="absolute -left-8 text-[10px] font-bold text-muted-foreground w-6 text-right"
                            style={{
                                top: `${(0.5 / numFrets) * 100}%`,
                                transform: 'translateY(-50%)'
                            }}
                        >
                            {voicing.startingFret}fr
                        </div>
                    )}
                    {/* Nut Indicators (X / O) - Aligned with strings */}
                    {stringOrder.map((sIdx, i) => {
                        const stringData = voicing.strings.find(s => s.stringIdx === sIdx);
                        const status = stringData?.fret === -1 ? 'X' : (stringData?.fret === 0 ? 'O' : null);
                        if (!status) return null;
                        return (
                            <div
                                key={`nut-${sIdx}`}
                                className="absolute -top-6 text-[11px] font-black text-zinc-900 dark:text-zinc-200 w-4 flex justify-center uppercase"
                                style={{
                                    left: `${(i / 5) * 100}%`,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                {status}
                            </div>
                        );
                    })}

                    {/* Top thick bar if starting at 1 (Nut) */}
                    {voicing.startingFret === 1 && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400 -mt-0.5 z-10" />
                    )}

                    {/* Frets (Horizontal Lines) */}
                    {Array.from({ length: numFrets + 1 }).map((_, i) => (
                        <div
                            key={`fline-${i}`}
                            className="absolute w-full h-px bg-zinc-300 dark:bg-zinc-800"
                            style={{ top: `${(i / numFrets) * 100}%` }}
                        />
                    ))}

                    {/* Fret Markers (Inlays) */}
                    {Array.from({ length: numFrets }).map((_, i) => {
                        const fretNum = voicing.startingFret + i;
                        const isSingle = [3, 5, 7, 9, 15, 17, 19, 21].includes(fretNum);
                        const isDouble = fretNum === 12 || fretNum === 24;

                        if (!isSingle && !isDouble) return null;

                        const topPos = ((i + 0.5) / numFrets) * 100;

                        return (
                            <div key={`marker-${i}`} className="absolute w-full pointer-events-none" style={{ top: `${topPos}%`, transform: 'translateY(-50%)' }}>
                                {isSingle && (
                                    <div className="mx-auto w-3 h-3 rounded-full bg-white/10" />
                                )}
                                {isDouble && (
                                    <div className="flex justify-center gap-8">
                                        <div className="w-3 h-3 rounded-full bg-white/10" />
                                        <div className="w-3 h-3 rounded-full bg-white/10" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Strings (Vertical Lines) */}
                    {Array.from({ length: numStrings }).map((_, i) => (
                        <div
                            key={`sline-${i}`}
                            className="absolute h-full w-px bg-zinc-300 dark:bg-zinc-800"
                            style={{ left: `${(i / (numStrings - 1)) * 100}%` }}
                        />
                    ))}

                    {/* Barre Indicator */}
                    {(() => {
                        // Find multiple notes with finger 1 on same fret
                        const fingerOneNotes = voicing.strings.filter(s => s.finger === 1 && s.fret > 0);
                        if (fingerOneNotes.length < 2) return null;

                        const fret = fingerOneNotes[0].fret;
                        // Verify all are on same fret
                        if (!fingerOneNotes.every(s => s.fret === fret)) return null;

                        const relFret = fret - voicing.startingFret;
                        if (relFret < 0 || relFret >= numFrets) return null;

                        // Get range
                        const stringIndices = fingerOneNotes.map(s => s.stringIdx);
                        const minIdx = Math.min(...stringIndices);
                        const maxIdx = Math.max(...stringIndices);

                        // Visual positions
                        // Leftmost is Max String Index (5, Low E) -> 0%
                        // Rightmost is Min String Index (0, High E) -> 100%

                        const leftPerc = ((5 - maxIdx) / 5) * 100;
                        const rightPerc = ((5 - minIdx) / 5) * 100;
                        const widthPerc = rightPerc - leftPerc;

                        const topPerc = ((relFret + 0.5) / numFrets) * 100;

                        return (
                            <div
                                className="absolute border-[3px] border-zinc-500/80 dark:border-white/90 bg-zinc-400/10 backdrop-blur-[1px] rounded-full z-10 pointer-events-none shadow-sm"
                                style={{
                                    left: `calc(${leftPerc}% - 14px)`,
                                    top: `${topPerc}%`,
                                    width: `calc(${widthPerc}% + 28px)`,
                                    height: '24px',
                                    transform: 'translateY(-50%)',
                                }}
                            />
                        );
                    })()}

                    {/* Dots */}
                    {voicing.strings.map((str) => {
                        if (str.fret <= 0) return null; // Ignore open/muted

                        // Calculate relative fret position (0 to numFrets-1)
                        const relFret = str.fret - voicing.startingFret;
                        if (relFret < 0 || relFret >= numFrets) return null; // Should not happen with well-formed data

                        // Calculate position
                        // X: String Index. Low E (5) is at 0%. High E (0) is at 100%.
                        // Formula: ( (5 - str.stringIdx) / 5 ) * 100%
                        const xPos = ((5 - str.stringIdx) / 5) * 100;

                        // Y: Midpoint of fret.
                        const yPos = ((relFret + 0.5) / numFrets) * 100;

                        // Color
                        const colorClass = NOTE_COLORS[str.note] || 'bg-white';
                        const hasTextClass = colorClass.includes('text-');
                        const textColor = hasTextClass ? '' : 'text-white';

                        // Display Content: Finger or Interval
                        const content = showFingering
                            ? (str.finger ? str.finger : '')
                            : getIntervalName(str.interval);

                        return (
                            <div
                                key={`dot-${str.stringIdx}`}
                                className={`
                    absolute flex flex-col items-center justify-center rounded-full shadow-md z-20 w-7 h-7 -ml-3.5 -mt-3.5
                    ${colorClass} ${textColor}
                    border-2 border-white dark:border-zinc-800
                    ${str.isRoot ? 'ring-2 ring-zinc-400 dark:ring-white scale-110' : ''}
                 `}
                                style={{ left: `${xPos}%`, top: `${yPos}%` }}
                            >
                                <span className={`text-xs font-black leading-none ${textColor || 'text-zinc-900 group-hover:text-black'}`}>{content}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            {!minimal && (
                <h3 className="mt-4 text-xl font-bold text-foreground tracking-tight">
                    {voicing.name.split(' (')[0]}
                    {voicing.name.includes(' (') && (
                        <span className="text-muted-foreground text-lg ml-1 font-semibold">
                            ({voicing.name.split(' (')[1]}
                        </span>
                    )}
                </h3>
            )}
        </div>
    );
};
