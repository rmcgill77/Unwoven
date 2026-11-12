/* Builds Unwoven from src/parts into:
 *   build/test.html   local test page (React bundled from node_modules; used by the Playwright tests)
 *   build/artifact.html  single file for the private claude.ai artifact (React from cdnjs; music served beside it)
 *   dist/             the release: index.html + vendor.js + music/, ready for GitHub Pages or any static host
 * Usage: node scripts/build.cjs            (all)
 *        node scripts/build.cjs --dev      (also writes an unminified build/game.dev.js for profiling)
 */
const fs = require("fs"), path = require("path");
const esbuild = require("esbuild");
const ROOT = path.join(__dirname, ".."), r = (...p) => path.join(ROOT, ...p);
const pkg = require(r("package.json"));

// concatenation order matters: data before the code that reads it, the UI last
const PARTS = ["01_core.js", "02_chars.js", "02c_chibi_data.js", "02f_battle_data.js", "02g_elowyn_data.js", "02h_foes_data.js", "02j_crit_data.js", "02k_map_data.js",
  "02i_foes.js", "02d_chibi.js", "03a_world_p1.js", "03b_world.js", "03c_grim.js", "04_data.js", "04b_wilds.js", "04c_rooms.js", "05_engine.js", "06_minigames.js",
  "06e_battle.js", "06f_magic.js", "06g_gear.js", "06h_debug.js", "06k_music.js", "06b_splash.jsx", "06c_battleart.jsx", "06i_intro.jsx", "07_ui.jsx"];

const have = new Set(fs.readdirSync(r("src/parts")));
for (const p of PARTS) if (!have.has(p)) throw new Error("missing part " + p);
for (const p of have) if (!PARTS.includes(p)) console.warn("note: src/parts/" + p + " is not in the build order");

const full = PARTS.map((p) => fs.readFileSync(r("src/parts", p), "utf8")).join("\n");
const src = full.replace(/^import React[^\n]*\n/m, "const { useCallback, useEffect, useMemo, useRef, useState } = React;\n")
                .replace(/^export default function /m, "function ");
fs.mkdirSync(r("build"), { recursive: true });
fs.writeFileSync(r("build/game.src.jsx"), src);
const js = esbuild.transformSync(src, { loader: "jsx", jsx: "transform", target: "es2019", minify: true }).code;
fs.writeFileSync(r("build/game.min.js"), js);
if (process.argv.includes("--dev")) fs.writeFileSync(r("build/game.dev.js"), esbuild.transformSync(src, { loader: "jsx", jsx: "transform", target: "es2019" }).code);

const boot = `(function(){var root=ReactDOM.createRoot(document.getElementById("app"));function start(d){root.render(React.createElement(DurinnGame,{hot:d||{}}))}var h=window.claude&&window.claude.hot;if(h&&h.ready)h.ready(start);else start((h&&h.data)||{});})();`;
const meta = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#14101c">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="description" content="Unwoven: A Tale of Talvora. Act One playtest build.">
<meta name="apple-mobile-web-app-title" content="Unwoven">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
`;
// release only: catch the browser's install prompt before the game has loaded, and register the offline service worker
const pwa = `<script>window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__unwovenInstall=e});if("serviceWorker"in navigator&&/^https?:$/.test(location.protocol))window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});</script>
`;
const head = `<title>Unwoven: A Tale of Talvora</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;700&display=swap">
<style>
:root{color-scheme:dark;--ground:#14101c}
html,body{height:100%;margin:0;background:var(--ground);overflow:hidden;overscroll-behavior:none}
#app{position:fixed;inset:0}
</style>
<div id="app"><div style="position:fixed;inset:0;display:grid;place-items:center;color:#e8964a;font:clamp(13px,3.2vh,22px) monospace;letter-spacing:.38em;text-transform:uppercase;opacity:.7">Loading</div></div>
`;
const game = `<script>window.UNWOVEN_VERSION=${JSON.stringify(pkg.version)};\n(function(){\n${js}\nwindow.DurinnGame=DurinnGame;})();\n${boot}\n</script>\n`;

// React, bundled once from node_modules
fs.writeFileSync(r("build/vendor-entry.js"), 'import * as React from "react"; import * as ReactDOM from "react-dom/client"; window.React = React; window.ReactDOM = ReactDOM;');
esbuild.buildSync({ entryPoints: [r("build/vendor-entry.js")], bundle: true, format: "iife", minify: true, define: { "process.env.NODE_ENV": '"production"' }, outfile: r("build/vendor.js"), nodePaths: [r("node_modules")] });

// local test page (tests open build/test.html; music resolves to build/music)
fs.writeFileSync(r("build/test.html"), meta + head + `<script src="vendor.js"></script>\n` + game);
copyDir(r("public/music"), r("build/music"));
copyDir(r("public/icons"), r("build/icons"));
fs.copyFileSync(r("public/manifest.webmanifest"), r("build/manifest.webmanifest"));

// artifact page: the claude.ai artifact host supplies the document shell, so no doctype; React from cdnjs
fs.writeFileSync(r("build/artifact.html"), head + `<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
` + game);

// release
fs.rmSync(r("dist"), { recursive: true, force: true });
fs.mkdirSync(r("dist"), { recursive: true });
fs.copyFileSync(r("build/vendor.js"), r("dist/vendor.js"));
fs.writeFileSync(r("dist/index.html"), meta + head + pwa + `<script src="vendor.js"></script>\n` + game);
copyDir(r("public/music"), r("dist/music"));
copyDir(r("public/icons"), r("dist/icons"));
fs.copyFileSync(r("public/manifest.webmanifest"), r("dist/manifest.webmanifest"));
fs.writeFileSync(r("dist/sw.js"), fs.readFileSync(r("public/sw.template.js"), "utf8").replace(/__VERSION__/g, pkg.version));
fs.writeFileSync(r("dist/.nojekyll"), "");
console.log(`built Unwoven ${pkg.version}: ${js.length} bytes of game code -> dist/`);

function copyDir(a, b) { fs.mkdirSync(b, { recursive: true }); for (const f of fs.readdirSync(a)) fs.copyFileSync(path.join(a, f), path.join(b, f)); }
