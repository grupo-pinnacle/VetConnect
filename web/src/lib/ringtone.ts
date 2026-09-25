/**
 * Native Web Audio Ringtone Synthesizer
 * Generates sinusoidal dual-tone harmonic chords (440 Hz / 554.37 Hz) with ADSR gain curve.
 * Zero external audio files (.mp3 / .wav) — 100% resilient and offline-capable.
 */

class RingtoneSynthesizer {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;
  private isPlaying = false;
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playTonePulse() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.2; // Ring pulse duration in seconds

      // Dual-tone harmonic frequencies: A4 (440 Hz) + C#5 (554.37 Hz)
      const frequencies = [440, 554.37];

      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Exponential ADSR envelope
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08); // Attack
        gain.gain.setValueAtTime(0.12, now + duration - 0.2); // Sustain
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Release

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);

        this.activeOscillators.push(osc);
        this.activeGains.push(gain);

        osc.onended = () => {
          this.activeOscillators = this.activeOscillators.filter((o) => o !== osc);
          this.activeGains = this.activeGains.filter((g) => g !== gain);
        };
      });
    } catch {
      // Gracefully handle browser autoplay or AudioContext state errors
    }
  }

  public start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Play first tone pulse immediately
    this.playTonePulse();

    // Standard cadence: 1.2s tone + 1.8s silence = 3s cycle
    if (typeof window !== 'undefined') {
      this.intervalId = window.setInterval(() => {
        if (!this.isPlaying) return;
        this.playTonePulse();
      }, 3000);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      if (typeof window !== 'undefined') {
        window.clearInterval(this.intervalId);
      }
      this.intervalId = null;
    }

    // Stop active oscillators immediately
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    this.activeGains.forEach((g) => {
      try {
        g.disconnect();
      } catch {}
    });
    this.activeGains = [];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ringtone = new RingtoneSynthesizer();
export const startRingtone = () => ringtone.start();
export const stopRingtone = () => ringtone.stop();
