"use client";

import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  spin: number;
  angle: number;
  alpha: number;
  tone: number;
};

function makeFlakes(width: number, height: number, count: number): Flake[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1.2 + Math.random() * 3.4,
    speed: 18 + Math.random() * 38,
    drift: -14 + Math.random() * 28,
    spin: -1.6 + Math.random() * 3.2,
    angle: Math.random() * Math.PI * 2,
    alpha: 0.35 + Math.random() * 0.55,
    tone: Math.random(),
  }));
}

export function CelebrateFrost() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let flakes = makeFlakes(1, 1, 0);
    let frame = 0;
    let last = performance.now();
    let running = true;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      flakes = makeFlakes(width, height, Math.round(width / 14));
    };

    const color = (tone: number, alpha: number) => {
      if (tone < 0.4) {
        return `rgba(255, 244, 184, ${alpha})`;
      }
      if (tone < 0.75) {
        return `rgba(245, 180, 42, ${alpha})`;
      }
      return `rgba(47, 184, 174, ${alpha})`;
    };

    const draw = (now: number) => {
      if (!running) {
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      for (const flake of flakes) {
        flake.y += flake.speed * dt;
        flake.x += flake.drift * dt;
        flake.angle += flake.spin * dt;
        if (flake.y > height + 8) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.angle);
        ctx.globalAlpha = flake.alpha;
        ctx.fillStyle = color(flake.tone, 1);
        ctx.fillRect(-flake.size / 2, -0.5, flake.size, 1);
        ctx.fillRect(-0.5, -flake.size / 2, 1, flake.size);
        ctx.restore();
      }
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    frame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="lesson-celebrate-frost"
      aria-hidden
    />
  );
}
