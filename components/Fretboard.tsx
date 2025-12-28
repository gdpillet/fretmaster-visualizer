import React, { useMemo } from 'react';
import { FretboardNote } from '../types';
import { NOTE_COLORS } from '../constants';
import { getIntervalName } from '../utils/theory';

interface FretboardProps {
  notes: FretboardNote[];
  orientation: 'horizontal' | 'vertical';
  theme: 'dark' | 'light';
}

const STRINGS = 6;
const FRETS = 12; // 0 to 12 (12 frets total)

// Pre-calculate markers
const MARKERS = [3, 5, 7, 9, 12];

export const Fretboard: React.FC<FretboardProps> = ({ notes, orientation, theme }) => {
  const isHorizontal = orientation === 'horizontal';

  // Helper to find if a note exists at a specific position
  const getNoteAt = (stringIdx: number, fretIdx: number) => {
    return notes.find((n) => n.string === stringIdx + 1 && n.fret === fretIdx);
  };

  // Logic for Fretboard Markers (Dots)
  const isSingleMarker = (fret: number) => [3, 5, 7, 9].includes(fret);
  const isDoubleMarker = (fret: number) => fret === 12;

  // Render content based on orientation
  // Strings are 0 (High E) to 5 (Low E) in logic.
  // Visually: 
  //   Horizontal: Top line is High E (idx 0) or Bottom? Standard tabs usually have High E on top.
  //   Vertical: Right line is High E? Standard charts usually have Low E on Left.

  // Let's iterate:
  // Horizontal: Rows = Strings (0-5), Cols = Frets.
  // Vertical: Cols = Strings (0-5), Rows = Frets.

  return (
    <div className={`
      relative select-none p-4 rounded-xl border shadow-2xl overflow-hidden transition-all duration-500
      ${isHorizontal ? 'min-w-[800px] w-full h-[320px]' : 'w-[320px] h-[750px] mx-auto'}
      ${theme === 'dark' ? 'bg-[#121212] border-zinc-800' : 'bg-[#fdfbf3] border-zinc-200'}
    `}>
      {/* Wood Texture / Background */}
      <div className={`absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-[url("https://www.transparenttextures.com/patterns/dark-wood.png")]' : 'bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")]'}`} />

      {/* Fretboard Surface */}
      <div className={`absolute inset-4 rounded-lg pointer-events-none ${theme === 'dark' ? 'bg-[#1a1a1a] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : 'bg-[#e3d5ca] shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]'
        }`} />

      <div className={`
        relative w-full h-full flex z-10
        ${isHorizontal ? 'flex-row' : 'flex-col'}
      `}>

        {/* Nut (0 fret) */}
        <div className={`
          z-20 shadow-lg border-slate-600/30
          ${theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'}
          ${isHorizontal
            ? 'w-4 h-full border-r'
            : 'h-4 w-full border-b order-first'}
        `} />

        {/* Fretboard Grid Area */}
        <div className={`
          flex-1 flex relative
          ${isHorizontal ? 'flex-row' : 'flex-col'}
        `}>
          {/* Render Frets (The spaces between bars) */}
          {Array.from({ length: FRETS }).map((_, i) => {
            const fretNum = i + 1; // 1 to 12
            return (
              <div
                key={`fret-${fretNum}`}
                className={`
                  relative flex items-center justify-center
                  ${isHorizontal
                    ? 'flex-1 border-r h-full'
                    : 'flex-1 border-b w-full'}
                  ${theme === 'dark' ? 'border-zinc-700 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)]' : 'border-zinc-400/60'}
                `}
              >
                {/* Fret Number Label */}
                <span className={`
                  absolute text-[11px] font-mono font-black tracking-tighter
                  ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}
                  ${isHorizontal ? '-bottom-7 left-1/2 -translate-x-1/2' : '-left-8 top-1/2 -translate-y-1/2'}
                `}>
                  {fretNum}
                </span>

                {/* Inlay Markers */}
                {(isSingleMarker(fretNum) || isDoubleMarker(fretNum)) && (
                  <div className={`rounded-full shadow-inner opacity-20 ${theme === 'dark' ? 'bg-zinc-400' : 'bg-zinc-900'
                    } ${isSingleMarker(fretNum) ? 'w-5 h-5' : 'flex gap-6 ' + (isHorizontal ? '' : 'flex-col')}`}>
                    {isDoubleMarker(fretNum) && (
                      <>
                        <div className="w-5 h-5 rounded-full bg-inherit" />
                        <div className="w-5 h-5 rounded-full bg-inherit" />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Render Strings (Overlay Lines) */}
          <div className="absolute inset-0 pointer-events-none z-30">
            {Array.from({ length: STRINGS }).map((_, idx) => {
              const thickness = 1.5 + idx * 0.4;
              return (
                <div
                  key={`string-${idx}`}
                  className={`absolute shadow-sm ${theme === 'light' ? 'bg-zinc-400/80' : 'bg-zinc-500/60'}`}
                  style={isHorizontal ? {
                    left: 0, right: 0,
                    height: `${thickness}px`,
                    top: `${(100 / STRINGS) * idx + (100 / STRINGS) / 2}%`,
                    transform: 'translateY(-50%)'
                  } : {
                    top: 0, bottom: 0,
                    width: `${thickness}px`,
                    left: `${(100 / STRINGS) * idx + (100 / STRINGS) / 2}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              );
            })}
          </div>

          {/* Render Active Notes (Overlay Dots) */}
          <div className="absolute inset-0 z-40">
            {notes.map((n, i) => {
              if (n.fret === 0) return null;

              const fretSizePct = 100 / FRETS;
              const posMain = (n.fret - 1) * fretSizePct + (fretSizePct / 2);

              const stringSizePct = 100 / STRINGS;
              // For vertical: strings are rendered left to right as idx 0-5 (High E to Low E)
              // Notes have string 1-6 where 1=High E, 6=Low E
              // So we need: (n.string - 1) to convert to 0-5 index
              const posCross = isHorizontal
                ? (n.string - 1) * stringSizePct + (stringSizePct / 2)
                : (n.string - 1) * stringSizePct + (stringSizePct / 2);

              const colorClass = NOTE_COLORS[n.note] || 'bg-white';
              const hasTextClass = colorClass.includes('text-');
              const textColor = hasTextClass ? '' : 'text-white';

              return (
                <div
                  key={`note-${i}`}
                  className={`
                      absolute flex flex-col items-center justify-center rounded-full shadow-xl font-black transition-all duration-300 transform scale-100 hover:scale-110 z-50
                      border-2 ${theme === 'dark' ? 'border-zinc-900' : 'border-white'}
                      ${isHorizontal ? 'w-10 h-10 text-base' : 'w-11 h-11 text-lg'} 
                      ${colorClass} ${textColor}
                      ${n.isRoot ? 'ring-2 ring-zinc-400 dark:ring-white ring-offset-2 ring-offset-[#222]' : ''}
                    `}
                  style={isHorizontal ? {
                    left: `${posMain}%`,
                    top: `${posCross}%`,
                    transform: 'translate(-50%, -50%)'
                  } : {
                    top: `${posMain}%`,
                    left: `${posCross}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <span className="leading-none drop-shadow-sm">{n.note}</span>
                  <span className={`text-[9px] font-bold opacity-90 leading-none mt-0.5 uppercase ${textColor}`}>
                    {getIntervalName(n.interval)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Open Strings Area (Nut area notes) */}
      <div className={`absolute z-30
        ${isHorizontal ? 'left-1 top-0 bottom-0 w-8' : 'top-1 left-0 right-0 h-8'}
      `}>
        {notes.filter(n => n.fret === 0).map((n, i) => {
          const stringSizePct = 100 / STRINGS;
          const posCross = isHorizontal
            ? (n.string - 1) * stringSizePct + (stringSizePct / 2)
            : (6 - n.string) * stringSizePct + (stringSizePct / 2);

          return (
            <div
              key={`open-${i}`}
              className={`
                    absolute flex items-center justify-center rounded-full font-extrabold text-xs
                    ${n.isRoot
                  ? 'bg-primary text-white'
                  : 'text-slate-400 bg-slate-800'}
                    ${isHorizontal ? 'w-7 h-7 -translate-y-1/2' : 'w-7 h-7 -translate-x-1/2'}
                  `}
              style={isHorizontal ? {
                top: `${posCross}%`,
                left: '0'
              } : {
                left: `${posCross}%`,
                top: '0'
              }}
            >
              {n.note}
            </div>
          )
        })}
      </div>

    </div>
  );
};