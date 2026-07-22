import React, { useEffect, useRef } from "react";
import "./HoloGridBG.css";

/* ==================================================================
   HoloGridBG — Tron-style perspective floor grid + floating rotating
   wireframe polyhedra (cubes / tetrahedra), for the Projects hero.
   Reads as "holographic archive vault" rather than a flat photo.
   Sized to its parent, same conventions as the other cyber canvases.
   ================================================================== */

const LIME = [187, 223, 77];
const CYAN = [61, 242, 255];

const TARGET_FPS = 45;
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

/* ---- simple wireframe solids, unit-scaled ---- */
const CUBE_VERTS = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const CUBE_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];
const TETRA_VERTS = [
  [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1],
];
const TETRA_EDGES = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
];

function buildShape(width, height) {
  const isCube = Math.random() < 0.55;
  return {
    verts: isCube ? CUBE_VERTS : TETRA_VERTS,
    edges: isCube ? CUBE_EDGES : TETRA_EDGES,
    x: rand(width * 0.1, width * 0.9),
    y: rand(height * 0.15, height * 1.05),
    size: rand(20, 42),
    speedY: rand(8, 18),
    rx: rand(0, Math.PI * 2),
    ry: rand(0, Math.PI * 2),
    vrx: rand(-0.3, 0.3),
    vry: rand(0.15, 0.45),
    color: Math.random() < 0.4 ? CYAN : LIME,
  };
}

export default function HoloGridBG() {
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
    let horizonY = 0;
    let gridOffset = 0;
    let shapes = [];
    let rafId = 0;
    let lastFrame = 0;
    let running = true;

    function seedShapes() {
      const count = width < 640 ? 4 : width < 1100 ? 6 : 8;
      shapes = new Array(count).fill(0).map(() => buildShape(width, height));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(r.width));
      height = Math.max(1, Math.round(r.height));
      horizonY = height * 0.32;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedShapes();
    }

    function drawFloor() {
      const cx = width / 2;
      const floorH = height - horizonY;

      // converging verticals
      ctx.strokeStyle = "rgba(61,242,255,0.14)";
      ctx.lineWidth = 1;
      const cols = 9;
      for (let i = -cols; i <= cols; i++) {
        const bottomX = cx + i * (width / (cols * 1.15));
        ctx.beginPath();
        ctx.moveTo(cx, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // flowing horizontals, compressed near the horizon
      const N = 16;
      ctx.strokeStyle = "rgba(187,223,77,0.16)";
      for (let i = 0; i < N; i++) {
        const t = ((i / N + gridOffset) % 1 + 1) % 1;
        const eased = Math.pow(t, 2.1);
        const y = horizonY + eased * floorH;
        const alpha = 0.05 + eased * 0.22;
        ctx.strokeStyle = `rgba(187,223,77,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // horizon glow line
      const g = ctx.createLinearGradient(0, horizonY - 1, 0, horizonY + 1);
      g.addColorStop(0, "rgba(61,242,255,0)");
      g.addColorStop(0.5, "rgba(61,242,255,0.5)");
      g.addColorStop(1, "rgba(61,242,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();
    }

    function project(v, rx, ry, ox, oy, size) {
      let [x, y, z] = v;
      // rotate Y
      const cy_ = Math.cos(ry), sy_ = Math.sin(ry);
      const x1 = x * cy_ + z * sy_;
      const z1 = -x * sy_ + z * cy_;
      // rotate X
      const cx_ = Math.cos(rx), sx_ = Math.sin(rx);
      const y1 = y * cx_ - z1 * sx_;
      const z2 = y * sx_ + z1 * cx_;

      const focal = 4;
      const scale = focal / (focal + z2);
      return {
        x: ox + x1 * scale * size,
        y: oy + y1 * scale * size,
        scale,
      };
    }

    function drawShapes(dt) {
      for (const s of shapes) {
        s.rx += s.vrx * dt;
        s.ry += s.vry * dt;
        s.y -= s.speedY * dt;
        if (s.y < -60) {
          Object.assign(s, buildShape(width, height));
          s.y = height + rand(0, 60);
        }

        const pts = s.verts.map((v) => project(v, s.rx, s.ry, s.x, s.y, s.size));
        const depthFade = Math.max(0.25, Math.min(1, s.y / height));
        ctx.strokeStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${0.55 * depthFade})`;
        ctx.lineWidth = 1.2;
        for (const [a, b] of s.edges) {
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.stroke();
        }
        // vertex glints
        ctx.fillStyle = `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${0.8 * depthFade})`;
        for (const p of pts) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function step(now) {
      if (!running) return;
      rafId = window.requestAnimationFrame(step);

      const elapsed = now - lastFrame;
      if (elapsed < FRAME_MS) return;
      const dt = Math.min(elapsed, 100) / 1000;
      lastFrame = now - (elapsed % FRAME_MS);

      ctx.clearRect(0, 0, width, height);
      gridOffset = (gridOffset + dt * 0.09) % 1;

      drawFloor();
      drawShapes(dt);
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

  return <canvas ref={canvasRef} className="holo-grid-bg" aria-hidden="true" />;
}
