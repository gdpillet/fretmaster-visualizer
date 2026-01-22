import React from 'react';
import { NOTES } from '../constants';

interface RootSelectorProps {
    root: string;
    setRoot: (root: string) => void;
}

export const RootSelector: React.FC<RootSelectorProps> = ({ root, setRoot }) => {
    return (
        <div className="w-full p-4 bg-card/50 border-b border-border backdrop-blur-sm">
            <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Root Note
                </label>
                <div className="flex flex-wrap gap-2">
                    {NOTES.map((note) => {
                        const isActive = root === note;
                        return (
                            <button
                                key={note}
                                onClick={() => setRoot(note)}
                                className={`
                  h-10 w-12 flex items-center justify-center text-sm font-bold rounded-md transition-all border
                  ${isActive
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                                        : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted'}
                `}
                            >
                                {note}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
