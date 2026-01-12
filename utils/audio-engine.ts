export class AudioEngine {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    constructor() {
        this.init();
    }

    private init() {
        if (typeof window !== 'undefined' && !this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.context.destination);
        }
    }

    public resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    // Get frequency from note name (e.g., "A4" -> 440)
    // Simple map for standard tuning range
    private getNoteFrequency(noteName: string, octave: number = 3): number {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = notes.indexOf(noteName);

        // Standard A4 is 440Hz
        // Formula: f = 440 * 2^((n - 69) / 12) where n is MIDI note number
        // C4 is midi 60. A4 is midi 69.
        if (noteIndex === -1) return 440; // fallback

        const semitonesFromC3 = (octave - 3) * 12 + noteIndex;
        // C3 is roughly 130.81Hz
        const baseFreq = 130.81;
        return baseFreq * Math.pow(2, semitonesFromC3 / 12);
    }

    public playNote(note: string, octave: number = 3, timeOffset: number = 0, velocity: number = 1.0) {
        if (!this.context || !this.masterGain) this.init();
        if (!this.context || !this.masterGain) return;

        this.resume();

        const now = this.context.currentTime + timeOffset;
        const frequency = this.getNoteFrequency(note, octave);

        // Create Nodes
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        // Configure Oscillator (Triangle for mellower simplified guitar)
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;

        // Configure Filter (Lowpass to simulate the pluck losing brightness)
        // Nylon strings are warm, so we start fairly dark and close it further.
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.3); // Pluck decay
        filter.Q.value = 1;

        // Configure Envelope (Quick attack, exponential decay)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2.0); // Release/Decay

        // Connections
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Play
        oscillator.start(now);
        oscillator.stop(now + 2.5);

        // Cleanup
        setTimeout(() => {
            oscillator.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, 3000);
    }

    public playChord(notes: { note: string, octave?: number }[]) {
        if (!this.context) this.init();

        // Strumming effect: play notes with slight delay
        const strumSpeed = 0.05; // 50ms between strings

        notes.forEach((n, index) => {
            // Add randomness for realism
            const randomVel = 0.8 + Math.random() * 0.2;
            const timingJitter = Math.random() * 0.01;

            this.playNote(n.note, n.octave || 3, (index * strumSpeed) + timingJitter, randomVel);
        });
    }
}

export const audioEngine = new AudioEngine();
