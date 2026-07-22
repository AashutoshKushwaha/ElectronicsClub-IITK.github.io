import React, { useEffect, useRef } from "react";
import "./PartsBG.css";

/* ==================================================================
   PartsBG — actual electronic-component schematic symbols (resistor,
   capacitor, IC chip, LED/diode, microcontroller board) drifting like
   parts in a zero-g inventory bay, for the Components hero. Each is
   drawn as a line-art stamp in local space, then translated/rotated/
   scaled per floating instance. Sized to its parent, same conventions
   as the other cyber canvases.
   ================================================================== */

const LIME = "187,223,77";
const CYAN = "61,242,255";

const TARGET_FPS = 40;
const FRAME_MS = 1000 / TARGET_FPS;

function shouldSkip() {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 768) {
    return true;
  }
  return false;
}

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---- schematic-symbol stamps, drawn centered at the origin ---- */
function drawResistor(ctx) {
  const pts = [
    [-50, 0], [-30, 0], [-22, -16], [-14, 16], [-6, -16],
    [2, 16], [10, -16], [18, 16], [26, 0], [50, 0],
  ];
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

function drawCapacitor(ctx) {
  ctx.beginPath();
  ctx.moveTo(-50, 0); ctx.lineTo(-7, 0);
  ctx.moveTo(7, 0); ctx.lineTo(50, 0);
  ctx.moveTo(-7, -20); ctx.lineTo(-7, 20);
  ctx.moveTo(7, -20); ctx.lineTo(7, 20);
  ctx.stroke();
}

function drawIC(ctx) {
  ctx.strokeRect(-40, -22, 80, 44);
  ctx.beginPath();
  ctx.arc(0, -22, 7, Math.PI, 0);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const x = -30 + i * 20;
    ctx.beginPath();
    ctx.moveTo(x, -22); ctx.lineTo(x, -32);
    ctx.moveTo(x, 22); ctx.lineTo(x, 32);
    ctx.stroke();
  }
}

function drawDiode(ctx, led) {
  ctx.beginPath();
  ctx.moveTo(-50, 0); ctx.lineTo(-11, 0);
  ctx.moveTo(11, 0); ctx.lineTo(50, 0);
  ctx.moveTo(-11, -15); ctx.lineTo(-11, 15); ctx.lineTo(11, 0); ctx.closePath();
  ctx.moveTo(11, -15); ctx.lineTo(11, 15);
  ctx.stroke();
  if (led) {
    ctx.beginPath();
    ctx.moveTo(16, -20); ctx.lineTo(26, -30);
    ctx.moveTo(23, -30); ctx.lineTo(26, -30); ctx.lineTo(26, -27);
    ctx.moveTo(26, -12); ctx.lineTo(36, -22);
    ctx.moveTo(33, -22); ctx.lineTo(36, -22); ctx.lineTo(36, -19);
    ctx.stroke();
  }
}

function drawBoard(ctx) {
  ctx.strokeRect(-55, -35, 110, 70);
  ctx.strokeRect(-55, -27, 18, 16);
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(-45 + i * 13, 28, 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(40, -20, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(-10, -10, 30, 20);
}

const STAMPS = [
  { draw: drawResistor, w: 100 },
  { draw: drawCapacitor, w: 100 },
  { draw: drawIC, w: 90 },
  { draw: (ctx) => drawDiode(ctx, false), w: 100 },
  { draw: (ctx) => drawDiode(ctx, true), w: 100 },
  { draw: drawBoard, w: 120 },
];

function buildPart(width, height) {
  const stamp = pick(STAMPS);
  return {
    stamp,
    x: rand(0, width),
    y: rand(0, height),
    vx: rand(-10, 10),
    vy: rand(-7, 7),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.25, 0.25),
    scale: rand(0.32, 0.62),
    color: Math.random() < 0.32 ? CYAN : LIME,
    alpha: rand(0.35, 0.75),
  };
}

export default function PartsBG() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (shouldSkip()) return undefined;

    const canvas = canvasRef.current;
    const parent = canvas && canvas.parentElement;
    if (!canvas || !parent) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let parts = [];
    let rafId = 0;
    let lastFrame = 0;
    let running = true;

    function seedParts() {
      const count = width < 640 ? 6 : width < 1100 ? 9 : 13;
      parts = new Array(count).fill(0).map(() => buildPart(width, height));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(r.width));
      height = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParts();
    }

    function step(now) {
      if (!running) return;
      rafId = window.requestAnimationFrame(step);

      const elapsed = now - lastFrame;
      if (elapsed < FRAME_MS) return;
      const dt = Math.min(elapsed, 100) / 1000;
      lastFrame = now - (elapsed % FRAME_MS);

      ctx.clearRect(0, 0, width, height);

      const margin = 80;
      for (const p of parts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        if (p.x < -margin) p.x = width + margin;
        if (p.x > width + margin) p.x = -margin;
        if (p.y < -margin) p.y = height + margin;
        if (p.y > height + margin) p.y = -margin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.scale, p.scale);
        ctx.strokeStyle = `rgba(${p.color},${p.alpha})`;
        ctx.lineWidth = 1.6 / p.scale;
        ctx.lineJoin = "round";
        p.stamp.draw(ctx);
        ctx.restore();
      }
    }

    resize();
    lastFrame = performance.now();
    rafId = window.requestAnimationFrame(step);

    const ro = "ResizeObserver" in window ? new ResizeObserver(() => resize()) : null;
    if (ro) ro.observe(parent);

    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    }
    window.addEventListener("resize", onResize);

    function onVisibility() {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        lastFrame = performance.now();
        rafId = window.requestAnimationFrame(step);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="parts-bg" aria-hidden="true" />;
}
