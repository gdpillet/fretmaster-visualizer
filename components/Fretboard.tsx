import React, { useMemo } from 'react';
import { FretboardNote } from '../types';

interface FretboardProps {
  notes: FretboardNote[];
  orientation: 'horizontal' | 'vertical';
}

const STRINGS = 6;
const FRETS = 13; // 0 to 12

// Pre-calculate markers
const MARKERS = [3, 5, 7, 9, 12];

export const Fretboard: React.FC<FretboardProps> = ({ notes, orientation }) => {
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
      relative select-none bg-[#1a1a1a] p-4 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden
      ${isHorizontal ? 'min-w-[800px] w-full h-[300px]' : 'w-[320px] h-[700px] mx-auto'}
    `}>
      {/* Wood Texture / Background */}
      <div className="absolute inset-0 bg-neutral-900 opacity-95" />
      
      <div className={`
        relative w-full h-full flex
        ${isHorizontal ? 'flex-row' : 'flex-col'}
      `}>
        
        {/* Nut (0 fret) */}
        <div className={`
          bg-[#cbbfa3] z-10 shadow-lg
          ${isHorizontal 
            ? 'w-3 h-full border-r border-slate-600' 
            : 'h-3 w-full border-b border-slate-600 order-first'}
        `} />

        {/* Fretboard Grid Area */}
        <div className={`
          flex-1 flex relative
          ${isHorizontal ? 'flex-row' : 'flex-col'}
        `}>
          {/* Render Frets (The spaces between bars) */}
          {Array.from({ length: FRETS }).map((_, i) => {
            const fretNum = i + 1; // 1 to 13
            // Calculate decreasing width/height for perspective realism (optional, kept simple for now)
            return (
              <div 
                key={`fret-${fretNum}`} 
                className={`
                  relative border-slate-600 flex items-center justify-center
                  ${isHorizontal 
                    ? 'flex-1 border-r h-full' 
                    : 'flex-1 border-b w-full'}
                `}
              >
                {/* Fret Number Label - Moved closer (changed from -bottom-6/-left-6 to -bottom-4/-left-4) */}
                <span className={`
                  absolute text-[11px] text-slate-400 font-mono font-bold opacity-80
                  ${isHorizontal ? '-bottom-4 left-1/2 -translate-x-1/2' : '-left-4 top-1/2 -translate-y-1/2'}
                `}>
                  {fretNum}
                </span>

                {/* Inlay Markers */}
                {isSingleMarker(fretNum) && (
                   <div className="w-4 h-4 rounded-full bg-slate-700/50 backdrop-blur-sm" />
                )}
                {isDoubleMarker(fretNum) && (
                   <div className={`flex gap-4 ${!isHorizontal ? 'flex-col' : ''}`}>
                     <div className="w-4 h-4 rounded-full bg-slate-700/50 backdrop-blur-sm" />
                     <div className="w-4 h-4 rounded-full bg-slate-700/50 backdrop-blur-sm" />
                   </div>
                )}
              </div>
            );
          })}

          {/* Render Strings (Overlay Lines) */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: STRINGS }).map((_, idx) => {
              // idx 0 = High E, idx 5 = Low E
              // Thickness increases with index
              const thickness = 1 + idx * 0.5;
              
              return (
                <div
                  key={`string-${idx}`}
                  className="absolute bg-slate-400 shadow-sm"
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
          <div className="absolute inset-0 z-20">
             {notes.map((n, i) => {
               // Only show notes > 0 fret here
               if (n.fret === 0) return null; 

               const fretSizePct = 100 / FRETS;
               const posMain = (n.fret - 1) * fretSizePct + (fretSizePct / 2);
               
               const stringSizePct = 100 / STRINGS;
               const posCross = isHorizontal 
                  ? (n.string - 1) * stringSizePct + (stringSizePct / 2) // 0 is top
                  : (6 - n.string) * stringSizePct + (stringSizePct / 2); // 6 (Low E) is 0 (Left)

               return (
                 <div
                    key={`note-${i}`}
                    className={`
                      absolute flex items-center justify-center rounded-full shadow-lg font-extrabold text-base transition-all duration-300 transform scale-100 hover:scale-110
                      ${isHorizontal ? 'w-9 h-9' : 'w-10 h-10'} 
                      ${n.isRoot 
                        ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-[#111] z-20' 
                        : 'bg-white text-slate-900 z-10'}
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
                   {n.note}
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