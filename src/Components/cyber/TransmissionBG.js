import React, { useEffect, useRef } from "react";
import "./TransmissionBG.css";

/* ==================================================================
   TransmissionBG — vertical glyph-stream "data download" effect, for
   the Articles hero. Classic matrix-rain technique (a translucent
   fill fades the previous frame instead of tracking trail arrays),
   themed lime/cyan. Reads as "decoding archived knowledge" rather
   than a flat photo. Sized to its parent, same conventions as the
   other cyber canvases.
   ================================================================== */

const CHARSET = "01#/$%&ABCDEF{}<>=+*".split("");

const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;
const CHAR_SIZE = 16;

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

export default function TransmissionBG() {
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
    let columns = [];
    let rafId = 0;
    let lastFrame = 0;
    let running = true;

    function seedColumns() {
      const count = Math.floor(width / 22);
      columns = new Array(count).fill(0).map((_, i) => ({
        x: i * 22 + 6,
        y: rand(-40, 0),
        speed: rand(3.5, 8.5), // rows/sec
        color: Math.random() < 0.28 ? "61,242,255" : "187,223,77",
        active: Math.random() < 0.75,
        nextToggle: rand(2, 8),
      }));
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
      ctx.font = `${CHAR_SIZE - 2}px var(--font-mono, monospace)`;
      ctx.textAlign = "center";
      seedColumns();
    }

    function step(now) {
      if (!running) return;
      rafId = window.requestAnimationFrame(step);

      const elapsed = now - lastFrame;
      if (elapsed < FRAME_MS) return;
      const dt = Math.min(elapsed, 100) / 1000;
      lastFrame = now - (elapsed % FRAME_MS);

      // fade the previous frame instead of clearing — this is what
      // produces the trailing-glyph look with almost no bookkeeping
      ctx.fillStyle = "rgba(5,7,10,0.14)";
      ctx.fillRect(0, 0, width, height);

      const maxRow = height / CHAR_SIZE + 4;

      for (const col of columns) {
        col.nextToggle -= dt;
        if (col.nextToggle <= 0) {
          col.active = !col.active;
          col.nextToggle = col.active ? rand(3, 9) : rand(1.5, 4);
        }
        if (!col.active) continue;

        col.y += col.speed * dt;
        if (col.y > maxRow) {
          col.y = rand(-10, 0);
          col.speed = rand(3.5, 8.5);
        }

        const py = col.y * CHAR_SIZE;
        ctx.fillStyle = `rgba(${col.color},0.9)`;
        ctx.fillText(pick(CHARSET), col.x, py);
      }
    }

    resize();
    // start from a mostly-opaque canvas so the very first frames don't
    // pop in from nothing
    ctx.fillStyle = "rgba(5,7,10,1)";
    ctx.fillRect(0, 0, width, height);
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

  return <canvas ref={canvasRef} className="transmission-bg" aria-hidden="true" />;
}
