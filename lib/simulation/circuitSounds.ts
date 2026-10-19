let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!ctx) {
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function noiseBuffer(
  ac: AudioContext,
  seconds: number,
  color: "white" | "pink",
) {
  const length = Math.max(1, Math.floor(ac.sampleRate * seconds));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (color === "white") {
      data[i] = white;
      continue;
    }
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
  }
  return buffer;
}

function playNoise(
  ac: AudioContext,
  dest: AudioNode,
  start: number,
  duration: number,
  color: "white" | "pink",
  setup: (source: AudioBufferSourceNode) => AudioNode,
  peak: number,
  attack = 0.001,
) {
  const source = ac.createBufferSource();
  source.buffer = noiseBuffer(ac, duration, color);
  const gain = ac.createGain();
  const tail = Math.max(duration, 0.02);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + tail);
  const out = setup(source);
  out.connect(gain);
  gain.connect(dest);
  source.start(start);
  source.stop(start + tail + 0.02);
}

function playThud(
  ac: AudioContext,
  dest: AudioNode,
  start: number,
  duration: number,
  type: OscillatorType,
  fromHz: number,
  toHz: number,
  peak: number,
  lowpassHz: number,
) {
  const osc = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(fromHz, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(toHz, 1), start + duration);
  filter.type = "lowpass";
  filter.frequency.value = lowpassHz;
  gain.gain.setValueAtTime(Math.max(peak, 0.0001), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playSwitchSound(on: boolean) {
  const ac = audio();
  if (!ac) {
    return;
  }
  const t = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 0.9;
  master.connect(ac.destination);

  playNoise(
    ac,
    master,
    t,
    0.035,
    "white",
    (source) => {
      const high = ac.createBiquadFilter();
      high.type = "highpass";
      high.frequency.value = on ? 1800 : 1100;
      const band = ac.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = on ? 3200 : 2100;
      band.Q.value = 1.8;
      source.connect(high);
      high.connect(band);
      return band;
    },
    on ? 0.42 : 0.34,
  );

  playThud(
    ac,
    master,
    t,
    0.07,
    "triangle",
    on ? 205 : 155,
    on ? 88 : 70,
    0.22,
    900,
  );
  playThud(ac, master, t, 0.09, "sine", on ? 96 : 78, on ? 58 : 48, 0.32, 400);

  playNoise(
    ac,
    master,
    t + 0.012,
    0.022,
    "white",
    (source) => {
      const band = ac.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = on ? 1400 : 900;
      band.Q.value = 1.1;
      source.connect(band);
      return band;
    },
    0.16,
  );
}

export function playBulbSound(on: boolean) {
  const ac = audio();
  if (!ac) {
    return;
  }
  const t = ac.currentTime + (on ? 0.045 : 0);
  const master = ac.createGain();
  master.gain.value = 0.75;
  master.connect(ac.destination);

  if (on) {
    playNoise(
      ac,
      master,
      t,
      0.018,
      "white",
      (source) => {
        const high = ac.createBiquadFilter();
        high.type = "highpass";
        high.frequency.value = 4200;
        source.connect(high);
        return high;
      },
      0.12,
    );
    playNoise(
      ac,
      master,
      t + 0.008,
      0.22,
      "pink",
      (source) => {
        const band = ac.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 1600;
        band.Q.value = 0.7;
        source.connect(band);
        return band;
      },
      0.07,
      0.02,
    );
    playThud(ac, master, t + 0.01, 0.55, "sine", 50, 50, 0.028, 160);
    playThud(ac, master, t + 0.01, 0.48, "sine", 100, 100, 0.022, 260);
    playThud(ac, master, t + 0.02, 0.32, "triangle", 150, 148, 0.01, 380);
    return;
  }

  playThud(ac, master, t, 0.18, "sine", 100, 48, 0.04, 220);
  playNoise(
    ac,
    master,
    t,
    0.12,
    "pink",
    (source) => {
      const low = ac.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.value = 900;
      source.connect(low);
      return low;
    },
    0.05,
    0.004,
  );
  playThud(ac, master, t + 0.02, 0.08, "sine", 740, 520, 0.012, 1200);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
