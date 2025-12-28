import { NOTES, TUNING_INDICES } from '../constants';

export interface ChordVoicing {
    id: string;
    name: string;
    startingFret: number;
    strings: {
        stringIdx: number; // 0 (High E) to 5 (Low E)
        fret: number; // -1 for muted (x), 0 for open, >0 for fretted
        note: string;
        interval: number;
        isRoot: boolean;
        finger?: number; // 1=Index, 2=Middle, 3=Ring, 4=Pinky, 0/undefined=None(open)
    }[];
}

/**
 * Advanced Chord Generator
 * Searches for playable guitar shapes based on intervals.
 */
export const generateChordVoicings = (
    root: string,
    intervals: number[],
    qualityName: string = 'Major'
): ChordVoicing[] => {
    const rootIndex = NOTES.indexOf(root);
    if (rootIndex === -1) return [];

    // Symbol Mapping
    const getChordSymbol = (q: string): string => {
        const map: Record<string, string> = {
            'Major': '',
            'Minor': 'm',
            '5 (Power Chord)': '5',
            'Sus2': 'sus2',
            'Sus4': 'sus4',
            'Diminished': 'dim',
            'Augmented': 'aug',
            'Major 6': '6',
            'Minor 6': 'm6',
            '6/9': '6/9',
            'Dominant 7': '7',
            'Major 7': 'maj7',
            'Minor 7': 'm7',
            'Minor Major 7': 'm(maj7)',
            'Half-Diminished (m7b5)': 'm7b5',
            'Diminished 7': 'dim7',
            '7sus4': '7sus4',
            '7b5 (Alt)': '7b5',
            '7#5 (Alt)': '7#5',
            'Major 9': 'maj9',
            'Minor 9': 'm9',
            'Dominant 9': '9',
            'Add 9': 'add9',
            'Minor Add 9': 'm(add9)',
            '7b9': '7b9',
            '7#9 (Hendrix)': '7#9',
            'Major 11': 'maj11',
            'Minor 11': 'm11',
            'Dominant 11': '11',
            'Major 13': 'maj13',
            'Minor 13': 'm13',
            'Dominant 13': '13'
        };
        return map[q] !== undefined ? map[q] : q;
    };

    const chordSymbol = `${root}${getChordSymbol(qualityName)}`;

    // Target notes (semitones 0-11)
    const targetIndices = new Set(intervals.map(i => (rootIndex + i) % 12));

    // Required notes: Root, 3rd (Interval 3 or 4), 7th (10 or 11) are critical.
    // 5th (7) is optional. Extensions (2, 5, 9) are needed for flavor.
    // We will filter voicings later based on "Completeness Score".
    const hasInterval = (interval: number) => intervals.includes(interval);
    const isTarget = (noteIdx: number) => targetIndices.has(noteIdx);

    const voicings: ChordVoicing[] = [];

    // Search logic:
    // We slide a 4-fret window across the neck (plus allow open strings).
    // Positions: Open (0-3), then CAGED positions roughly at 0, 3, 5, 8, 10 relative to root?
    // Actually, let's just scan frets 0 to 12 as "Start Frets".
    const scanRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Positions to check

    for (const startFret of scanRange) {
        const endFret = startFret + 4; // 5 fret window (e.g. 5,6,7,8,9)

        const voicing = findBestShapeInWindow(startFret, endFret, rootIndex, targetIndices, hasInterval);
        if (voicing) {
            // De-duplicate by ID
            if (!voicings.some(v => v.id === voicing.id)) {
                voicing.name = getVoicingName(chordSymbol, voicing);
                voicings.push(voicing);
            }
        }
    }

    // Sort by playability / commonness:
    // 1. Root Position (Lowest note is Root)
    // 2. Open Position (Lowest position)
    // 3. Completeness (Number of notes)
    return voicings.sort((a, b) => {
        const aRootBass = a.strings.slice().reverse().find(s => s.fret !== -1)?.isRoot;
        const bRootBass = b.strings.slice().reverse().find(s => s.fret !== -1)?.isRoot;

        if (aRootBass && !bRootBass) return -1;
        if (!aRootBass && bRootBass) return 1;
        return a.startingFret - b.startingFret;
    }).slice(0, 12); // Return top 12 results
};

// --- Helper: Naming ---
const getVoicingName = (baseName: string, voicing: ChordVoicing): string => {
    // Find absolute lowest bass note (Highest String Index with fret != -1)
    const playedStrings = voicing.strings.filter(s => s.fret !== -1);
    if (playedStrings.length === 0) return baseName;

    // Sort by String Index (High to Low -> 0 to 5)
    // We want Bass: Highest Index.
    playedStrings.sort((a, b) => b.stringIdx - a.stringIdx);
    const bassString = playedStrings[0];

    // Check specific famous shapes
    // 1. "Easy F" / "F/C" shape: x-3-3-2-1-1 (approx) or x-3-3-2-1-x
    // Defined by: Bass on String 5 (Note is 5th interval), and compact shape at fret 1-3.
    // If it's a Major chord, and bass is 5th interval, and start fret 1.
    if (voicing.startingFret === 1 && bassString.stringIdx === 4 && bassString.interval === 7) { // Interval 7 is Perfect 5th
        // This is technically Base/5 (e.g. F/C).
        // But beginners often just call it "F (Open)" or "F (Easy)".
        return `${baseName} (Common)`;
    }

    // 2. "Mini F": x-x-3-2-1-1 (Bass on String 4, Root)
    if (voicing.startingFret === 1 && bassString.stringIdx === 3 && bassString.isRoot) {
        return `${baseName} (Easy)`;
    }

    // Check if Bass is Root for Standard Shapes
    if (bassString.isRoot) {
        // Root Position
        // Identified Shape by String
        let shape = '';
        if (bassString.stringIdx === 5) shape = '(E-Shape)';
        else if (bassString.stringIdx === 4) shape = '(A-Shape)';
        else if (bassString.stringIdx === 3) shape = '(D-Shape)';

        // If it starts at fret 1-3 and uses open strings *OR* is just not a full barre (e.g. muted top/bottom)
        // Ideally "Open" means uses frets 0.
        const hasOpen = playedStrings.some(s => s.fret === 0);
        if (hasOpen && voicing.startingFret <= 3) return `${baseName} (Open)`;

        return `${baseName} ${shape}`;
    } else {
        // Inversion (Slash Chord)
        return `${baseName}/${bassString.note}`;
    }
};

// --- Helper: Find Shape ---
const findBestShapeInWindow = (
    minFret: number,
    maxFret: number,
    rootIndex: number,
    targetIndices: Set<number>,
    hasInterval: (n: number) => boolean
): ChordVoicing | null => {

    // Recursive search or Greedy per string? 
    // Greedy per string often fails to find strict chords.
    // Combinatorial search is safer for 6 strings.
    // Optimize: Iterate Low E to High E.

    const validNotesPerString: Array<{ fret: number, noteIdx: number }[]> = [];

    for (let s = 5; s >= 0; s--) { // Low E to High E
        const openIdx = TUNING_INDICES[s];
        const options: { fret: number, noteIdx: number }[] = [];

        // Mute is always an option
        options.push({ fret: -1, noteIdx: -1 });

        // Open string (if in target)
        if (targetIndices.has(openIdx)) {
            options.push({ fret: 0, noteIdx: openIdx });
        }

        // Frets in window
        for (let f = minFret; f <= maxFret; f++) {
            if (f === 0) continue; // Already handled
            const currentIdx = (openIdx + f) % 12;
            if (targetIndices.has(currentIdx)) {
                options.push({ fret: f, noteIdx: currentIdx });
            }
        }
        validNotesPerString[s] = options;
    }

    // Now we need to pick EXACTLY ONE option per string to maximize chord quality.
    // Constraints:
    // 1. Must span acceptable stretch (already enforced by window).
    // 2. Must contain Root (unless rootless voicing allowed? Strict for visualizer).
    // 3. Must contain 3rd and 7th if applicable.
    // 4. Easy fingering?

    // Simplified Greedy Approach meant for Speed:
    // 1. Find Root on BassStrings (5 or 4 or 6).
    // 2. Build on top.

    const build = (stringIdx: number, currentStringSelection: any[]): any[] | null => {
        if (stringIdx < 0) return currentStringSelection; // Done

        const options = validNotesPerString[stringIdx];
        // Heuristic sort options: Prefer Root > 5th > 3rd?
        // Prefer lower frets?

        // Limit branching: Try fret > 0, then open, then mute.
        // Actually, just try all but limit recursion depth if needed.
        // 6 strings * ~3 options = 729 paths. Fast enough.

        for (const opt of options) {
            const next = [...currentStringSelection, { ...opt, stringIdx }];

            // Check intermediate validity?
            // If we are at string 5 (Low E), check if we have too many mutes?

            // Recursive step
            const res = build(stringIdx - 1, next);
            if (res) return res;
        }
        return null;
    };

    // Instead of raw generic search which produces garbage "Cluster" chords,
    // let's use standard constraints.
    // Constraint: Lowest active note SHOULD be Root (for standard inversions).
    // Constraint: Max 1 mute between strings? (Avoid x-0-x-0).
    // Constraint: Maximize unique intervals.

    // Let's iterate possible Bass strings for the Root.
    const layouts: any[] = [];

    // Try Root on E (String 5)
    layouts.push(constructChordWithBass(5, rootIndex, validNotesPerString));
    // Try Root on A (String 4)
    layouts.push(constructChordWithBass(4, rootIndex, validNotesPerString));
    // Try Root on D (String 3)
    layouts.push(constructChordWithBass(3, rootIndex, validNotesPerString));
    // Try Root on G (String 2) - rare for full chords but ok
    layouts.push(constructChordWithBass(2, rootIndex, validNotesPerString));

    // Filter nulls
    const validLayouts = layouts.filter(l => l !== null);

    // Score them
    if (validLayouts.length === 0) return null;

    // Sort by "Completeness" (count of distinct intervals present)
    validLayouts.sort((a, b) => b.score - a.score);

    const best = validLayouts[0];

    // Convert to Output Format
    const finalStrings = [];
    // best.strings is [LowE, A, D, G, B, HighE] (Indices 5,4,3,2,1,0)
    // We stored them as pushed during loop 5->0.

    for (const s of best.strings) {
        if (s.fret === -1) {
            finalStrings.push({ stringIdx: s.stringIdx, fret: -1, note: '', interval: -1, isRoot: false });
        } else {
            const interval = (s.noteIdx - rootIndex + 12) % 12;
            finalStrings.push({
                stringIdx: s.stringIdx,
                fret: s.fret,
                note: NOTES[s.noteIdx],
                interval,
                isRoot: interval === 0
            });
        }
    }

    // Add Fingering Logic
    const stringsWithFingers = computeFingering(finalStrings);

    // ID
    // Sort strings 0->5 for ID
    const sortedForId = [...stringsWithFingers].sort((a, b) => a.stringIdx - b.stringIdx);
    const id = sortedForId.map(s => s.fret).join('-');

    return {
        id,
        name: 'Voicing',
        startingFret: minFret === 0 ? 1 : minFret,
        strings: stringsWithFingers
    };
};

const constructChordWithBass = (bassStringInfoIdx: number, rootIndex: number, allOptions: any[]): any | null => {
    // 1. Bass string MUST play Root
    const bassOpts = allOptions[bassStringInfoIdx];
    const rootOpt = bassOpts.find((o: any) => o.noteIdx === rootIndex && o.fret !== -1);

    if (!rootOpt) return null; // Can't form this shape in this window

    const resultStrings = [];
    const usedIntervals = new Set<number>();

    // Mute strings below bass
    for (let s = 5; s > bassStringInfoIdx; s--) {
        resultStrings.push({ stringIdx: s, fret: -1, noteIdx: -1 });
    }

    // Add Bass
    resultStrings.push({ stringIdx: bassStringInfoIdx, fret: rootOpt.fret, noteIdx: rootOpt.noteIdx });
    usedIntervals.add(0);

    // Build upwards greedy: find distinct intervals preferrably
    for (let s = bassStringInfoIdx - 1; s >= 0; s--) {
        const options = allOptions[s];

        const playableOpts = options.filter((o: any) => o.fret !== -1);
        let bestOpt = null;

        if (playableOpts.length > 0) {
            // Heuristic: For the string immediately above the bass (s === bass - 1),
            // STRONGLY prefer the Perfect 5th (Interval 7) if available.
            // This creates the standard Power Chord foundation (Root-5th) typical of E-shape and A-shape barre chords.
            // Helps avoid picking Open 3rds low in the voicing (e.g. F Major picking Open A).
            if (s === bassStringInfoIdx - 1) {
                const fifthOpt = playableOpts.find((o: any) => {
                    const interval = (o.noteIdx - rootIndex + 12) % 12;
                    return interval === 7;
                });
                if (fifthOpt) bestOpt = fifthOpt;
            }

            // Heuristic 2: For the next string (s === bass - 2), prefer Octave Root?
            // E.g. F(1)-C(3)-F(3). 
            if (!bestOpt && s === bassStringInfoIdx - 2) {
                const octaveOpt = playableOpts.find((o: any) => {
                    const interval = (o.noteIdx - rootIndex + 12) % 12;
                    return interval === 0;
                });
                if (octaveOpt) bestOpt = octaveOpt;
            }

            // Default Logic: Maximize distinct intervals
            if (!bestOpt) {
                // Prefer options that add NEW intervals
                // Sort options? Prefer fretted over open if Bass is high? 
                // Let's just pick the first one that adds a new interval.
                for (const opt of playableOpts) {
                    const interval = (opt.noteIdx - rootIndex + 12) % 12;
                    if (!usedIntervals.has(interval)) {
                        bestOpt = opt;
                        break;
                    }
                }
                // Fallback to first playable if all intervals used
                if (!bestOpt) bestOpt = playableOpts[0];
            }
        }

        if (bestOpt) {
            resultStrings.push({ stringIdx: s, ...bestOpt });
            usedIntervals.add((bestOpt.noteIdx - rootIndex + 12) % 12);
        } else {
            resultStrings.push({ stringIdx: s, fret: -1, noteIdx: -1 });
        }
    }

    // Calculate Score
    let score = usedIntervals.size * 10; // Base score by richness

    // Bonus for Contiguous Strings (Solid Shape) vs Jumping strings
    // Scan resultStrings to see if active strings are adjacent
    const activeIndices = resultStrings
        .filter(s => s.fret !== -1)
        .map(s => s.stringIdx)
        .sort((a, b) => b - a); // 5, 4, 3...

    let gaps = 0;
    for (let i = 0; i < activeIndices.length - 1; i++) {
        if (activeIndices[i] - activeIndices[i + 1] > 1) {
            gaps++;
        }
    }

    // Penalize gaps heavily for simple chords like Power Chords
    if (gaps > 0) score -= 50;

    // Reward having valid 3rd/7th/5th? Already covered by interval size.

    return { strings: resultStrings, score };
};

// --- Basic Fingering Solver ---
const computeFingering = (strings: any[]): any[] => {
    // Collect active fretted notes (fret > 0)
    const active = strings.filter(s => s.fret > 0);
    if (active.length === 0) return strings;

    // Sort by fret ascending
    const sortedFrets = [...active].sort((a, b) => a.fret - b.fret);
    const minFret = sortedFrets[0].fret;

    // Check for Barre: Multiple notes on minFret?
    const onMinFret = active.filter(s => s.fret === minFret);
    let hasBarre = onMinFret.length >= 2;
    // Logic: If index finger (1) bars minFret, it covers all strings?
    // Usually barre is used if we have notes on minFret across a range.

    const result = strings.map(s => ({ ...s, finger: undefined }));

    // Assign Index (1)
    if (hasBarre) {
        // Assign 1 to all notes on minFret
        result.forEach(s => {
            if (s.fret === minFret) s.finger = 1;
        });
    } else {
        // Assign 1 to the specific note on minFret
        const note = result.find(s => s.fret === minFret);
        if (note) note.finger = 1;
    }

    // Assign 2, 3, 4 to remaining notes (fret >= minFret)
    // Heuristic: Sort remaining by string index (High E to Low E? or Low to High?)
    // Usually fingers 2,3,4 fall naturally.
    // Let's just assign by Fret proximity then String proximity.

    const remaining = result.filter(s => s.fret > 0 && s.finger === undefined);
    // Sort remaining: Lower frets first (if tying), then Lower String Index (Bass) vs Treble?
    // Usually index 2 (Middle) takes next lowest fret.
    remaining.sort((a, b) => {
        if (a.fret !== b.fret) return a.fret - b.fret;
        return b.stringIdx - a.stringIdx; // Low E first?
    });

    let currentFinger = 2;
    for (const note of remaining) {
        if (currentFinger <= 4) {
            note.finger = currentFinger;
            currentFinger++;
        }
    }

    return result;
};
