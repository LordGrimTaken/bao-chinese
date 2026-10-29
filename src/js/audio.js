/** Text-to-speech + tiny synthesized sound effects. No audio files needed. */

let audioContext = null;
let voices = [];
let soundEnabled = true;
let unlocked = false;

export function initAudio() {
  if (typeof window === 'undefined') return;
  refreshVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  }
  const unlock = () => {
    unlocked = true;
    if (!audioContext && 'AudioContext' in window) {
      try {
        audioContext = new AudioContext();
      } catch {
        audioContext = null;
      }
    }
    audioContext?.resume?.();
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  if (!soundEnabled) stopSpeaking();
}

function refreshVoices() {
  if (!('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices() || [];
}

export function chineseVoice() {
  if (!voices.length) refreshVoices();
  const isChinese = (voice) => /^zh([-_]|$)/i.test(voice.lang || '');
  const mandarin = voices.filter((voice) => /^zh[-_]?(CN|Hans)/i.test(voice.lang || '') || /mandarin|chinese|中文|普通话/i.test(voice.name));
  return (
    mandarin.find((voice) => /Xiaoxiao|Huihui|Yaoyao|Tingting|Meijia|Natural/i.test(voice.name)) ||
    mandarin[0] ||
    voices.find(isChinese) ||
    null
  );
}

export function speechAvailable() {
  return Boolean(window.BaoNative?.speak) || 'speechSynthesis' in window;
}

export function hasChineseVoice() {
  return Boolean(chineseVoice());
}

export function speak(text, { slow = false } = {}) {
  if (!text) return false;
  const rate = slow ? 0.66 : 0.9;
  if (window.BaoNative?.speak) {
    try {
      window.BaoNative.speak(String(text), Number(rate));
      flashSpeaking();
      return true;
    } catch {
      /* fall through to Web Speech */
    }
  }
  if (!('speechSynthesis' in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    const voice = chineseVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = flashSpeaking;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

function flashSpeaking() {
  const root = document.documentElement;
  root.classList.add('is-speaking');
  clearTimeout(flashSpeaking.timer);
  flashSpeaking.timer = setTimeout(() => root.classList.remove('is-speaking'), 900);
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* noop */
  }
  try {
    window.BaoNative?.stopSpeaking?.();
  } catch {
    /* noop */
  }
}

export function vibrate(pattern = 8) {
  if (window.BaoNative?.vibrate) {
    try {
      window.BaoNative.vibrate(Number(pattern) || 8);
      return;
    } catch {
      /* noop */
    }
  }
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* noop */
  }
}

export function sfx(kind) {
  if (!soundEnabled) return;
  if (!audioContext) {
    if (!('AudioContext' in window)) return;
    try {
      audioContext = new AudioContext();
    } catch {
      return;
    }
  }
  audioContext.resume?.();
  const now = audioContext.currentTime;
  const tone = (frequency, start, duration, type = 'sine', volume = 0.08, endFrequency = frequency) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now + start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + start + duration);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.03);
  };
  if (kind === 'correct') {
    tone(660, 0, 0.12, 'sine', 0.09);
    tone(990, 0.09, 0.16, 'sine', 0.07);
  } else if (kind === 'wrong') {
    tone(180, 0, 0.22, 'triangle', 0.08, 120);
  } else if (kind === 'complete') {
    [523, 659, 784, 1046].forEach((frequency, i) => tone(frequency, i * 0.1, 0.22, 'sine', 0.08));
  } else if (kind === 'tap') {
    tone(440, 0, 0.05, 'sine', 0.035);
  } else if (kind === 'heart') {
    tone(300, 0, 0.12, 'sawtooth', 0.05, 160);
  }
}
