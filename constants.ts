import { ScaleDefinition, ChordDefinition } from './types';

// Chromatic Scale (Sharps preferred for simplicity in MVP)
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTE_COLORS: Record<string, string> = {
  'C': 'bg-red-600',
  'C#': 'bg-pink-500',
  'D': 'bg-orange-500',
  'D#': 'bg-amber-700',
  'E': 'bg-yellow-400 text-black', // Yellow often needs dark text for contrast
  'F': 'bg-green-700',
  'F#': 'bg-green-400 text-black',
  'G': 'bg-blue-700',
  'G#': 'bg-sky-400 text-black',
  'A': 'bg-black',
  'A#': 'bg-neutral-500',
  'B': 'bg-fuchsia-600'
};

// Standard Tuning (High E to Low E): E B G D A E
// Stored as indices in the NOTES array
export const TUNING_INDICES = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E

export const SCALES: ScaleDefinition[] = [
  { name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10] }, // Natural Minor
  { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] }, // Jazz/Ascending Melodic Minor
  { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
  { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
  { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10] },
];

export const CHORDS: ChordDefinition[] = [
  // --- Essentials (The Big 5) ---
  { name: 'Major', intervals: [0, 4, 7], description: 'Happy, Bright, Foundation. The energetic home base of most Western music.' },
  { name: 'Minor', intervals: [0, 3, 7], description: 'Sad, Melancholy, Serious. The standard for emotional or darker storytelling.' },
  { name: 'Dominant 7', intervals: [0, 4, 7, 10], description: 'Bluesy, Tension, Expectant. The driving force of Blues; strongly "pulls" back to the root.' },
  { name: 'Major 7', intervals: [0, 4, 7, 11], description: 'Dreamy, Romantic, Smooth. Essential for Lo-fi, Jazz, and sophisticated Pop.' },
  { name: 'Minor 7', intervals: [0, 3, 7, 10], description: 'Mellow, Soulful, Cool. The backbone of R&B, Neo-Soul, and Jazz.' },

  // --- Rock & Pop Staples ---
  { name: '5 (Power Chord)', intervals: [0, 7], description: 'Powerful, Aggressive, Indestructible. The neutral king of Rock and Metal riffs.' },
  { name: 'Sus4', intervals: [0, 5, 7], description: 'Tension, Anticipation. Feels like taking a breath before resolving to Major.' },
  { name: 'Sus2', intervals: [0, 2, 7], description: 'Floating, Open, Hopeful. Creates a dreamy "hovering" texture that doesn\'t need to resolve.' },
  { name: 'Add 9', intervals: [0, 4, 7, 2], description: 'Lush, "Sparkling", Nostalgic. Adds a beautiful, modern shine to standard ballads.' },

  // --- Intermediate Colors ---
  { name: 'Major 6', intervals: [0, 4, 7, 9], description: 'Sweet, Playful, Pastoral. The classic "Beatles" ending or Country swing sound.' },
  { name: 'Minor 6', intervals: [0, 3, 7, 9], description: 'Dark, Mysterious, "Spy". Evokes intrigue, detective noir, and sorrow.' },
  { name: 'Diminished', intervals: [0, 3, 6], description: 'Tense, Dramatic, Unstable. Used in horror or to create moments of extreme crisis.' },
  { name: 'Augmented', intervals: [0, 4, 8], description: 'Surreal, Sci-Fi, Anxious. A strange, "floating" sound often used for dream sequences.' },

  // --- Jazz & Advanced ---
  { name: 'Minor Major 7', intervals: [0, 3, 7, 11], description: 'Noir, Intense, "Hitchcock". The sound of a crime thriller or deep psychological tension.' },
  { name: 'Half-Diminished (m7b5)', intervals: [0, 3, 6, 10], description: 'Tragic, Complex, "Yearning". The sophisticated "minor 2-5-1" jazz staple.' },
  { name: 'Diminished 7', intervals: [0, 3, 6, 9], description: 'Symmetrical, Panic, Passing. A bridge between chords that sounds like a train whistle.' },
  { name: 'Major 9', intervals: [0, 4, 7, 11, 2], description: 'Lush, Expansive, Sophisticated. The definitive "smooth jazz" or city pop texture.' },
  { name: 'Minor 9', intervals: [0, 3, 7, 10, 2], description: 'Deep, Rich, Emotional. Adds a layer of "midnight" depth to standard minor chords.' },
  { name: 'Dominant 9', intervals: [0, 4, 7, 10, 2], description: 'Funky, Groovy. The "James Brown" chord. Essential for Funk and Soul rhythm.' },

  // --- Altered (Hendrix/Neo-Soul) ---
  { name: '7#9 (Hendrix)', intervals: [0, 4, 7, 10, 3], description: 'Aggressive, Blues-Rock, Psycho. The "Purple Haze" chord. Tension meets distortion.' },
  { name: '7b9', intervals: [0, 4, 7, 10, 1], description: 'Dark Tension, Exotic. Resolves beautifully to localized minor chords.' },
  { name: '11th / 13th', intervals: [0, 4, 7, 10, 2, 5], description: 'Complex, Modern, Neo-Soul. The "Gospel" sound. Thick, rich, and full of flavor.' },
  { name: 'Major 13', intervals: [0, 4, 7, 11, 2, 9], description: 'Very Lush, Final. The ultimate "Hollywood Ending" chord.' },
];