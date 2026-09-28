// Web Audio API Synthesizer & Speech Synthesis Utility

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

// Initialize or resume AudioContext safely on user gesture
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('std8_sound_muted', muted ? 'true' : 'false');
    // If muting, cancel any currently playing speech synthesis
    if (muted && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export function getSoundMuted(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('std8_sound_muted');
    if (saved !== null) {
      isMuted = saved === 'true';
    }
  }
  return isMuted;
}

// Helper to determine if muted considering an optional prop override
function isEffectiveMuted(override?: boolean): boolean {
  if (typeof override === 'boolean') {
    return override;
  }
  return isMuted;
}

// 1. Play Soft Card / Button Click
export function playClickSound(mutedOverride?: boolean) {
  if (isEffectiveMuted(mutedOverride)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore audio failure
  }
}

// 2. Play Success / Match Chime (Sparkling Harmonic Chime)
export function playSuccessSound(mutedOverride?: boolean) {
  if (isEffectiveMuted(mutedOverride)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Melodic ascending chime: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.5)
    const chimeNotes = [
      { freq: 523.25, time: 0, duration: 0.22, gain: 0.16 },
      { freq: 659.25, time: 0.06, duration: 0.24, gain: 0.18 },
      { freq: 783.99, time: 0.12, duration: 0.28, gain: 0.2 },
      { freq: 1046.5, time: 0.18, duration: 0.35, gain: 0.22 },
    ];

    chimeNotes.forEach(({ freq, time, duration, gain: peakGain }) => {
      const startTime = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Triangle wave creates a warm, bell-like musical tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Add slight shimmer
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch {
    // ignore
  }
}

// 3. Play Wrong / Error Buzz (Gentle Dual Buzzer)
export function playErrorSound(mutedOverride?: boolean) {
  if (isEffectiveMuted(mutedOverride)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Two quick, soft low pulses: 160Hz and 130Hz
    const pulses = [
      { freq: 160, time: 0, duration: 0.1 },
      { freq: 130, time: 0.11, duration: 0.12 },
    ];

    pulses.forEach(({ freq, time, duration }) => {
      const startTime = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sawtooth gives a distinct buzzer characteristic
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, startTime + duration);

      gain.gain.setValueAtTime(0.09, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch {
    // ignore
  }
}

// 4. Play Fanfare / Game Completed Celebration Sound
export function playFanfareSound(mutedOverride?: boolean) {
  if (isEffectiveMuted(mutedOverride)) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.38 }, // C6
    ];

    let t = ctx.currentTime;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d * 0.85;
    });
  } catch {
    // ignore
  }
}

// 5. Speak Gujarati Word using Web Speech API
export function speakGujarati(text: string, mutedOverride?: boolean) {
  if (isEffectiveMuted(mutedOverride)) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Slightly slower for clear educational learning
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Search for gu-IN first, then hi-IN (which natively reads Devanagari/Indic scripts clearly)
    const guVoice = voices.find((v) => v.lang.toLowerCase().includes('gu'));
    const hiVoice = voices.find((v) => v.lang.toLowerCase().includes('hi'));

    if (guVoice) {
      utterance.voice = guVoice;
      utterance.lang = 'gu-IN';
    } else if (hiVoice) {
      utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'gu-IN';
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis unsupported or failed quietly
  }
}
