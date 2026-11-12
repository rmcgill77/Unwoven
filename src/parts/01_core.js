/*
 * Unwoven: A Tale of Talvora — Phase 2 (Town shell)
 * Self-contained React component. No external assets: every tile, sprite and
 * portrait is drawn in code at load.
 *
 * Phase 1: pixel canvas, fixed-timestep loop, tile map, camera, collision,
 *          joystick and buttons, dialogue box, style guide.
 * Phase 2: authored map format with interiors and door warps, NPCs with daily
 *          schedules and pathfinding, branching dialogue with flags, six trade
 *          minigames, character creation, day clock with night lighting,
 *          shop and inventory, Day 1 work orders, localStorage saves.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TILE = 16;
const STEP = 1 / 60;
const SPEED = 72;            // player px per second at full stick
const NPC_SPEED = 40;
const RES_SHORT = 224;       // world resolution, short side
const WZ = 2;                // world zoom: tiles drawn at 2x so chibi sprites sit at native resolution
const MIN_PER_SEC = 1.25;    // in-game minutes per real second while exploring
const SAVE_KEY = "durinn.save.v1";
const SETTINGS_KEY = "durinn.settings.v2";
const SAVE_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */
const PAL = {
  ink: "#0f0d14", night: "#1a1626", shadow: "#2a2436",
  grassD: "#2a4430", grass: "#3d5c38", grassL: "#58763f", grassH: "#7d9552",
  pathD: "#6e5b42", path: "#8d7856", pathL: "#aa966c",
  waterD: "#1b3446", water: "#2a4f66", waterL: "#4a7a8e", foam: "#a9c4c8",
  stoneD: "#3e3e4a", stone: "#5f5f6c", stoneL: "#85858f",
  woodD: "#38261a", wood: "#58402a", woodL: "#7c5c3c",
  roofD: "#4a2a2a", roof: "#6c3c36", roofL: "#8c5648",
  leafD: "#1c3524", leaf: "#2b4a2c", leafL: "#456a38",
  leyD: "#2a7a7a", ley: "#6dccc4", leyL: "#c8f4ee",
  dirt: "#54402c", flowerR: "#a8505a", flowerY: "#c8ac58",
  parch: "#d8c9a6", white: "#e8e0d0", ember: "#d4823e",
  floorD: "#503a28", floor: "#6e5238", floorL: "#8a6a48",
  plasterD: "#8a7a5e", plaster: "#aa9a78", plasterL: "#c4b592",
  fireD: "#9a3e26", fireL: "#ecc468",
  metalD: "#2e2e38", metal: "#4c4c5a", metalL: "#7a7a8c",
  rugD: "#432030", rug: "#683044", rugL: "#8a4c58",
  glass: "#8fb4c4", glassN: "#243248", glow: "#f0c070",
  hideD: "#86603c", hide: "#a8825a", hideL: "#c4a07a",
  paper: "#e0d4b4", turnip: "#8a5a7c",
};

const PALETTE_GROUPS = [
  ["Ink and night", ["ink", "night", "shadow", "white", "parch", "paper"]],
  ["Grass", ["grassD", "grass", "grassL", "grassH"]],
  ["Path and dirt", ["pathD", "path", "pathL", "dirt"]],
  ["Water", ["waterD", "water", "waterL", "foam"]],
  ["Stone and metal", ["stoneD", "stone", "stoneL", "metalD", "metal", "metalL"]],
  ["Wood and floor", ["woodD", "wood", "woodL", "floorD", "floor", "floorL"]],
  ["Plaster", ["plasterD", "plaster", "plasterL"]],
  ["Roof and rug", ["roofD", "roof", "roofL", "rugD", "rug", "rugL"]],
  ["Leaves", ["leafD", "leaf", "leafL"]],
  ["Leyline", ["leyD", "ley", "leyL"]],
  ["Fire and light", ["fireD", "ember", "fireL", "glow"]],
  ["Glass and hide", ["glass", "glassN", "hideD", "hide", "hideL"]],
  ["Accents", ["flowerR", "flowerY", "turnip"]],
];

// Character colour ramps: l light, b base, d shadow, s deep shadow
const SKINS = [
  { name: "Fair", l: "#ecd2b8", b: "#dcb596", d: "#b88a6e", s: "#8a6050" },
  { name: "Warm", l: "#e4bc96", b: "#d0a07a", d: "#a8785a", s: "#7c523e" },
  { name: "Tan", l: "#c89a70", b: "#b0825a", d: "#85603f", s: "#5e412c" },
  { name: "Deep", l: "#94664a", b: "#785038", d: "#583a28", s: "#3c261b" },
  { name: "Pale", l: "#f4e2d2", b: "#e6c8b2", d: "#c4a08c", s: "#98786a" },
  { name: "Olive", l: "#d2b488", b: "#b8966a", d: "#8e7048", s: "#665030" },
  { name: "Umber", l: "#7a5238", b: "#62402c", d: "#46301f", s: "#2e2016" },
  { name: "Ebony", l: "#5a3c2c", b: "#432b20", d: "#2e1d15", s: "#1e130d" },
];
const HAIRS = [
  { name: "Black", l: "#4a3e44", b: "#272026", d: "#141016" },
  { name: "Brown", l: "#7a5c3c", b: "#563a26", d: "#33220f" },
  { name: "Auburn", l: "#a65a34", b: "#7c3e24", d: "#522a18" },
  { name: "Fair", l: "#d8c088", b: "#b69858", d: "#8a6e3a" },
  { name: "Ash", l: "#a8a8b0", b: "#7e7e88", d: "#555560" },
  { name: "White", l: "#e8e4dc", b: "#c8c4bc", d: "#9a968e" },
  { name: "Copper", l: "#c8703a", b: "#a4501e", d: "#703410" },
  { name: "Gold", l: "#ecd078", b: "#d2b04a", d: "#9c7a26" },
  { name: "Silver", l: "#cfd2dc", b: "#a2a6b4", d: "#6e7282" },
  { name: "Indigo", l: "#5a62a0", b: "#3c4478", d: "#262c52" },
  { name: "Forest", l: "#5c7c4c", b: "#3e5a34", d: "#263c20" },
  { name: "Rose", l: "#c8788c", b: "#a25468", d: "#6e3446" },
  { name: "Honey", l: "#e4a672", b: "#b86f50", d: "#743f39" },
];
const CLOTHS = [
  { name: "Blue", l: "#6a7f98", b: "#4a5f7a", d: "#33445a" },
  { name: "Green", l: "#6a8458", b: "#4a6240", d: "#34462e" },
  { name: "Red", l: "#9c5a52", b: "#7a3c3a", d: "#552828" },
  { name: "Brown", l: "#8c6c48", b: "#6c5236", d: "#4a3826" },
  { name: "Plum", l: "#76668a", b: "#564870", d: "#3c3252" },
  { name: "Grey", l: "#7c7c8a", b: "#5a5a68", d: "#40404c" },
  { name: "Ochre", l: "#b69a5c", b: "#94783e", d: "#6c562a" },
  { name: "Teal", l: "#5a8a8c", b: "#3c6a6c", d: "#274648" },
  { name: "Crimson", l: "#b0485a", b: "#862c40", d: "#5a1a2a" },
  { name: "Black", l: "#5a5660", b: "#3a3640", d: "#22202a" },
  { name: "Bone", l: "#d8ccb0", b: "#b4a888", d: "#8a7e64" },
];
const HAIR_STYLES = [
  { id: "short", name: "Short" }, { id: "long", name: "Long" },
  { id: "bun", name: "Bun" }, { id: "bald", name: "Shaved" },
];
const OUTFITS = [
  { id: "tunic", name: "Tunic" }, { id: "dress", name: "Dress" }, { id: "coat", name: "Long coat" },
];

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(r, g, b) { return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1); }
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(...A.map((v, i) => Math.round(v + (B[i] - v) * t)));
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];

/* Painterly grain: periodic value noise (seamless inside a tile) plus fine per-pixel grain. */
function texturize(canvas, amount = 1, seed = 1) {
  const w = canvas.width, h = canvas.height, cx = canvas.getContext("2d");
  const im = cx.getImageData(0, 0, w, h), d = im.data;
  const P = Math.max(2, Math.round(w / 4));
  const lat = [];
  for (let j = 0; j < P; j++) { lat.push([]); for (let i = 0; i < P; i++) lat[j].push((hash2(i + seed * 13, j + seed * 29) % 1000) / 1000 - 0.5); }
  const cell = w / P;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const o = (j * w + i) * 4;
    if (d[o + 3] < 200) continue;
    const fx = i / cell, fy = j / cell, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const a = lat[iy % P][ix % P], b = lat[iy % P][(ix + 1) % P], c = lat[(iy + 1) % P][ix % P], e = lat[(iy + 1) % P][(ix + 1) % P];
    const blot = (a + (b - a) * tx) * (1 - ty) + (c + (e - c) * tx) * ty;
    const grain = (hash2(i * 7 + seed * 3, j * 11 + seed) % 1000) / 1000 - 0.5;
    const k = (blot * 16 + grain * 8) * amount;
    d[o] = clamp(d[o] + k, 0, 255); d[o + 1] = clamp(d[o + 1] + k * 0.96, 0, 255); d[o + 2] = clamp(d[o + 2] + k * 0.9, 0, 255);
  }
  cx.putImageData(im, 0, 0);
  return canvas;
}
function strHash(str) { let h = 7; for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0; return Math.abs(h) % 997; }

/* A small pixel grid with an automatic ink outline pass. */
class Grid {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  set(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d[y * this.w + x] = c;
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.d[y * this.w + x];
  }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  outline(c) {
    // With no colour given the outline is "selective": a dark tone of the neighbouring pixel,
    // which reads as shading instead of a heavy black cartoon line.
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      const n = [this.get(x + 1, y), this.get(x - 1, y), this.get(x, y + 1), this.get(x, y - 1)].filter(Boolean);
      if (!n.length) continue;
      if (c) { add.push(x, y, c); continue; }
      // prefer the darkest neighbour; outlines under a shape are the darkest
      let best = n[0], bl = 999;
      for (const col of n) { const [r, g, b] = hexToRgb(col); const l = r * 0.3 + g * 0.59 + b * 0.11; if (l < bl) { bl = l; best = col; } }
      add.push(x, y, mix(best, PAL.ink, 0.72));
    }
    for (let i = 0; i < add.length; i += 3) this.set(add[i], add[i + 1], add[i + 2]);
    return this;
  }
  flip() {
    const g = new Grid(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) g.set(this.w - 1 - x, y, this.get(x, y));
    return g;
  }
  draw(ctx, ox = 0, oy = 0) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const c = this.d[y * this.w + x];
      if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); }
    }
  }
  toCanvas() {
    const c = makeCanvas(this.w, this.h);
    this.draw(c.getContext("2d"));
    return c;
  }
}

/* Storage: every access is guarded so the game runs without it. */
function storeGet(key) {
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function storeSet(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}
function storeDel(key) {
  try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

const DEFAULT_SETTINGS = { debug: false, fps: false, touch: "auto", wait: true, autoRelease: false };
function loadSettings() { return { ...DEFAULT_SETTINGS, ...(storeGet(SETTINGS_KEY) || {}) }; }

function formatClock(min) {
  const m = Math.floor(min) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
/* Day and night replace the clock: time is one of two fixed moments. */
const DAY_T = 9 * 60, NIGHT_T = 21 * 60 + 30;
const isNightT = (min) => { const h = (min / 60) % 24; return h >= 19 || h < 5; };
function partOfDay(min) {
  const h = (min / 60) % 24;
  if (h < 5) return "Night";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night";
}
function nightAmount(min) {
  const h = (min / 60) % 24;
  if (h < 5) return 1;
  if (h < 7) return 1 - (h - 5) / 2;
  if (h < 18) return 0;
  if (h < 20.5) return (h - 18) / 2.5;
  return 1;
}

/* The world's overcast grade, for canvases drawn outside the engine (battle, minigames). */
function overcastGrade(ctx, w, h, k = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "saturation"; ctx.globalAlpha = 0.24 * k; ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = k; ctx.fillStyle = "#dfe3ea"; ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
