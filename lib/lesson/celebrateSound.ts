let celebrateCtx: AudioContext | null = null;

function context(): AudioContext | null {
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  celebrateCtx ??= new Ctor();
  return celebrateCtx;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  gain: number,
  type: OscillatorType = "triangle",
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function spark(ctx: AudioContext, start: number) {
  const length = Math.floor(ctx.sampleRate * 0.12);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.12, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  noise.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);
  noise.start(start);
  noise.stop(start + 0.14);
}

/** Chispa + arpegio corto. Se llama tras un clic (Comprobar / Solución). */
export function playCelebrateChime() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const ctx = context();
  if (!ctx) {
    return;
  }
  void ctx.resume().then(() => {
    const t = ctx.currentTime + 0.02;
    spark(ctx, t);
    tone(ctx, 523.25, t + 0.04, 0.18, 0.09);
    tone(ctx, 659.25, t + 0.14, 0.18, 0.1);
    tone(ctx, 783.99, t + 0.24, 0.2, 0.11);
    tone(ctx, 1046.5, t + 0.36, 0.42, 0.13, "sine");
  });
}
