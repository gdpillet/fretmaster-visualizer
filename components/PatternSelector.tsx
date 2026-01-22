import React from 'react';
import { SCALES, CHORDS } from '../constants';
import { ViewMode } from '../types';

interface PatternSelectorProps {
    mode: ViewMode;
    typeIndex: number;
    setTypeIndex: (index: number) => void;
    showFingering?: boolean;
    setShowFingering?: (show: boolean) => void;
}

export const PatternSelector: React.FC<PatternSelectorProps> = ({
    mode,
    typeIndex,
    setTypeIndex,
    showFingering,
    setShowFingering
}) => {
    return (
        <div className="w-full p-4 bg-card/30 border-b border-border backdrop-blur-sm">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {mode === 'scale' ? "Pattern Type" : "Chord Quality"}
                    </label>

                    {mode === 'chord' && setShowFingering && (
                        <button
                            onClick={() => setShowFingering(!showFingering)}
                            className={`
                flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border
                ${showFingering
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-transparent border-border text-muted-foreground hover:border-primary/50'}
              `}
                        >
                            <span>Fingering</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${showFingering ? 'bg-primary' : 'bg-muted-foreground'}`} />
                        </button>
                    )}
                </div>

                {mode === 'scale' ? (
                    <div className="flex flex-wrap gap-2">
                        {SCALES.map((item, idx) => (
                            <button
                                key={item.name}
                                onClick={() => setTypeIndex(idx)}
                                className={`
                  px-4 py-2 rounded-md border text-xs font-bold transition-all whitespace-nowrap
                  ${typeIndex === idx
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-card text-foreground border-border hover:border-primary/30 hover:bg-muted'}
                `}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {CHORDS.map((item, idx) => (
                            <button
                                key={item.name}
                                onClick={() => setTypeIndex(idx)}
                                title={item.description}
                                className={`
                  px-4 py-2 rounded-md border text-xs font-bold transition-all whitespace-nowrap
                  ${typeIndex === idx
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-card text-foreground border-border hover:border-primary/30 hover:bg-muted'}
                `}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
