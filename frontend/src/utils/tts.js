let cachedVoices = [];

function loadVoices() {
  cachedVoices = window.speechSynthesis?.getVoices?.() || [];
  return cachedVoices;
}

// Try to pick a nice English/Indian voice if available, else first English, else default
function pickVoice(preferLocales = ["en-IN", "en-GB", "en-US"]) {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  for (const loc of preferLocales) {
    const v = voices.find(voice => voice.lang?.toLowerCase() === loc.toLowerCase());
    if (v) return v;
  }
  const enAny = voices.find(v => v.lang?.toLowerCase().startsWith("en"));
  return enAny || voices[0] || null;
}

// Speak text
export function speak(text, opts = {}) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis not supported in this browser.");
    return;
  }
  // stop any current speech first
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  // options: rate (0.5–2), pitch (0–2), volume (0–1)
  utter.rate = opts.rate ?? 1;
  utter.pitch = opts.pitch ?? 1;
  utter.volume = opts.volume ?? 1;

  const voice = pickVoice(opts.preferLocales);
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

// Stop speaking
export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function initVoices(onReady) {
  if (!("speechSynthesis" in window)) return;
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
    onReady?.();
  };
}
