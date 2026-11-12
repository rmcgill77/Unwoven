
/* ------------------------------------------------------------------ */
/* React shell                                                         */
/* ------------------------------------------------------------------ */
const CSS = `
.dz-root{--ink:${PAL.ink};--night:${PAL.night};--panel:#241e36;--panel2:#2c2542;--edge:#3f3658;--text:${PAL.white};--muted:#b4a8c8;--ley:${PAL.ley};--ember:${PAL.ember};--parch:${PAL.parch};--good:${PAL.leafL};--bad:${PAL.flowerR};
  position:absolute;inset:0;overflow:hidden;background:var(--ink);color:var(--text);touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;
  font-family:'Pixelify Sans',ui-monospace,'Courier New',monospace;-webkit-tap-highlight-color:transparent}
.dz-root button{font-family:inherit}
@keyframes dzshake{0%{transform:translate(0,0)}15%{transform:translate(-6px,3px)}30%{transform:translate(5px,-4px)}45%{transform:translate(-4px,-2px)}60%{transform:translate(3px,3px)}80%{transform:translate(-2px,1px)}100%{transform:translate(0,0)}}
.dz-root.dz-shake{animation:dzshake .55s ease-out}
.dz-canvas{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);image-rendering:pixelated;image-rendering:crisp-edges}
.dz-frame{background:rgba(31,26,46,.92);border:2px solid var(--ink);box-shadow:inset 0 0 0 2px var(--edge),0 3px 0 var(--ink)}
.dz-hud{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));left:calc(10px + env(safe-area-inset-left,0px));display:grid;gap:6px;pointer-events:none;max-width:min(300px,calc(100% - 90px))}
.dz-hudbox{padding:8px 10px;display:grid;gap:3px}
.dz-zone{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--parch)}
.dz-time{font-size:12px;color:var(--text);font-variant-numeric:tabular-nums;display:flex;gap:8px;justify-content:space-between}
.dz-time b{font-weight:500;color:var(--ember)}
.dz-ley{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)}
.dz-ley-ico{width:8px;height:8px;background:var(--ley);box-shadow:0 0 0 2px var(--ink);transform:rotate(45deg);flex:none}
.dz-bar{height:5px;background:var(--ink);box-shadow:0 0 0 1px var(--edge)}
.dz-bar>i{display:block;height:100%;width:30%;background:var(--ley);transition:width .1s linear}
.dz-bar>i[data-wild="1"]{background:var(--ember)}
.dz-task{padding:6px 10px;font-size:12px;line-height:1.35;display:grid;gap:2px}
.dz-task small{color:var(--muted);font-size:11px}
.dz-task::before{content:"Task";font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ley)}
.dz-fps{position:absolute;bottom:calc(6px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);font-size:11px;color:var(--muted);pointer-events:none;font-variant-numeric:tabular-nums}
.dz-hint{position:absolute;bottom:calc(10px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);font-size:12px;color:var(--muted);padding:5px 10px;white-space:nowrap;pointer-events:none}
.dz-ctl{position:absolute;inset:0}
.dz-joy-base{position:absolute;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;background:rgba(20,16,28,.35);border:2px solid rgba(244,236,220,.35);pointer-events:none;opacity:.55;transition:opacity .12s}
.dz-joy-base[data-active="1"]{opacity:1}
.dz-joy-knob{position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(244,236,220,.85);box-shadow:inset 0 -4px 0 rgba(20,16,28,.35),0 0 0 2px var(--ink)}
.dz-btn{position:absolute;display:grid;place-items:center;border:none;color:var(--ink);font-weight:700;cursor:pointer;touch-action:none;
  clip-path:polygon(28% 0,72% 0,100% 28%,100% 72%,72% 100%,28% 100%,0 72%,0 28%)}
.dz-btn span{display:block;line-height:1}
.dz-btn small{display:block;font-size:10px;font-weight:500;letter-spacing:.06em;margin-top:2px}
.dz-btn[data-down="1"]{filter:brightness(.8);transform:translateY(2px)}
.dz-btn[data-off="1"]{filter:grayscale(1) brightness(.55);opacity:.7}
.dz-btn span{font-size:14px;letter-spacing:.04em;text-transform:uppercase}
.dz-btn-a span{font-size:11.5px}.dz-btn-b span{font-size:12px}
.dz-btn-a{width:74px;height:74px;right:calc(22px + env(safe-area-inset-right,0px));bottom:calc(34px + env(safe-area-inset-bottom,0px));background:var(--parch);font-size:24px}
.dz-gear{display:grid;grid-template-columns:minmax(170px,200px) 1fr minmax(120px,160px);gap:12px;align-items:start}
.dz-gslots,.dz-glist{display:grid;gap:6px;min-width:0}.dz-glist small,.dz-gslot small,.dz-gstats small{font-size:10px;letter-spacing:.1em;opacity:.65}
.dz-gslot{display:grid;grid-template-columns:44px 1fr;gap:8px;align-items:center;text-align:left;padding:4px;border:2px solid var(--edge);background:var(--night);color:var(--text);font:inherit;cursor:pointer}
.dz-gslot[aria-pressed="true"]{border-color:var(--parch)}.dz-gslot span{display:grid;gap:1px;min-width:0}.dz-gslot b{font-weight:500;font-size:13px}.dz-gslot em{font-style:normal;font-size:11px;color:#8fd18f}
.dz-gicon{width:44px;height:44px;display:grid;place-items:center;background:#0e0b14}
.dz-grow{display:grid;grid-template-columns:44px 1fr auto;gap:8px;align-items:center;padding:4px;border:2px solid var(--edge);background:var(--night)}
.dz-grow em{font-style:normal;font-size:11px;color:#8fd18f}.dz-grow span{display:block;font-size:11px;opacity:.75;line-height:1.3}
.dz-gstats{border:2px solid var(--edge);padding:8px;background:var(--night)}.dz-gstats i{font-style:normal;color:#8fd18f;font-size:12px}
@media (max-width:640px){.dz-gear{grid-template-columns:1fr}}
.dz-tools{display:grid;gap:8px;margin-top:8px}.dz-tools h4{margin:6px 0 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.65;font-weight:500}
.dz-toolgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}.dz-toolgrid .dz-opt{text-align:left}
.dz-sel{font:inherit;font-size:14px;color:var(--text);background:var(--night);border:2px solid var(--edge);padding:6px 8px;max-width:100%}
.dz-btn-pack{width:54px;height:54px;right:calc(32px + env(safe-area-inset-right,0px));bottom:calc(120px + env(safe-area-inset-bottom,0px));background:var(--night);color:var(--text);box-shadow:inset 0 0 0 2px var(--edge)}
.dz-btn-pack span{font-size:11px}
.dz-btn-b{width:58px;height:58px;right:calc(108px + env(safe-area-inset-right,0px));bottom:calc(20px + env(safe-area-inset-bottom,0px));background:var(--ley);font-size:19px}
.dz-dn{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:calc(62px + env(safe-area-inset-right,0px));height:44px;padding:0 12px;border:2px solid var(--ink);background:var(--panel);box-shadow:inset 0 0 0 2px var(--edge);color:var(--text);font:inherit;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:6px}
.dz-dn i{font-style:normal;font-size:16px}
.dz-menu-btn{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:calc(10px + env(safe-area-inset-right,0px));width:44px;height:44px;border:2px solid var(--ink);background:var(--panel);box-shadow:inset 0 0 0 2px var(--edge);color:var(--text);font-size:18px;cursor:pointer;display:grid;place-items:center}
.dz-root button:focus-visible,.dz-root input:focus-visible{outline:2px solid var(--ley);outline-offset:2px}
.dz-dialog{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));width:min(720px,calc(100% - 24px));padding:12px 14px;display:flex;gap:12px;align-items:flex-start;cursor:pointer}
.dz-portrait .dz-pix{width:100%!important;height:100%!important}
.dz-portrait{flex:none;width:128px;height:128px;background:var(--night);box-shadow:0 0 0 2px var(--edge),inset 0 -20px 0 var(--panel2);display:grid;place-items:end center;overflow:hidden}
.dz-dbody{min-width:0;flex:1;display:grid;gap:6px}
.dz-name{justify-self:start;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink);background:var(--parch);padding:2px 6px}
.dz-name small{font-size:10px;letter-spacing:.06em;color:var(--wood,#6e4428);margin-left:6px;text-transform:none}
.dz-text{font-size:17px;line-height:1.35;min-height:2.7em}
.dz-text[data-narr="1"]{color:var(--parch);font-style:italic}
.dz-more{float:right;color:var(--ley);animation:dzblink .8s steps(2) infinite}
@keyframes dzblink{50%{opacity:0}}
.dz-choices{display:grid;gap:6px}
.dz-choice{text-align:left;font-size:15px;color:var(--text);background:var(--night);border:2px solid var(--edge);padding:7px 10px;cursor:pointer}
.dz-choice[data-sel="1"]{border-color:var(--parch);background:var(--panel2)}
.dz-choice[data-sel="1"]::before{content:"\\25B6  ";color:var(--ley)}
.dz-toast{position:absolute;bottom:calc(22px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);padding:9px 16px;font-size:16px;line-height:1.3;font-weight:600;color:var(--ink);background:var(--parch);border:2px solid var(--ink);box-shadow:0 0 0 2px var(--edge),0 4px 0 rgba(10,6,22,.6);pointer-events:none;text-align:center;width:max-content;max-width:clamp(240px,calc(100% - 420px),460px);z-index:5;animation:dztoast .22s ease-out}
@keyframes dztoast{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
.dz-overlay{position:absolute;inset:0;background:rgba(20,16,28,.72);display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);place-items:center;padding:calc(10px + env(safe-area-inset-top,0px)) max(10px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(10px,env(safe-area-inset-left,0px));touch-action:auto;z-index:4}
.dz-panel{width:min(820px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--panel);border:2px solid var(--ink);box-shadow:inset 0 0 0 2px var(--edge),0 4px 0 var(--ink);min-height:0}
.dz-phead{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:2px solid var(--edge);flex-wrap:wrap}
.dz-ptitle{font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:var(--parch);margin-right:auto}
.dz-tab,.dz-opt,.dz-close,.dz-act{font-size:14px;color:var(--text);background:var(--night);border:2px solid var(--edge);padding:6px 10px;cursor:pointer}
.dz-tab[aria-selected="true"],.dz-opt[aria-pressed="true"]{background:var(--parch);color:var(--ink);border-color:var(--ink)}
.dz-act{background:var(--parch);color:var(--ink);border-color:var(--ink);font-weight:500}
.dz-act:disabled{opacity:.4;cursor:default}
.dz-act[data-tone="danger"]{background:var(--bad);color:var(--ink)}
.dz-pbody{overflow:auto;padding:14px;display:grid;gap:18px;user-select:text;-webkit-user-select:text;touch-action:pan-y;min-height:0}
.dz-sec h3{margin:0 0 8px;font-size:13px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.dz-sec p{margin:0 0 10px;font-size:14px;line-height:1.45;max-width:62ch}
.dz-swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.dz-group{display:grid;gap:4px}
.dz-group b{font-size:12px;font-weight:500;color:var(--muted)}
.dz-sw{display:flex;align-items:center;gap:6px;font-size:12px;font-variant-numeric:tabular-nums}
.dz-sw i{width:18px;height:18px;box-shadow:0 0 0 2px var(--ink);flex:none}
.dz-sw code{font-family:inherit;color:var(--muted)}
.dz-grid{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.dz-fig{margin:0;display:grid;gap:4px;justify-items:center}
.dz-fig figcaption{font-size:11px;color:var(--muted)}
.dz-pix{image-rendering:pixelated;image-rendering:crisp-edges;display:block}
.dz-pixbg{background:var(--night);box-shadow:0 0 0 2px var(--edge)}
.dz-opts{display:flex;flex-wrap:wrap;gap:8px}
.dz-optnote{font-size:12px;color:var(--muted);margin-top:6px}
.dz-check{list-style:none;margin:0;padding:0;display:grid;gap:8px;font-size:14px}
.dz-check li{display:grid;grid-template-columns:18px 1fr;gap:6px}
.dz-check li::before{content:"\\25C7";color:var(--muted)}
.dz-check li[data-done="1"]{color:var(--muted);text-decoration:line-through}
.dz-check li[data-done="1"]::before{content:"\\25C6";color:var(--good)}
.dz-check small{grid-column:2;color:var(--muted);font-size:12px;text-decoration:none}
.dz-stat{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:14px;font-variant-numeric:tabular-nums}
.dz-stat dt{color:var(--muted)}
.dz-stat dd{margin:0}
.dz-xp{height:8px;background:var(--ink);box-shadow:0 0 0 1px var(--edge);margin-top:4px}
.dz-xp i{display:block;height:100%;background:var(--ember)}
.dz-items{display:grid;gap:8px}
.dz-item{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:8px 10px;background:var(--night);border:2px solid var(--edge)}
.dz-item b{font-weight:500}
.dz-item span{font-size:12px;color:var(--muted);grid-column:1}
.dz-item em{font-style:normal;color:var(--parch);grid-row:1;grid-column:2;font-variant-numeric:tabular-nums}
.dz-item .dz-act{grid-row:1/3;grid-column:2;align-self:center}
.dz-coins{font-size:14px;color:var(--ember);font-variant-numeric:tabular-nums}
.dz-confirm{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13px;color:var(--parch)}
/* battle mock-up */
.dz-battle{position:absolute;inset:0;z-index:40;background:#0b090e;display:flex;flex-direction:column}
.dz-bstage{position:relative;flex:1 1 0;min-height:0;overflow:hidden;display:grid;place-items:center}
.dz-bcv{image-rendering:pixelated;image-rendering:crisp-edges;display:block}
.dz-btop{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));left:calc(10px + env(safe-area-inset-left,0px));display:flex;align-items:center;gap:10px;padding:6px 12px;min-width:210px;max-width:calc(100% - 150px);white-space:nowrap}
@media (max-width:600px){.dz-btop{min-width:0;gap:6px;padding:5px 8px;font-size:14px;max-width:calc(100% - 140px);overflow:hidden}}
.dz-btop b{font-weight:500;letter-spacing:.06em}.dz-btop span{font-size:12px;color:var(--muted)}
.dz-btop .dz-bhp{flex:1;min-width:80px}
.dz-bclose{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));right:calc(10px + env(safe-area-inset-right,0px));padding:6px 10px;font-size:13px}
.dz-bpanel{flex:none;display:flex;gap:8px;padding:8px calc(10px + env(safe-area-inset-right,0px)) calc(8px + env(safe-area-inset-bottom,0px)) calc(10px + env(safe-area-inset-left,0px));background:linear-gradient(180deg,rgba(11,9,14,.0),#0b090e 30%)}
.dz-bcmd{display:grid;gap:2px;padding:6px 8px;min-width:132px;align-content:start}
.dz-bcmd[data-stage="spell"],.dz-bcmd[data-stage="root"],.dz-bcmd[data-stage="suf"]{grid-template-columns:repeat(2,max-content);column-gap:10px}.dz-bwho{grid-column:1/-1}
@media (max-height:430px){.dz-bc{min-height:22px;padding:1px 6px 1px 14px;font-size:12px}.dz-bcmd[data-stage="suf"]{grid-template-columns:repeat(3,max-content)}.dz-bcmd{padding:4px 6px}.dz-brel{bottom:calc(120px + env(safe-area-inset-bottom,0px))}}
.dz-tome{display:grid;gap:14px}.dz-hot{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.dz-slot{border:2px solid var(--edge);background:var(--night);padding:8px;min-height:54px;display:grid;gap:2px;text-align:left;color:var(--text);cursor:pointer;font-size:14px}.dz-slot small{color:var(--muted);font-size:11px}
.dz-slot[aria-pressed="true"]{border-color:var(--parch)}.dz-slot[data-empty="1"]{color:var(--muted)}
.dz-chips{display:flex;flex-wrap:wrap;gap:6px}.dz-chip{font-size:14px;padding:5px 10px;border:2px solid var(--edge);background:var(--night);color:var(--text);cursor:pointer}
.dz-chip[aria-pressed="true"]{background:var(--parch);color:var(--ink);border-color:var(--ink)}.dz-chip[data-unk="1"]{color:var(--muted);border-style:dashed;cursor:default}.dz-chip[data-forb="1"]{border-color:#7a3a4a}
.dz-prev{border:2px solid var(--edge);padding:10px 12px;display:grid;gap:6px;background:var(--panel2)}.dz-prev h4{margin:0;font-size:18px;letter-spacing:.06em;color:var(--parch);font-weight:500}.dz-prev p{margin:0;font-size:13px;color:var(--text)}.dz-prev .dz-why{color:var(--bad)}
.dz-prev dl{display:flex;gap:16px;flex-wrap:wrap;margin:0;font-size:12px;color:var(--muted)}.dz-prev dd{margin:0;color:var(--text)}.dz-prev div.dz-row2{display:flex;gap:6px;flex-wrap:wrap}
.dz-torn{font-size:12px;color:var(--muted);font-style:italic}
.dz-castm{position:absolute;left:50%;bottom:calc(88px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:5;padding:8px 10px;display:grid;gap:4px;min-width:200px}
.dz-castm .dz-bc{padding:4px 10px 4px 18px}
.dz-tut{position:absolute;inset:0;z-index:45;background:rgba(11,9,14,.9);display:grid;place-items:center;padding:12px;touch-action:none}
.dz-tutcard{display:grid;gap:10px;justify-items:center;text-align:center;max-width:460px;padding:16px 20px}
.dz-tutcard h3{margin:0;font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:var(--parch)}.dz-tutcard p{margin:0;font-size:14px;color:var(--text)}
.dz-ring{position:relative;width:150px;height:150px;touch-action:none;user-select:none;-webkit-user-select:none}.dz-ring canvas{width:100%;height:100%;display:block}
.dz-tut-steps{display:flex;gap:6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.dz-tut-steps b{font-weight:500;padding:2px 6px;border:1px solid var(--edge)}.dz-tut-steps b[data-on="1"]{color:var(--ink);background:var(--parch)}.dz-tut-steps b[data-done="1"]{color:var(--parch)}
.dz-bwho{font-size:11px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;padding:0 4px 2px}.dz-bwait{padding:6px 10px;color:var(--muted)}
.dz-bc{font-size:14px;color:var(--text);background:transparent;border:none;text-align:left;padding:3px 8px 3px 16px;cursor:pointer;position:relative;min-height:28px}
.dz-bc small{color:var(--muted);font-size:10px;margin-left:4px}.dz-bc:hover:not(:disabled),.dz-bc:focus-visible{color:var(--parch);outline:none}
.dz-bc:hover:not(:disabled)::before,.dz-bc:focus-visible::before{content:"\\25B6";position:absolute;left:2px;color:var(--ley);font-size:10px;top:8px}
.dz-bc:disabled{opacity:.35;cursor:default}.dz-back{color:var(--muted)}
.dz-bfoe{display:flex;align-items:center;gap:8px;min-width:170px}.dz-bfoe[data-ko="1"]{opacity:.35}
.dz-btop{flex-direction:column;align-items:stretch;gap:4px}
.dz-brow[data-sel="1"]{background:rgba(233,217,180,.08);box-shadow:inset 2px 0 0 var(--parch)}.dz-brow[data-ko="1"]{opacity:.45}.dz-bhp i[data-low="1"]{background:#d85a4a}
.dz-bmp{font-size:10px;color:var(--muted);min-height:11px}.dz-lvup{color:var(--ember)}
.dz-bbadge{font-style:normal;font-size:10px;color:#a8c8ff;letter-spacing:.06em;min-width:44px}
.dz-blog{position:absolute;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));font-size:12px;color:#a8c8ff;background:rgba(11,9,14,.7);padding:0 8px;max-width:50%;text-align:center;pointer-events:none}.dz-blog:empty{display:none}
.dz-brel{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom,0px));width:min(380px,calc(100% - 24px));padding:8px 12px;display:grid;gap:6px;z-index:6}
.dz-brel-t{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--parch)}
.dz-brel-bar{position:relative;height:14px;background:var(--ink);box-shadow:0 0 0 1px var(--edge)}.dz-brel-bar i{position:absolute;top:0;bottom:0}
.dz-brel-ok{background:rgba(180,160,230,.35)}.dz-brel-sw{background:rgba(255,232,144,.8)}.dz-brel-bar b{position:absolute;top:-2px;bottom:-2px;width:3px;background:var(--parch);transform:translateX(-1px)}
.dz-brel .dz-act{padding:12px;font-size:17px;letter-spacing:.14em;touch-action:none}
.dz-bcmd div{padding:2px 8px 2px 16px;font-size:14px;color:var(--muted);position:relative}
.dz-bcmd div[data-sel="1"]{color:var(--parch)}.dz-bcmd div[data-sel="1"]::before{content:"\\25B6";position:absolute;left:2px;color:var(--ley);font-size:10px;top:5px}
.dz-bparty{flex:1;align-content:center;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px 12px;padding:6px 10px}
.dz-brow{display:flex;gap:8px;align-items:center;min-width:0;padding:3px 4px}
.dz-bchip{flex:none;width:42px;height:42px;background:var(--night);box-shadow:0 0 0 2px var(--edge);overflow:hidden;display:grid;place-items:center}
.dz-bchip .dz-pix{width:42px!important;height:42px!important}
.dz-binfo{flex:1;min-width:0;display:grid;gap:3px}
.dz-bname{display:flex;gap:6px;align-items:baseline;font-size:13px}.dz-bname b{font-weight:500}.dz-bname small{color:var(--muted);font-size:10px}.dz-bname span{margin-left:auto;font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.dz-bhp{height:6px;background:var(--ink);box-shadow:0 0 0 1px var(--edge)}.dz-bhp i{display:block;height:100%;background:#9cc860}
.dz-batb{height:4px;background:var(--ink);box-shadow:0 0 0 1px var(--edge)}.dz-batb i{display:block;height:100%;width:0;background:var(--ember)}.dz-batb i[data-full="1"]{background:var(--parch)}
@media (max-height:430px){.dz-bpanel{padding-top:4px}.dz-bcmd div{font-size:12px}.dz-bchip{width:34px;height:34px}.dz-bchip .dz-pix{width:34px!important;height:34px!important}}
/* splash */
.dz-splash{position:absolute;inset:0;z-index:50;background:#0b090e;display:grid;place-items:center;touch-action:none;cursor:default}
.dz-splash-cv{width:100%;height:100%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;display:block}
/* title */
.dz-title{position:absolute;inset:0;display:grid;place-items:center;padding:16px;z-index:3;background:linear-gradient(180deg,rgba(20,16,28,.2),rgba(20,16,28,.75))}
.dz-tcard{display:grid;gap:14px;justify-items:center;text-align:center;padding:22px 26px;width:min(420px,100%)}
.dz-logo{font-size:44px;line-height:1;letter-spacing:.18em;color:var(--parch);text-shadow:0 3px 0 var(--ink),0 0 18px rgba(122,224,212,.35);margin:0;padding-left:.18em}
.dz-sub{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--ley)}
.dz-tbtns{display:grid;gap:8px;width:100%}
.dz-tbtns .dz-act,.dz-tbtns .dz-opt{width:100%;padding:10px;font-size:16px}
.dz-tsave{font-size:12px;color:var(--muted)}
.dz-tbtns .dz-install{border-color:var(--ember);color:var(--ember);letter-spacing:.06em}.dz-install b{font-weight:500;color:var(--parch)}
@media (max-height:360px){.dz-tcard{gap:6px;padding:10px 22px}.dz-logo{font-size:32px}.dz-tbtns{grid-template-columns:1fr 1fr;gap:6px}.dz-tbtns>.dz-act,.dz-tbtns>.dz-tsave,.dz-tbtns>.dz-install,.dz-tbtns>.dz-tsteps,#dz-title-ios-back,#dz-title-cancel{grid-column:1/-1}.dz-tbtns .dz-act,.dz-tbtns .dz-opt{padding:7px;font-size:15px}}
.dz-tsteps{margin:0;padding-left:18px;display:grid;gap:6px;font-size:14px;line-height:1.4;text-align:left;color:var(--text)}
.dz-tfoot{font-size:11px;color:var(--muted)}
/* creator */
.dz-create{display:grid;grid-template-columns:minmax(180px,240px) 1fr;min-height:0;flex:1}
.dz-preview{overflow:hidden;min-height:0;display:grid;gap:10px;justify-items:center;align-content:start;padding:14px;border-right:2px solid var(--edge);background:var(--panel2)}
.dz-pname{font-size:16px;color:var(--parch);text-align:center}
.dz-ptrade{font-size:12px;color:var(--muted);text-align:center}
.dz-cbody{overflow:auto;padding:14px;display:grid;gap:16px;align-content:start;min-width:0;touch-action:pan-y}
.dz-trades{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
.dz-trade{text-align:left;display:grid;gap:3px;padding:9px 10px;background:var(--night);border:2px solid var(--edge);color:var(--text);cursor:pointer}
.dz-trade[aria-pressed="true"]{border-color:var(--parch);background:var(--panel2)}
.dz-trade b{font-size:15px;font-weight:500}
.dz-trade i{font-style:normal;font-size:12px;color:var(--ember)}
.dz-trade span{font-size:12px;color:var(--muted)}
.dz-row{display:grid;gap:6px}
.dz-row>b{font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.dz-sws{display:flex;flex-wrap:wrap;gap:8px}
.dz-swb{width:34px;height:34px;border:2px solid var(--ink);box-shadow:0 0 0 2px var(--edge);cursor:pointer;padding:0}
.dz-swb[aria-pressed="true"]{box-shadow:0 0 0 2px var(--parch)}
.dz-pills{display:flex;flex-wrap:wrap;gap:6px}
.dz-pill{min-height:38px;padding:4px 12px;border:2px solid var(--edge);background:rgba(0,0,0,.25);color:var(--parch);font:inherit;font-size:13px;cursor:pointer}
.dz-pill[aria-pressed="true"]{border-color:var(--parch);background:rgba(233,217,180,.18);font-weight:700}
.dz-field{display:flex;gap:8px;flex-wrap:wrap}
.dz-input{font-family:inherit;font-size:18px;padding:8px 10px;background:var(--night);color:var(--text);border:2px solid var(--edge);min-width:0;flex:1 1 160px;user-select:text;-webkit-user-select:text}
.dz-cfoot{display:flex;gap:8px;justify-content:space-between;padding:8px 10px;border-top:2px solid var(--edge)}
.dz-steps{font-size:12px;color:var(--muted);align-self:center}
/* minigame */
.dz-mg{width:min(760px,100%);height:min(560px,100%);display:flex;flex-direction:column}
.dz-mgwrap{flex:1 1 0;min-height:0;display:grid;place-items:center;background:var(--ink);overflow:hidden;position:relative}
.dz-mgcanvas{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);image-rendering:pixelated;image-rendering:crisp-edges;touch-action:none;display:block}
.dz-mgover{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,16,28,.78);padding:12px}
.dz-mgcard{display:grid;gap:10px;justify-items:center;text-align:center;max-width:44ch}
.dz-mgcard p{margin:0;font-size:15px;line-height:1.4}
.dz-mgcard small{font-size:12px;color:var(--muted)}
.dz-grade{font-size:30px;color:var(--parch);letter-spacing:.08em}
.dz-reward{display:flex;gap:14px;font-size:14px;color:var(--ember);font-variant-numeric:tabular-nums}
@media (max-width:620px){.dz-create{grid-template-columns:1fr}.dz-preview{border-right:none;border-bottom:2px solid var(--edge);grid-template-columns:auto 1fr;align-items:center;justify-items:start}}
@media (max-height:430px){.dz-portrait{width:96px;height:96px}.dz-text{font-size:15px}.dz-logo{font-size:34px}.dz-tcard{gap:10px;padding:14px 18px}}
.dz-root>:not(canvas):not(style):not(.dz-battle):not(.dz-splash):not(.dz-fps):not(.dz-ctl){zoom:var(--uiz,1)}.dz-battle .dz-bpanel,.dz-battle .dz-btop{zoom:var(--uiz,1)}
.dz-rotate{position:absolute;inset:0;z-index:99;background:var(--ink);display:grid;place-content:center;justify-items:center;gap:18px;text-align:center;padding:24px;color:var(--text)}
.dz-rotate h2{margin:0;font-size:24px;letter-spacing:1px}.dz-rotate p{margin:0;max-width:300px;color:var(--muted);font-size:16px;line-height:1.35}
.dz-rphone{width:54px;height:92px;border:4px solid var(--parch);border-radius:8px;position:relative;animation:dzrot 2.6s ease-in-out infinite;box-shadow:0 0 0 2px var(--edge)}
.dz-rphone::after{content:"";position:absolute;left:50%;bottom:6px;width:14px;height:3px;margin-left:-7px;background:var(--parch);opacity:.6}
/* foldables: Z Fold cover screen is very wide and short, the open screen is nearly square */
@media (max-height:430px) and (min-aspect-ratio:3/2){
.dz-tome{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:start;gap:10px 14px}
.dz-tome>div:nth-child(1),.dz-tome>div:nth-child(2){grid-column:1}.dz-tome>.dz-prev{grid-column:2;grid-row:1 / span 2}.dz-tome>.dz-torn{grid-column:2;margin:0}
.dz-chip{padding:3px 8px;font-size:13px}.dz-slot{min-height:44px;padding:5px 8px}
}
@media (max-height:380px){
.dz-hudbox{padding:5px 8px;gap:2px}.dz-task{padding:4px 8px}.dz-task small{display:none}.dz-zone{font-size:12px}
.dz-tome>.dz-torn{display:none}.dz-dialog{padding:8px 12px}.dz-text{font-size:14px}.dz-portrait{width:72px;height:72px}
.dz-tutcard{gap:6px;padding:8px 14px}.dz-ring{width:110px;height:110px}.dz-tutcard h3{font-size:13px}
}
@media (min-aspect-ratio:2/1){.dz-hud{max-width:min(300px,28vw)}.dz-dialog{width:min(760px,calc(100% - 260px))}}
@media (min-width:700px) and (min-height:600px) and (max-aspect-ratio:5/4){.dz-btn-a{width:88px;height:88px}.dz-btn-pack{width:64px;height:64px;right:calc(38px + env(safe-area-inset-right,0px));bottom:calc(136px + env(safe-area-inset-bottom,0px))}.dz-btn-b{width:68px;height:68px;right:calc(130px + env(safe-area-inset-right,0px))}.dz-dialog{width:min(720px,calc(100% - 40px))}}
@media (max-height:380px){
.dz-bcmd[data-stage="cmd"]{grid-template-columns:repeat(2,max-content);column-gap:8px;min-width:0}.dz-bcmd[data-stage="cmd"] .dz-bwho{grid-column:1/-1}
.dz-bparty{padding:2px 6px;gap:2px 8px}.dz-bpanel{gap:6px;padding-bottom:4px}.dz-btop{padding:3px 8px}
}
.dz-dicep{width:min(520px,100%)}.dz-dbody{padding:12px 16px 16px;display:grid;gap:8px;justify-items:center;text-align:center}
.dz-dsub{color:var(--muted);font-size:13px}.dz-dcoin{margin-left:auto;color:var(--ember);font-size:13px}
.dz-drules{margin:0;font-size:14px;color:var(--text);max-width:380px}.dz-dlabel{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.dz-dicerow{display:flex;gap:16px;justify-content:center;padding:4px 0 14px}.dz-dbtns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.dz-die{width:56px;height:56px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);padding:8px;background:var(--parch);border:2px solid var(--ink);box-shadow:0 3px 0 var(--ink);position:relative;cursor:pointer;transition:transform .08s}
.dz-die:disabled{cursor:default}.dz-die i{border-radius:50%;margin:1px}.dz-die i[data-on="1"]{background:var(--ink)}.dz-die[data-dim="1"]{background:var(--night);box-shadow:inset 0 0 0 2px var(--edge)}
.dz-die[data-held="1"]{transform:translateY(-5px);outline:3px solid var(--ley)}.dz-die-hold{position:absolute;left:0;right:0;bottom:-17px;font-size:9px;letter-spacing:.12em;color:var(--ley)}
.dz-dres{margin:0;font-size:15px;color:var(--parch)}.dz-dres[data-out="lose"]{color:var(--bad)}.dz-dres i{display:block;font-size:13px;color:var(--muted);margin-top:2px}
@media (max-height:430px){.dz-die{width:44px;height:44px;padding:6px}.dz-dicerow{gap:12px;padding:2px 0 12px}.dz-dbody{padding:6px 12px 10px;gap:4px}.dz-drules{font-size:12px}}
@keyframes dzrot{0%,25%{transform:rotate(0)}55%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
@media (prefers-reduced-motion:reduce){.dz-rphone{animation:none;transform:rotate(-90deg)}}
@media (max-width:1000px) and (min-width:621px){.dz-dialog{width:calc(100% - 330px);left:calc(50% - 6px)}}
@media (max-height:440px){.dz-preview{padding:8px;gap:4px}.dz-preview .dz-wspr{display:none}.dz-preview .dz-portrait{width:112px!important;height:112px!important}.dz-wspr{display:none}.dz-pname{font-size:15px}.dz-ptrade{font-size:12px}.dz-create{grid-template-columns:minmax(150px,190px) 1fr}}
@media (prefers-reduced-motion:reduce){.dz-more{animation:none}.dz-bar>i{transition:none}}
/* battle commands: large tiles for thumbs */
.dz-battle .dz-bcmd{min-width:min(440px,54vw);max-width:58vw;padding:6px;gap:6px;grid-template-columns:repeat(3,minmax(0,1fr))!important;align-content:start}
.dz-battle .dz-bcmd .dz-bwho{grid-column:1/-1;padding:0 2px;font-size:11px}.dz-battle .dz-bcmd .dz-bwho i{font-style:normal;color:#8a80a0;text-transform:none;letter-spacing:0}
.dz-battle .dz-bcmd .dz-bc{min-height:48px;padding:6px 6px;text-align:center;font-size:15px;font-weight:600;color:var(--text);background:var(--panel2);border:2px solid var(--edge);box-shadow:0 3px 0 var(--ink);display:grid;place-content:center;line-height:1.15;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.dz-battle .dz-bcmd .dz-bc small{display:block;margin:3px 0 0;font-size:10.5px;font-weight:400;color:var(--muted)}
.dz-battle .dz-bcmd .dz-bc::before{content:none!important}
.dz-battle .dz-bcmd .dz-bc:active:not(:disabled){transform:translateY(2px);box-shadow:0 1px 0 var(--ink);background:var(--edge)}
.dz-battle .dz-bcmd #dz-c-attack{background:#5a2626;border-color:#94503e;color:#ffe6d8}
.dz-battle .dz-bcmd #dz-c-magic{background:#24345a;border-color:#4f6fa8;color:#e0e8ff}
.dz-battle .dz-bcmd .dz-back{background:transparent;color:var(--muted);box-shadow:none}
.dz-battle .dz-bcmd .dz-bc:disabled{opacity:.35}
.dz-battle .dz-bwait{grid-column:1/-1;min-height:48px;display:grid;place-items:center;font-size:14px}
@media (max-height:430px){.dz-battle .dz-bcmd .dz-bc{min-height:42px;font-size:14px}.dz-battle .dz-bcmd{gap:5px;padding:5px}}
@media (max-height:340px){.dz-battle .dz-bcmd .dz-bc{min-height:36px;font-size:13px}.dz-battle .dz-bcmd .dz-bc small{display:none}}
.dz-guide{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}
.dz-gcard{border:2px solid var(--edge);background:var(--panel2);padding:10px 12px;display:grid;gap:6px;align-content:start}
.dz-gcard h3{margin:0;font-size:14px;letter-spacing:.08em;color:var(--parch);font-weight:600}.dz-gcard p{margin:0;font-size:14px;line-height:1.45}
.dz-geq{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px;padding:6px 0}.dz-geq em{font-size:11px;color:var(--muted);font-style:normal;margin-right:4px}.dz-geq>span:not(.dz-gw){color:var(--muted)}
.dz-gw{font-size:16px;padding:2px 8px;background:var(--night);border:2px solid var(--edge);color:var(--text)}.dz-gres{border-color:var(--ley);color:var(--ley)}
.dz-gsteps{margin:0;padding-left:20px;display:grid;gap:6px;font-size:14px;line-height:1.45}.dz-glist{margin:0;padding-left:18px;display:grid;gap:4px;font-size:14px}.dz-glist small{color:var(--muted)}
.dz-btipcard{max-width:520px;text-align:left;display:grid;gap:10px;padding:16px 20px}.dz-btipcard ul{margin:0;padding-left:18px;display:grid;gap:6px;font-size:14px;line-height:1.4}.dz-btipcard .dz-act{justify-self:center;min-width:140px}
.dz-brel-h{font-size:11px;color:var(--muted);text-align:center}
@media (max-height:430px){.dz-btipcard{padding:10px 14px;gap:6px}.dz-btipcard ul{font-size:12.5px;gap:3px}}
`;

function useFontLink() {
  useEffect(() => {
    const id = "dz-font-pixelify";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;700&display=swap";
    document.head.appendChild(l);
  }, []);
}

function PixelImage({ source, scale = 3, label, bg = false, crop }) {
  const ref = useRef(null);
  const w = crop ? crop[2] : source ? source.width : 16, h = crop ? crop[3] : source ? source.height : 16;
  useEffect(() => {
    const c = ref.current;
    if (!c || !source) return;
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.clearRect(0, 0, w, h);
    if (crop) x.drawImage(source, crop[0], crop[1], w, h, 0, 0, w, h); else x.drawImage(source, 0, 0);
  }, [source, w, h, crop && crop.join(",")]);
  const canvas = <canvas ref={ref} className={"dz-pix" + (bg ? " dz-pixbg" : "")} style={{ width: w * scale, height: h * scale }} aria-label={label} />;
  if (!label) return canvas;
  return <figure className="dz-fig">{canvas}<figcaption>{label}</figcaption></figure>;
}

function WalkingSprite({ look, scale = 4 }) {
  const [f, setF] = useState(0);
  const [, setReady] = useState(CHIBI.ready);
  useEffect(() => { const id = setInterval(() => setF((n) => n + 1), 110); onChibiReady(() => setReady(true)); return () => clearInterval(id); }, []);
  // walk right, walk toward the camera, walk left, then stand facing the camera (nothing walks away from it)
  const ph = Math.floor(f / 24) % 4; let dir = ["right", "down", "left", "down"][ph], mv = ph !== 3;
  const set = chibiFor(look);
  if (set) { const fr = chibiFrame(set, dir, mv, f, f / 9); return <PixelImage source={fr.img} scale={Math.max(1, Math.floor(scale / 2))} />; }
  const sheet = getSheet(look);
  return <PixelImage source={sheet[dir][f % 4]} scale={scale} />;
}

function tileSamples(art) {
  return [
    ["Grass", art.grass(0, false)], ["Tuft", art.grass(1, true)], ["Flowers", art.flowers(2)], ["Path", art.path(0, 1)],
    ["Path edge", art.path(N | W, 2)], ["Water", art.water(0, 0, 1)], ["Shore", art.water(N | W, 0, 2)], ["Bridge", art.bridge(N)],
    ["Crops", art.crop(1)], ["Fence", art.fence(E | W, 0)], ["Roof", art.roof(N)], ["Wall", art.wall("W")],
    ["Window", art.wall("w", false)], ["Lit window", art.wall("w", true)], ["Door", art.wall("D")], ["Stone wall", art.stone()],
    ["Sign", art.sign(0)], ["Bush", art.bush(1)], ["Rock", art.rock(2)], ["Barricade", art.barricade(1)],
    ["Floor", art.floor(1)], ["Stone floor", art.flag(2)], ["Upper wall", art.wallUp(1, false, false)], ["Wall window", art.wallUp(1, true, false)],
    ["Lower wall", art.wallLo()], ["Rug", art.rug(N | E | S | W, 0)], ["Counter", art.counter(W | E)], ["Door mat", art.mat(1)],
  ];
}
const PACK_TABS = ["gear", "items", "tasks", "tome", "self"];
const PROP_SAMPLES = [
  ["bed", 0], ["table", 1], ["chair", 0], ["stool", 0], ["shelf", 0], ["shelf", 1], ["shelf", 2], ["dresser", 0], ["fireplace", 0],
  ["barrel", 0], ["crate", 0], ["sack", 0], ["plant", 0], ["forge", 0], ["anvil", 0], ["desk", 0], ["bench", 0], ["rack", 0],
  ["baskets", 0], ["block", 0], ["well", 0], ["lamp", 1], ["board", 0],
];
function charSheet(look) {
  const s = getSheet(look), c = makeCanvas(64, 100), x = c.getContext("2d");
  ["down", "up", "right", "left"].forEach((d, row) => s[d].forEach((img, col) => x.drawImage(img, col * 16, row * 25)));
  return c;
}

/* ------------------------------------------------------------------ */
/* Minigame host                                                       */
/* ------------------------------------------------------------------ */
function MinigameHost({ kind, level, art, reward, onDone, onCancel, touch }) {
  const canvasRef = useRef(null), wrapRef = useRef(null), gameRef = useRef(null);
  const [phase, setPhase] = useState("intro");
  const [result, setResult] = useState(null);
  const [cssScale, setCssScale] = useState(3);
  if (!gameRef.current) gameRef.current = MINIGAMES[kind](level, art);
  const g = gameRef.current;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const r = { width: el.clientWidth, height: el.clientHeight };   // layout size, unaffected by the big-screen UI zoom
      const s = Math.min(r.width / MG_W, r.height / MG_H);
      setCssScale(s >= 2 ? Math.floor(s) : Math.max(1, s));
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.width = MG_W; c.height = MG_H;
    const ctx = c.getContext("2d");
    let raf = 0, last = performance.now(), t = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (phase === "play") {
        g.update(dt);
        if (g.done) { setResult(reward(g.score)); setPhase("result"); }
      }
      ctx.imageSmoothingEnabled = false;
      g.draw(ctx, t);
      overcastGrade(ctx, MG_W, MG_H, 0.8);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const toLocal = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * MG_W, ((e.clientY - r.top) / r.height) * MG_H];
  };
  const onDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (phase !== "play") return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    const [x, y] = toLocal(e); g.down(x, y);
  };
  const onMove = (e) => { if (phase === "play") { const [x, y] = toLocal(e); g.move(x, y); } };
  const onUp = () => { if (phase === "play") g.up(); };

  useEffect(() => {
    const down = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "e", "Enter"].includes(k)) e.preventDefault();
      if (phase === "intro") { if (k === " " || k === "e" || k === "Enter") setPhase("play"); if (k === "Escape") onCancel(); return; }
      if (phase === "result") { if ((k === " " || k === "e" || k === "Enter") && !e.repeat) onDone(g.score, result); return; }
      if (k.startsWith("Arrow")) g.key(k, true);
      else if ((k === " " || k === "e" || k === "Enter") && !e.repeat) g.press();
    };
    const up = (e) => { if (e.key.startsWith("Arrow")) g.key(e.key, false); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [phase, result]);

  return (
    <div className="dz-overlay">
      <div className="dz-panel dz-mg" role="dialog" aria-label={g.title}>
        <div className="dz-phead"><div className="dz-ptitle">{g.title}</div><span className="dz-steps">Trade level {level}</span></div>
        <div className="dz-mgwrap" ref={wrapRef}>
          <canvas ref={canvasRef} className="dz-mgcanvas" style={{ width: MG_W * cssScale, height: MG_H * cssScale }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-label={g.title} />
          {phase === "intro" ? (
            <div className="dz-mgover">
              <div className="dz-mgcard">
                <p>{g.help}</p>
                {!touch ? <small>{g.keysHelp}</small> : null}
                <div className="dz-opts">
                  <button className="dz-act" id="dz-mg-start" onClick={() => setPhase("play")}>Start work</button>
                  <button className="dz-opt" id="dz-mg-cancel" onClick={onCancel}>Not now</button>
                </div>
              </div>
            </div>
          ) : null}
          {phase === "result" && result ? (
            <div className="dz-mgover">
              <div className="dz-mgcard">
                <div className="dz-grade">{result.grade}</div>
                <p>{result.line}</p>
                <div className="dz-reward"><span>{result.coins ? `+${result.coins} coppers` : "Unpaid"}</span><span>+{result.xp} trade XP</span></div>
                {result.levelUp ? <small>Trade level {result.levelUp}. The work comes a little easier now.</small> : null}
                <button className="dz-act" id="dz-mg-done" onClick={() => onDone(g.score, result)}>Continue</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Character creation                                                  */
/* ------------------------------------------------------------------ */
/* ---- Hollow Dice: three dice, hold what you like, reroll the rest once ---- */
const DIE_PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function Die({ v, held, dim, onClick, id }) {
  return (
    <button id={id} className="dz-die" data-held={held ? 1 : 0} data-dim={v ? 0 : 1} disabled={!onClick} onClick={onClick} aria-label={v ? `Die showing ${v}${held ? ", held" : ""}` : "Hidden die"}>
      {v ? Array.from({ length: 9 }).map((_, i) => <i key={i} data-on={DIE_PIPS[v].includes(i) ? 1 : 0} />) : null}
      {held ? <span className="dz-die-hold">HOLD</span> : null}
    </button>
  );
}
function diceScore(d) {
  const s = [...d].sort((a, b) => b - a);
  if (s[0] === s[2]) return { n: 100 + s[0], label: `Triple ${s[0]}s` };
  if (s[0] === s[1]) return { n: 40 + s[0] * 7 + s[2], label: `Pair of ${s[0]}s` };
  if (s[1] === s[2]) return { n: 40 + s[1] * 7 + s[0], label: `Pair of ${s[1]}s` };
  return { n: s[0] + s[1] + s[2], label: `Total ${s[0] + s[1] + s[2]}` };
}
function DiceGame({ opp, coins, onCoins, onDone }) {
  const folk = DICE_FOLK[opp] || DICE_FOLK.bram;
  const [phase, setPhase] = useState("bet");
  const [bet, setBet] = useState(1);
  const [me, setMe] = useState([0, 0, 0]);
  const [them, setThem] = useState([0, 0, 0]);
  const [hold, setHold] = useState([false, false, false]);
  const [rolled, setRolled] = useState(0);
  const [res, setRes] = useState(null);
  const r6 = () => 1 + Math.floor(Math.random() * 6);
  const start = (b) => { setBet(b); setMe([r6(), r6(), r6()]); setThem([0, 0, 0]); setHold([false, false, false]); setRolled(1); setRes(null); setPhase("play"); };
  const reroll = () => { setMe(me.map((d, i) => (hold[i] ? d : r6()))); setHold([false, false, false]); setRolled(2); };
  const stand = () => {
    let t = [r6(), r6(), r6()];
    const keep = t.map((d) => t.filter((x) => x === d).length > 1 || d >= 5);
    if (!keep.some(Boolean)) keep[t.indexOf(Math.max(...t))] = true;
    t = t.map((d, i) => (keep[i] ? d : r6()));
    const a = diceScore(me), b = diceScore(t), out = a.n > b.n ? "win" : a.n < b.n ? "lose" : "push";
    setThem(t); setRes({ out, a: a.label, b: b.label }); onCoins(out === "win" ? bet : out === "lose" ? -bet : 0); setPhase("result");
  };
  const quip = res ? (res.out === "win" ? folk.lose : res.out === "lose" ? folk.win : folk.push) : "";
  return (
    <div className="dz-overlay" id="dz-dice" role="dialog" aria-label="Hollow Dice">
      <div className="dz-panel dz-dicep">
        <div className="dz-phead"><b>Hollow Dice</b><span className="dz-dsub">vs. {folk.name}</span><span className="dz-dcoin">{coins} coppers</span></div>
        <div className="dz-dbody">
          {phase === "bet" ? (
            <>
              <p className="dz-drules">Three dice each. Hold what you like, reroll the rest once. Triples beat pairs, pairs beat plain totals. Winner takes the stake.</p>
              <div className="dz-dbtns">
                {[1, 2, 3].map((b) => <button key={b} id={`dz-dice-bet-${b}`} className="dz-act" disabled={coins < b} onClick={() => start(b)}>Stake {b}</button>)}
                <button id="dz-dice-leave" className="dz-opt" onClick={onDone}>Walk away</button>
              </div>
            </>
          ) : (
            <>
              <div className="dz-dlabel">{folk.name}{res ? ` · ${res.b}` : ""}</div>
              <div className="dz-dicerow">{them.map((v, i) => <Die key={i} v={v} />)}</div>
              <div className="dz-dlabel">You{res ? ` · ${res.a}` : ""} · stake {bet}</div>
              <div className="dz-dicerow">{me.map((v, i) => <Die key={i} id={`dz-dice-die-${i}`} v={v} held={hold[i]} onClick={phase === "play" && rolled === 1 ? () => setHold((h) => h.map((x, j) => (j === i ? !x : x))) : null} />)}</div>
              {phase === "play" ? (
                <div className="dz-dbtns">
                  {rolled === 1 ? <button id="dz-dice-roll" className="dz-act" onClick={reroll}>Reroll the rest</button> : null}
                  <button id="dz-dice-stand" className="dz-opt" onClick={stand}>Stand</button>
                </div>
              ) : (
                <>
                  <p className="dz-dres" id="dz-dice-res" data-out={res.out}>{res.out === "win" ? `You win ${bet}.` : res.out === "lose" ? `You lose ${bet}.` : "A tie. Nobody pays."} <i>{quip}</i></p>
                  <div className="dz-dbtns">
                    <button id="dz-dice-again" className="dz-act" disabled={coins < 1} onClick={() => setPhase("bet")}>Another round</button>
                    <button id="dz-dice-leave" className="dz-opt" onClick={onDone}>Done</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- the first casting lesson: attune, inhale, weave, release ---- */
function CastTutorial({ onDone }) {
  const STEPS = ["Attune", "Inhale", "Weave", "Release"];
  const [step, setStep] = useState(0);
  const [fill, setFill] = useState(0);
  const [msg, setMsg] = useState("Touch the ring and let your pulse settle.");
  const R = useRef({ step: 0, down: false, fill: 0, t: 0, win: 0, held: 0 });
  const elRef = useRef(null);
  const setS = (n, m) => { R.current.step = n; R.current.fill = 0; R.current.held = 0; R.current.win = 0; setStep(n); setFill(0); if (m) setMsg(m); };
  useEffect(() => {
    let raf, last = performance.now();
    const loop = (now) => {
      const r = R.current, dt = Math.min(0.1, (now - last) / 1000); last = now; r.t += dt;
      if (r.step === 1 && r.down) { r.fill = Math.min(1, r.fill + dt / 1.4); setFill(r.fill); if (r.fill >= 1) setS(2, "Hold still. Keep the ring steady while the words gather."); }
      else if (r.step === 1 && !r.down && r.fill > 0) { r.fill = Math.max(0, r.fill - dt * 0.8); setFill(r.fill); }
      else if (r.step === 2 && r.down) {
        r.held += dt; setFill(Math.min(1, r.held / 1.6));
        if (r.held >= 1.6) { setS(3, "Now. Let go when the ring flares."); r.win = 1; r.t = 0; r.flareAt = 0.9 + Math.random() * 0.5; }
      } else if (r.step === 2 && !r.down && r.held > 0) { r.held = 0; setFill(0); setMsg("It slipped. Hold the ring and keep still."); }
      else if (r.step === 3) {
        r.win = r.t >= r.flareAt ? 1 : 0; setFill(r.t >= r.flareAt && r.t < r.flareAt + 0.9 ? 1 : 0);
        if (r.t > r.flareAt + 0.9) { r.t = 0; r.flareAt = 0.9 + Math.random() * 0.5; setMsg("Too late. Wait for the flare, then tap."); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.__tut = { state: () => ({ ...R.current }) };
    return () => cancelAnimationFrame(raf);
  }, []);
  const down = (e) => {
    e.preventDefault();
    const r = R.current; r.down = true;
    if (r.step === 0) setS(1, "Hold the ring. Draw breath until it fills.");
    else if (r.step === 3) {
      if (r.t >= r.flareAt && r.t < r.flareAt + 0.9) { setMsg("Clean."); r.step = 4; setTimeout(onDone, 700); }
      else { setMsg("Too soon. Wait for the flare."); r.t = 0; r.flareAt = 0.9 + Math.random() * 0.5; }
    }
  };
  const up = () => { R.current.down = false; };
  const size = (73 + fill * 27) + "%";
  return (
    <div className="dz-tut" id="dz-tut">
      <div className="dz-tutcard dz-frame">
        <h3>First casting</h3>
        <div className="dz-tut-steps">{STEPS.map((n, i) => <b key={n} data-on={i === step ? 1 : 0} data-done={i < step ? 1 : 0}>{n}</b>)}</div>
        <div className="dz-ring" id="dz-tut-ring" ref={elRef} onPointerDown={down} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: size, height: size, transform: "translate(-50%,-50%)", borderRadius: "50%", border: "3px solid var(--parch)", boxShadow: step === 3 && fill ? "0 0 28px 10px #f4e4a0" : `0 0 ${fill * 20}px #c9b27a`, background: `rgba(244,228,160,${0.1 + fill * 0.35})`, transition: "box-shadow .1s" }} />
        </div>
        <p id="dz-tut-msg">{msg}</p>
      </div>
    </div>
  );
}

function Creator({ onDone, onBack }) {
  const [step, setStep] = useState(1);   // the guild step is gone: every apprentice is the Clerk's
  const [trade] = useState("clerk");
  const [look, setLook] = useState({ sex: "m", skin: 1, hair: 1, hairStyle: "short", cloth: 0, outfit: "tunic", strap: true, mood: "neutral", cut: "spiky", eyes: 0, tunic: 0, mark: "none" });
  const hero = HEROES[look.sex];
  const t = TRADES[trade];
  const set = (k, v) => setLook((l) => ({ ...l, [k]: v }));
  const pickSex = (sex) => setLook((l) => ({ ...l, sex, hair: sex === "f" ? 12 : 1, cut: "spiky", mark: "none", tunic: 0 }));
  const steps = ["", "Who you are", "Look"];
  const male = look.sex !== "f";
  return (
    <div className="dz-overlay">
      <div className="dz-panel" role="dialog" aria-label="Create your apprentice" style={{ height: "100%" }}>
        <div className="dz-phead"><div className="dz-ptitle">Your apprentice</div><span className="dz-steps">Step {step} of 2 · {steps[step]}</span></div>
        <div className="dz-create">
          <div className="dz-preview">
            <div className="dz-portrait" style={{ width: 192, height: 192 }}><PixelImage source={getPortrait(look)} scale={1.75} /></div>
            <div style={{ display: "grid", gap: 6, justifyItems: "center" }}>
              <span className="dz-wspr"><WalkingSprite look={look} scale={3} /></span>
              <div className="dz-pname">{hero.name} {PLAYER_SURNAME}</div>
              <div className="dz-ptrade">{t.name}'s apprentice · Oakhaven</div>
            </div>
          </div>
          <div className="dz-cbody">
            {step === 1 ? (
              <div className="dz-row">
                <b>Who are you?</b>
                <div className="dz-trades" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {["m", "f"].map((sx) => (
                    <button key={sx} id={`dz-sex-${sx}`} className="dz-trade" aria-pressed={look.sex === sx} onClick={() => pickSex(sx)} style={{ alignItems: "center", textAlign: "center" }}>
                      <div style={{ width: 96, height: 96, margin: "0 auto" }}><PixelImage source={getPortrait({ sex: sx, skin: 1, hair: sx === "f" ? 12 : 1, cloth: 0, eyes: 0, tunic: 0, cut: "spiky", mark: "none" })} scale={sx === "f" ? 1.6 : 1.8} /></div>
                      <b>{HEROES[sx].name}</b><i>{HEROES[sx].name} {PLAYER_SURNAME}</i><span>{sx === "m" ? "He / him" : "She / her"}</span>
                    </button>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: "var(--muted)" }}>Both are the same apprentice, the same story. You will be known as {hero.name} {PLAYER_SURNAME}, {t.name.toLowerCase()}'s apprentice of Oakhaven.</p>
              </div>
            ) : null}
            {step === 2 ? (
              <>
                <div className="dz-row"><b>Skin</b><div className="dz-sws">
                  {SKINS.map((s, i) => <button key={i} id={`dz-skin-${i}`} className="dz-swb" aria-label={s.name} aria-pressed={look.skin === i} style={{ background: s.b }} onClick={() => set("skin", i)} />)}
                </div></div>
                <div className="dz-row"><b>Eyes</b><div className="dz-sws">
                  {EYES.map((s, i) => <button key={i} id={`dz-eyes-${i}`} className="dz-swb" aria-label={i === 0 && !male ? "Green" : s.name} aria-pressed={look.eyes === i} style={{ background: s.c ? s.c[2] : male ? "#f9a31b" : "#6ac040" }} onClick={() => set("eyes", i)} />)}
                </div></div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: "var(--muted)" }}>You choose your hair colour and clothes at the mirror in {MENTOR_NAME}'s copy house, the morning you first go out. The mayor and the rest of the town are drawn fresh for each new apprentice.</p>
              </>
            ) : null}
          </div>
        </div>
        <div className="dz-cfoot">
          <button className="dz-opt" id="dz-create-back" onClick={() => (step <= 1 ? onBack() : setStep(step - 1))}>Back</button>
          {step < 2 ? (
            <button className="dz-act" id="dz-create-next" onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button className="dz-act" id="dz-create-begin" onClick={() => onDone({ trade, look, name: hero.name, pro: hero.pro })}>Begin</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
function newGameState({ trade, look, name, pro }) {
  const t = TRADES[trade];
  const mayor = pick(MAYORS);
  const bed = MAP_DEFS.shop.spawnBed;
  return {
    v: SAVE_VERSION, name, trade, pro: pro || "they", look: { ...look, strap: true },
    mentorName: MENTOR_NAME, mayorName: mayor.n, mayorGender: mayor.g,
    map: "shop", x: bed.tx * TILE + 8, y: bed.ty * TILE + 12, dir: bed.dir,
    day: 1, time: DAY_T, coins: 2, items: {}, flags: {}, chatter: {},
    tradeXP: 0, jobsToday: 0, jobsDay: 1, stats: { jobs: 0 },
  };
}

/* the end-of-act card: the closing theme plays under the credits */
function ActCredits({ onDone }) {
  const rows = [["Unwoven: A Tale of Talvora", "Act One · Oakhaven"], ["Created by", "Ryan · Burnt Pixel Studios"], ["Music", "xDeviruchi"],
    ["Character, creature and battle art", "craftpix.net packs, grimmed for Talvora"], ["Type", "Pixelify Sans"], ["", "The road to Ashford opens in the next act."]];
  return (
    <div className="dz-tut" role="dialog" aria-label="Act One credits" style={{ zIndex: 60, background: "rgba(10,8,14,.94)", overflowY: "auto" }}>
      <style>{`@keyframes dz-crin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}.dz-cr{animation:dz-crin 1.4s ease-out both}`}</style>
      <div style={{ textAlign: "center", maxWidth: 560, padding: 16, display: "grid", gap: 14 }}>
        <div className="dz-cr" style={{ font: "700 clamp(18px,5vh,30px) monospace", letterSpacing: ".3em", color: "#e9d9b4" }}>END OF ACT ONE</div>
        {rows.map(([a, b], i) => (
          <div key={i} className="dz-cr" style={{ animationDelay: `${0.8 + i * 0.9}s` }}>
            {a ? <div style={{ fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", color: "#8fa3a0" }}>{a}</div> : null}
            <div style={{ fontSize: 15, color: "#e9d9b4" }}>{b}</div>
          </div>
        ))}
        <div className="dz-cr" style={{ animationDelay: `${1.2 + rows.length * 0.9}s` }}><button className="dz-act" id="dz-credits-done" onClick={onDone}>Continue</button></div>
      </div>
    </div>
  );
}

export default function DurinnGame({ hot }) {
  useFontLink();
  const rootRef = useRef(null), canvasRef = useRef(null), engRef = useRef(null), GRef = useRef(null);
  const hudRefs = { place: useRef(null), time: useRef(null), coins: useRef(null), ley: useRef(null), bar: useRef(null), fps: useRef(null) };
  const joyBase = useRef(null), joyKnob = useRef(null), joy = useRef({ id: null, bx: 0, by: 0 });
  const toastTimer = useRef(0), dlgQ = useRef(null), choiceShownAt = useRef(0);

  const [screen, setScreen] = useState(SKIP_TAP ? "splash" : "tap");
  /* landscape only: a tall viewport (phone upright) pauses the game behind a rotate prompt.
     Near-square screens (an unfolded foldable) count as fine. */
  // on big screens (desktop monitors, large tablets) the phone-sized menus are scaled up so they stay readable
  useEffect(() => {
    const fit = () => { const r = rootRef.current; if (!r) return; const z = Math.max(1, Math.min(2.2, Math.min(window.innerWidth / 1100, window.innerHeight / 620))); r.style.setProperty("--uiz", z < 1.06 ? 1 : +z.toFixed(3)); };
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);
  const [tall, setTall] = useState(() => window.innerHeight > window.innerWidth * 1.15);
  useEffect(() => {
    const chk = () => setTall(window.innerHeight > window.innerWidth * 1.15);
    window.addEventListener("resize", chk); window.addEventListener("orientationchange", chk);
    const lock = () => { try { const o = window.screen && window.screen.orientation; if (o && o.lock) o.lock("landscape").catch(() => {}); } catch (e) { /* needs fullscreen on most browsers */ } };
    window.addEventListener("pointerdown", lock, { once: true });
    return () => { window.removeEventListener("resize", chk); window.removeEventListener("orientationchange", chk); window.removeEventListener("pointerdown", lock); };
  }, []);
  /* the rotate prompt clears itself after 5 seconds (a stale size report or a locked rotation must never block play);
     it can show again once the device has been landscape and then goes upright again */
  const [rotateGone, setRotateGone] = useState(false);
  useEffect(() => {
    if (!tall) { setRotateGone(false); return undefined; }
    const t = setTimeout(() => setRotateGone(true), 5000);
    return () => clearTimeout(t);
  }, [tall]);
  const showRotate = tall && !rotateGone;
  const [, setVer] = useState(0);
  useEffect(() => { if (engRef.current && engRef.current.setPaused) engRef.current.setPaused(showRotate); }, [showRotate, screen]);
  const bump = useCallback(() => setVer((v) => v + 1), []);
  useEffect(() => { loadChibi(); onChibiReady(bump); }, []);
  const [settings, setSettings] = useState(loadSettings);
  const [menu, setMenu] = useState(null);
  const [gearSlot, setGearSlot] = useState("weapon");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [giveId, setGiveId] = useState("poultice");
  const [spotIdx, setSpotIdx] = useState(0);
  const [dlg, setDlg] = useState(null);
  const [typed, setTyped] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [fight, setFight] = useState(null);
  const [tomeSel, setTomeSel] = useState({ r: null, s: null });
  const [tomeSlot, setTomeSlot] = useState(0);
  const [castMenu, setCastMenu] = useState(false);
  const [tut, setTut] = useState(null);
  const [credits, setCredits] = useState(false);
  const [pending, setPending] = useState(null);      // the new apprentice, between the creator and the second set of slides
  const [mirror, setMirror] = useState(null);        // { first } while the mirror is open
  const [scene, setScene] = useState(false);
  const [dice, setDice] = useState(null);
  const [toast, setToast] = useState(null);
  const [hasSave, setHasSave] = useState(() => !!storeGet(SAVE_KEY));
  const [confirm, setConfirm] = useState(null);
  // install as an app: Chrome/Edge/Android give us a prompt event; iPhone and iPad need Share > Add to Home Screen
  const [installEv, setInstallEv] = useState(() => window.__unwovenInstall || null);
  const [installed, setInstalled] = useState(() => { try { return !!((window.matchMedia && window.matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches) || navigator.standalone); } catch (e) { return false; } });
  const [inFrame] = useState(() => { try { return window.top !== window; } catch (e) { return true; } });
  const isIOS = useMemo(() => /iphone|ipad|ipod/i.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1), []);
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); window.__unwovenInstall = e; setInstallEv(e); };
    const onInstalled = () => { window.__unwovenInstall = null; setInstallEv(null); setInstalled(true); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  const canInstall = !installed && !inFrame && !!(installEv || isIOS);
  const doInstall = () => {
    if (installEv) {
      const ev = installEv; window.__unwovenInstall = null; setInstallEv(null);
      try { ev.prompt(); } catch (e) { /* prompt already used */ }
    } else if (isIOS) setConfirm("ios");
  };
  const [touchSeen, setTouchSeen] = useState(() => { try { return window.matchMedia("(pointer: coarse)").matches; } catch (e) { return false; } });
  const [pressed, setPressed] = useState({ a: false, b: false });
  const [actTarget, setActTarget] = useState(null);

  const showTouch = settings.touch === "on" || (settings.touch === "auto" && touchSeen);
  const ui = useRef({});
  ui.current = { screen, menu, dlg, typed, shopOpen, job, fight, scene, tut, dice };

  const flashToast = useCallback((text, ms = 2200) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  /* ---------- engine ---------- */
  const handlers = useRef({});
  useEffect(() => {
    const eng = createEngine(canvasRef.current, rootRef.current, {
      hud: () => ({ place: hudRefs.place.current, time: hudRefs.time.current, coins: hudRefs.coins.current, ley: hudRefs.ley.current, bar: hudRefs.bar.current, fps: hudRefs.fps.current }),
      onPassOut: () => handlers.current.passOut && handlers.current.passOut(),
      onEnterMap: (id) => handlers.current.enterMap && handlers.current.enterMap(id),
      onEncounter: (e) => handlers.current.encounter && handlers.current.encounter(e),
      onWarpBlocked: () => handlers.current.warpBlocked && handlers.current.warpBlocked(),
      onMapChange: () => bump(),
      onMoved: () => { setTimeout(() => { saveGame(); bump(); }, 300); },
      onTarget: (t) => setActTarget(t ? { kind: t.kind, key: t.key || "", id: t.id || "" } : null),
    });
    engRef.current = eng;
    eng.applySettings(settings);
    try { window.__durinn = { eng, music: () => Music.current(), musicDbg: () => Music.debug(), data: () => ({ MAP_DEFS, LOOK_TEXT, SCRIPTS, NPC_DEFS, TRADES, PROP_DEFS: typeof PROP_DEFS !== "undefined" ? PROP_DEFS : null, SOLID_TILES: [...SOLID_TILES] }), art: { getPortrait, getSheet, npcLookFor, NPC_DEFS, makeCanvas, drawFigure, drawWolf, chibiFor, CHIBI }, G: () => GRef.current, openJob: (k) => setJob({ kind: k, level: 1, key: Date.now() }), openDice: (o) => setDice({ opp: o, key: Date.now() }), run: (name, id) => runScript(SCRIPTS[name](scriptCtx(), id), "narrator"), toast: (m) => flashToast(m, 4000), shop: () => setShopOpen(true), fight: (foes) => { const G = GRef.current; btlEnsureParty(G); setFight({ foes, G, practice: false, wild: true, id: Date.now() }); } }; } catch (e) { /* ignore */ }
    if (hot && hot.save && hot.save.v === SAVE_VERSION) { GRef.current = hot.save; eng.start(hot.save); setScreen("game"); }
    return () => eng.destroy();
  }, []);

  useEffect(() => { if (engRef.current) engRef.current.applySettings(settings); storeSet(SETTINGS_KEY, settings); }, [settings]);
  useEffect(() => {
    const e = engRef.current;
    if (e) e.setBlocked(screen !== "game" || !!menu || !!dlg || shopOpen || !!job || !!fight || scene || !!tut || !!dice || !!mirror || credits);
  }, [screen, menu, dlg, shopOpen, job, fight, scene, tut, dice, mirror, credits]);

  useEffect(() => {
    try {
      const h = window.claude && window.claude.hot;
      if (h && h.snapshot) h.snapshot(() => {
        if (ui.current.screen !== "game" || !GRef.current) return {};
        engRef.current.sync();
        return { save: GRef.current };
      });
    } catch (e) { /* not in a viewer */ }
  }, []);

  const saveGame = useCallback(() => {
    if (!GRef.current || !engRef.current) return false;
    engRef.current.sync();
    const ok = storeSet(SAVE_KEY, GRef.current);
    if (ok) setHasSave(true);
    return ok;
  }, []);

  /* ---------- dialogue runner ---------- */
  const vars = () => buildVars(GRef.current, engRef.current ? engRef.current.hour() : 8);
  const scriptCtx = () => {
    const G = GRef.current, eng = engRef.current;
    return {
      G, trade: TRADES[G.trade], hour: eng.hour(), part: partOfDay(G.time), map: eng.mapId(),
      flag: (k) => !!G.flags[k], set: (k, v = true) => { G.flags[k] = v; },
      has: (k) => (G.items[k] || 0) > 0,
      give: (k, n = 1) => {
        G.items[k] = (G.items[k] || 0) + n;
        const it = ITEMS[k];
        if (it && it.gear) { const cur = G.equip && G.equip.wren && G.equip.wren[it.gear.slot]; if (!cur) { gearEquip(G, k, "wren"); flashToast(`${it.name} equipped`, 3000); } }
      },
      take: (k, n = 1) => { G.items[k] = Math.max(0, (G.items[k] || 0) - n); if (!G.items[k]) delete G.items[k]; },
      coins: (n) => { G.coins += n; },
      learn: (w) => learnWords(G, w),
      setNight: (n) => eng.setNight(n, false),
      tile: eng.playerTile(),
      refreshWorld: () => eng.refreshWorld(),
      shake: () => { eng.burst(); const r = document.querySelector(".dz-root"); if (r) { r.classList.remove("dz-shake"); void r.offsetWidth; r.classList.add("dz-shake"); } },
      teleport: (x, y, dir) => eng.warp(eng.mapId(), x, y, dir, { dur: 0.5 }),
      fireStart: () => { G.flags.d4_fire = true; G.time = NIGHT_T; eng.refreshWorld(); },
      joinParty: (id) => { btlEnsureParty(G); if (!G.partyIds.includes(id)) { G.partyIds.push(id); G.party[id] = btlFreshMember(id, G.party.wren.lv); } },
      rot: (key, lines) => { const i = G.chatter[key] || 0; G.chatter[key] = (i + 1) % lines.length; return lines[i % lines.length]; },
    };
  };

  const afterActions = useRef({});
  const showLine = (who, text) => {
    if (NPC_DEFS[who] && engRef.current) engRef.current.faceNpc(who);
    setDlg({ who, text: fillText(text, vars()), choices: null, sel: 0 }); setTyped(0);
  };
  const advance = () => {
    const q = dlgQ.current;
    if (!q) return;
    while (q.queue.length) {
      const st = q.queue.shift();
      if (typeof st === "string") { showLine(q.owner, st); return; }
      if (st.t !== undefined) { showLine(st.who || q.owner, st.t); return; }
      if (st.choice) {
        const choices = st.choice.map(([label, steps]) => ({ label: fillText(label, vars()), steps }));
        choiceShownAt.current = performance.now();
        setDlg((d) => ({ who: d ? d.who : q.owner, text: d ? d.text : "", choices, sel: 0 }));
        setTyped(1e9);
        return;
      }
      if (st.do) { st.do(scriptCtx()); bump(); continue; }
      if (st.cue) { if (engRef.current) engRef.current.cue(st.cue); if (!st.wait) continue; }
      if (st.wait) {   // a beat of the world carrying on: dialogue hides, people move
        setDlg(null); setScene(true); if (engRef.current) engRef.current.releaseNpcs();
        setTimeout(() => { setScene(false); advance(); }, st.wait);
        return;
      }
      if (st.shop) q.after.push("shop");
      if (st.job) q.after.push("job");
      if (st.sleep) q.after.push("sleep");
      if (st.tut) q.after.push("tut");
      if (st.dice) q.after.push("dice:" + st.dice);
      if (st.act) q.after.push(st.act);
    }
    endDialogue();
  };
  const endDialogue = () => {
    const q = dlgQ.current;
    dlgQ.current = null;
    setDlg(null);
    if (engRef.current) { engRef.current.releaseNpcs(); engRef.current.cueRelease(); }
    bump();
    const after = q ? q.after : [];
    for (const a of after) { if (a.startsWith("dice:")) setDice({ opp: a.slice(5), key: Date.now() }); else afterActions.current[a] && afterActions.current[a](); }
  };
  const runScript = (steps, owner) => {
    if (!steps || !steps.length) return;
    dlgQ.current = { queue: [...steps], owner, after: [] };
    if (owner && NPC_DEFS[owner] && engRef.current) engRef.current.faceNpc(owner);
    advance();
  };
  const choose = (i) => {
    const d = ui.current.dlg, q = dlgQ.current;
    if (!d || !d.choices || !q) return;
    q.queue = [...d.choices[i].steps, ...q.queue];
    setDlg((x) => (x ? { ...x, choices: null } : x));
    advance();
  };

  /* ---------- jobs, sleep, waking ---------- */
  const computeReward = (score) => {
    const G = GRef.current;
    const lvl = tradeLevel(G.tradeXP);
    const unpaid = G.day === 1 && !G.flags.d1_job;
    const coins = unpaid ? 0 : Math.round(3 + score * 6) + Math.floor((lvl - 1) / 2);
    const xp = Math.round(12 + 28 * score);
    const after = tradeLevel(G.tradeXP + xp);
    const grade = score >= 0.92 ? "Masterful" : score >= 0.7 ? "Good work" : score >= 0.4 ? "Passable" : "Rough";
    const line = unpaid ? `Apprentice work: unpaid. ${G.mentorName} will want to see it.` : score >= 0.7 ? "Your share of the sale goes in your purse." : "It'll sell, if nobody looks too closely.";
    return { coins, xp, grade, line, levelUp: after > lvl ? after : 0 };
  };
  afterActions.current.job = () => {
    const G = GRef.current;
    if (G.jobsDay !== G.day) { G.jobsDay = G.day; G.jobsToday = 0; }
    setJob({ kind: TRADES[G.trade].game, level: tradeLevel(G.tradeXP), key: Date.now() });
  };
  const finishJob = (score, result) => {
    const G = GRef.current, eng = engRef.current;
    setJob(null);
    G.coins += result.coins; G.tradeXP += result.xp; G.jobsToday += 1; G.stats.jobs = (G.stats.jobs || 0) + 1;
    const first = G.day === 1 && !G.flags.d1_job;
    if (first) { G.flags.d1_job = true; G.flags.d1_score = score; }
    bump();
    if (first) {
      if (eng.mapId() === "shop") setTimeout(() => runScript(SCRIPTS.afterFirstJob(scriptCtx(), score), "mentor"), 250);
      else flashToast(`Show ${G.mentorName} the work at the shop.`);
    }
  };
  afterActions.current.shop = () => setShopOpen(true);
  afterActions.current.tut = () => setTut({ key: Date.now() });
  const finishTut = () => { setTut(null); setTimeout(() => runScript(SCRIPTS.d2_study_done(scriptCtx()), "narrator"), 200); };

  const wakeUp = (passedOut) => {
    const G = GRef.current, eng = engRef.current, bed = MAP_DEFS.shop.spawnBed;
    eng.warp("shop", bed.tx, bed.ty, bed.dir, {
      dur: 0.7,
      before: () => {
        btlRest(G);
        if (G.day >= 4 && !G.flags.d4_lost) { G.time = DAY_T; }   // the fire has not happened yet: the day does not end
        else { G.day += 1; G.time = DAY_T; }
        G.jobsToday = 0; G.jobsDay = G.day; if (passedOut) G.flags.passedOut = true;
      },
      after: () => {
        eng.resetPassOut();
        const ok = saveGame();
        bump();
        setTimeout(() => {
          runScript([
            { who: "narrator", t: passedOut ? "You wake in your cot with no memory of getting there. Day {day}." : "Morning comes grey and cold over Oakhaven. Day {day}." },
          ].map((s) => ({ ...s, t: s.t.replace("{day}", String(G.day)) })), "narrator");
          flashToast(ok ? "Game saved" : "Couldn't save: browser storage is unavailable", 3200);
        }, 750);
      },
    });
  };
  afterActions.current.sleep = () => wakeUp(false);
  /* towns and rooms are safe: the hours can be let pass there, day to night and back */
  const toggleDayNight = () => {
    const G = GRef.current, eng = engRef.current;
    if (!G || !eng || !eng.safeHere() || dlgQ.current) return;
    const toNight = !isNightT(G.time);
    if (!toNight && (G.flags.d2_tome && !G.flags.d2_study || G.flags.d3_scene && !G.flags.d3_study)) { flashToast("Not yet. The tome is waiting for the dark.", 2400); return; }
    if (!toNight && G.day === 2 && G.flags.d2_errand_done && !G.flags.d2_scene) { flashToast("Tessa is waiting at the Hollow Oak tonight.", 2400); return; }
    eng.setNight(toNight);
    setTimeout(() => { bump(); handlers.current.enterMap && handlers.current.enterMap(eng.mapId(), true); }, 700);
  };
  const dbgGo = (map, x, y, dir, msg) => {
    const G = GRef.current, eng = engRef.current; if (!G || !eng) return;
    setMenu(null); setDlg(null); dlgQ.current = null; setShopOpen(false);
    eng.refreshWorld(); eng.setNight(isNightT(G.time), false);
    eng.warp(map, x, y, dir, { dur: 0.3 });
    setTimeout(() => { bump(); handlers.current.enterMap && handlers.current.enterMap(map, true); if (msg) flashToast(msg, 2600); }, 600);
  };
  const dbgSkip = (i) => { const G = GRef.current; if (!G) return; const at = dbgJump(G, i); dbgGo(at[0], at[1], at[2], at[3], DBG_STAGES[i].label); };
  const dbgFight = (foes) => {
    const G = GRef.current; if (!G) return; btlEnsureParty(G);
    setMenu(null); setDlg(null); dlgQ.current = null;
    setFight({ foes, G, practice: false, wild: true, boss: foes.some((k) => BTL_FOES[k] && BTL_FOES[k].boss), id: Date.now() });
  };
  afterActions.current.credits = () => setCredits(true);
  afterActions.current.aftermath = () => {
    const G = GRef.current, eng = engRef.current;
    eng.warp("oak", 14, 14, "down", {
      dur: 1.6,
      before: () => {
        btlEnsureParty(G);
        G.flags.d4_lost = true; G.flags.d5_ash = true;
        G.day += 3; G.time = DAY_T; G.jobsToday = 0; G.jobsDay = G.day;
        btlRest(G);
        eng.refreshWorld();
      },
      after: () => { saveGame(); bump(); setTimeout(() => runScript(SCRIPTS.d5_wake(scriptCtx()), "narrator"), 600); },
    });
  };
  handlers.current.passOut = () => wakeUp(true);
  handlers.current.warpBlocked = () => { if (!dlgQ.current) runScript([{ who: "narrator", t: "Not like this. The mirror by the fireplace first." }], "narrator"); };
  handlers.current.enterMap = (id, quiet) => {
    const G = GRef.current, eng = engRef.current;
    if (!quiet) saveGame(); bump();
    if (id === "tavern" && G && G.day === 2 && !G.flags.d2_scene && isNightT(G.time)) setTimeout(() => runScript(SCRIPTS.d2_scene(scriptCtx()), "narrator"), 700);
  };

  /* story beats that fire on their own when the player is free: the Arbitrator at noon, the fire on the way home */
  useEffect(() => {
    const id = setInterval(() => {
      const u = ui.current, eng = engRef.current, G = GRef.current;
      if (!eng || !G || u.screen !== "game" || u.menu || u.dlg || u.shopOpen || u.job || u.fight || u.scene || u.tut || u.dice || eng.isFading() || dlgQ.current) return;
      if (eng.mapId() !== "oak") return;
      const f = G.flags;
      if (G.day === 3 && f.d3_mentor && !isNightT(G.time) && !f.d3_scene_on && !f.d3_scene) runScript(SCRIPTS.d3_scene(scriptCtx()), "narrator");
      else if (f.d4_maud && !f.d4_fire) runScript(SCRIPTS.d4_fire_start(scriptCtx()), "narrator");
    }, 900);
    return () => clearInterval(id);
  }, []);

  /* ---------- battles ---------- */
  const partyFor = (G) => {
    btlEnsureParty(G);
    return G.partyIds.map((id) => ({ key: id, lv: G.party[id].lv, hp: G.party[id].hp, mp: G.party[id].mp, eq: G.equip && G.equip[id], look: id === "wren" ? G.look : undefined, name: id === "wren" ? G.name : undefined }));
  };
  handlers.current.encounter = (e) => {
    const G = GRef.current; if (!G) return;
    btlEnsureParty(G);
    setMenu(null); setDlg(null); dlgQ.current = null; setShopOpen(false);
    setFight({ ...e, G, practice: false, id: Date.now() });
  };
  const startPractice = () => {
    const mk = (id) => ({ ...btlFreshMember(id, 3) });
    const G0 = { coins: 0, items: { poultice: 2 }, flags: { magic: true }, words: { r: [...ALL_WORDS.r], s: [...ALL_WORDS.s] }, hotbar: ["Pyr-or", "Fulg-at", "San-is", "Vis-ix"], sigs: 0, look: { skin: 1, hair: 1, hairStyle: "short", cloth: 0, strap: true, mood: "neutral" },
      party: { wren: mk("wren"), tessa: mk("tessa"), companion: mk("companion") }, partyIds: ["wren", "tessa", "companion"] };
    setFight({ foes: ["wolf", "hound"], G: G0, practice: true, id: Date.now() });
  };
  const defeated = () => {
    const G = GRef.current, eng = engRef.current, bed = MAP_DEFS.shop.spawnBed;
    btlEnsureParty(G);
    const loss = Math.floor(G.coins * 0.25);
    eng.warp("shop", bed.tx, bed.ty, bed.dir, {
      dur: 0.7,
      before: () => {
        G.coins -= loss;
        for (const id in G.party) { const st = btlStatsFor(G, id, G.party[id].lv); G.party[id].hp = Math.max(1, Math.round(st.hp * 0.4)); G.party[id].mp = Math.min(G.party[id].mp, st.mp); }
      },
      after: () => {
        saveGame(); bump();
        setTimeout(() => runScript([{ who: "narrator", t: loss ? `Someone hauled you back inside the pillar's light. Everything hurts. ${loss} coppers are missing from your purse.` : "Someone hauled you back inside the pillar's light. Everything hurts." }], "narrator"), 750);
      },
    });
  };
  const finishFight = (res, ups, fled) => {
    const f = ui.current.fight; setFight(null);
    if (!f || f.practice) { bump(); return; }
    const eng = engRef.current;
    if (res.phase === "won") { eng.resolveEncounter("won"); saveGame(); flashToast(res.coins ? `+${res.coins} coppers` : "The way is clear", 1800); }
    else if (fled) { eng.resolveEncounter("fled"); flashToast("You got away", 1600); }
    else { eng.resolveEncounter("lost"); defeated(); }
    bump();
  };

  /* ---------- interaction ---------- */
  const pressA = () => {
    const u = ui.current, eng = engRef.current;
    if (u.screen !== "game" || u.menu || u.shopOpen || u.job || u.scene || u.tut || u.dice || !eng) return;
    if (u.dlg) {
      if (u.dlg.choices) return;
      if (u.typed < u.dlg.text.length) setTyped(1e9); else advance();
      return;
    }
    const t = eng.interact();
    if (!t) return;
    const G = GRef.current, tr = TRADES[G.trade], c = scriptCtx();
    if (t.kind === "npc") {
      if (G.flags.d1_order && !G.flags.d1_delivered && (G.items.delivery || 0) > 0 && t.id === tr.recipient) runScript(SCRIPTS.delivery(c, t.id), t.id);
      else if (t.id === "mentor" && G.flags.d1_job && !G.flags.d1_order) runScript(SCRIPTS.afterFirstJob(c, G.flags.d1_score || 0.5), "mentor");
      else if (G.flags.d4_fire && !G.flags.d4_lost && (t.id === "kellan" || t.id === "mentor")) runScript(SCRIPTS.d4_confront(c), "kellan");
      else if (G.flags.d5_ash && ASH_TALK[t.id]) runScript([{ who: t.id, t: c.rot("ash:" + t.id, ASH_TALK[t.id]) }], t.id);
      else {
        let steps = (QUEST_HOOKS[t.id] && QUEST_HOOKS[t.id](c)) || SCRIPTS[t.id](c);
        if (eng.mapId() === "tavern" && DICE_FOLK[t.id] && G.flags.d1_paid) steps = [...steps, { who: t.id, t: "Fancy a round of dice?" }, { choice: [["Play dice", [{ dice: t.id }]], ["Not now", []]] }];
        runScript(steps, t.id);
      }
    } else if (t.kind === "sign") {
      const lines = [...((MAP_DEFS[eng.mapId()].signs || {})[t.key] || ["The letters have worn away."])];
      const pf = eng.mapId() === "oak" && SIGN_PATROL[t.key];
      if (pf && G.flags.q_patrol && !G.flags[pf]) { G.flags[pf] = true; lines.push(`(Notice post checked: ${patrolCount(G.flags)} of 3.)`); }
      runScript(lines.map((x) => ({ who: "narrator", t: x })), "narrator");
    } else if (t.kind === "station") runScript(SCRIPTS.station(c), "narrator");
    else if (t.kind === "bed") runScript(t.id === "player" ? SCRIPTS.bedPlayer(c) : LOOK_TEXT.bed_mentor.map((x) => ({ who: "narrator", t: x })), "narrator");
    else if (t.kind === "look") {
      if (t.key === "mirror") setMirror({ first: !G.flags.wardrobe_done });
      else if (t.key === "board") runScript(NOTICES, "narrator");
      else if (t.key === "pillar") runScript(LOOK_TEXT.pillar.map((x) => ({ who: "narrator", t: x })), "narrator");
      else if (SCRIPTS["look_" + t.key.split(":")[0]]) runScript(SCRIPTS["look_" + t.key.split(":")[0]](c, t.key.split(":")[1]), "narrator");
      else {
        const behind = t.also && t.also[0] === "~", alsoKey = t.also && t.also.replace(/^~/, ""), lines = LOOK_TEXT[t.key.split(":")[0]], al = alsoKey && LOOK_TEXT[alsoKey.split(":")[0]];
        const beats = [];
        if (lines) beats.push({ who: "narrator", t: c.rot("look:" + t.key, lines) });
        if (al) beats.push({ who: "narrator", t: (behind ? "Behind it: " : "On the wall above: ") + c.rot("look:" + alsoKey, al).replace(/^(A|An|The|Bundles|Layers) /, (w) => w.toLowerCase()) });
        if (beats.length) runScript(beats, "narrator");
      }
    }
  };
  const pressB = () => {
    const u = ui.current, eng = engRef.current;
    if (u.screen !== "game" || u.menu || u.dlg || u.shopOpen || u.job || u.scene || u.tut || u.dice || !eng) return;
    const Gm = GRef.current;
    if (!(Gm && Gm.flags && Gm.flags.magic)) return;   // magic is locked until the tome
    setCastMenu((v) => !v);
  };
  const castOnMap = (sp) => {
    const G = GRef.current, eng = engRef.current; if (!G || !sp.mapUse) return;
    btlEnsureParty(G);
    const me = G.party.wren;
    setCastMenu(false);
    if (me.mp < sp.cost) { flashToast("Out of breath. Wait a moment, or rest.", 2000); return; }
    me.mp -= sp.cost; G.sigs = (G.sigs || 0) + 1;
    eng.burst(); flashToast(eng.castMap(sp.mapUse), 2600); bump();
  };

  /* ---------- screens ---------- */
  const beginNew = (spec) => {
    const G = newGameState(spec);
    GRef.current = G;
    storeDel(SAVE_KEY);
    engRef.current.start(G);
    setScreen("game"); setMenu(null); setConfirm(null);
    saveGame();
    setTimeout(() => runScript(SCRIPTS.intro(scriptCtx()), "narrator"), 600);
  };
  const continueGame = () => {
    const G = storeGet(SAVE_KEY);
    if (!G || G.v !== SAVE_VERSION || !TRADES[G.trade]) { flashToast("That save can't be read. Start a new game."); setHasSave(false); return; }
    G.flags = G.flags || {}; G.items = G.items || {}; G.chatter = G.chatter || {}; G.stats = G.stats || {};
    if (G.flags.wardrobe_done === undefined && (G.flags.d1_intro || (G.day || 1) > 1)) G.flags.wardrobe_done = true;
    G.time = isNightT(G.time || DAY_T) ? NIGHT_T : DAY_T;   // older saves ran on a clock
    if (G.trade === "clerk") G.mentorName = MENTOR_NAME;   // saves made when the mentor's name was random
    btlEnsureParty(G);
    GRef.current = G;
    engRef.current.start(G);
    setScreen("game");
  };
  const quitToTitle = () => {
    saveGame();
    setMenu(null); setDlg(null); dlgQ.current = null; setShopOpen(false); setJob(null);
    GRef.current = null;
    engRef.current.attract();
    setScreen("title");
  };

  /* ---------- typewriter ---------- */
  useEffect(() => {
    if (!dlg || dlg.choices) return;
    if (typed >= dlg.text.length) return;
    const id = setTimeout(() => setTyped((n) => Math.min(dlg.text.length, n + 2)), 22);
    return () => clearTimeout(id);
  }, [dlg, typed]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const move = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "a", "d", "w", "s"]);
    const norm = (k) => (k.length === 1 ? k.toLowerCase() : k);
    const down = (e) => {
      const k = norm(e.key), u = ui.current, eng = engRef.current;
      if (!eng || u.job || u.fight) return;
      if (e.target && e.target.tagName === "INPUT") return;
      if (u.screen !== "game") return;
      if (u.menu) { if (k === "Escape" || (k === "i" && PACK_TABS.includes(u.menu))) setMenu(null); return; }
      if (u.shopOpen) { if (k === "Escape") setShopOpen(false); return; }
      if (u.dlg && u.dlg.choices) {
        if (k === "ArrowUp" || k === "w") { e.preventDefault(); setDlg((d) => ({ ...d, sel: (d.sel + d.choices.length - 1) % d.choices.length })); }
        else if (k === "ArrowDown" || k === "s") { e.preventDefault(); setDlg((d) => ({ ...d, sel: (d.sel + 1) % d.choices.length })); }
        else if ((k === "e" || k === " " || k === "Enter") && !e.repeat) { e.preventDefault(); choose(u.dlg.sel); }
        return;
      }
      if (move.has(k)) { eng.input.keys.add(k); e.preventDefault(); return; }
      if (e.repeat) return;
      if (k === "e" || k === " " || k === "Enter") { e.preventDefault(); pressA(); }
      else if (k === "q" || k === "x") pressB();
      else if (k === "Escape" && !u.dlg && !u.scene && !u.tut && !u.dice) setMenu("settings");
      else if (k === "i" && !u.dlg && !u.scene && !u.tut && !u.dice) setMenu("gear");
    };
    const up = (e) => { const eng = engRef.current; if (eng) eng.input.keys.delete(norm(e.key)); };
    const blur = () => { const eng = engRef.current; if (eng) eng.input.keys.clear(); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, []);

  useEffect(() => {
    const onTouch = () => setTouchSeen(true);
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    return () => window.removeEventListener("touchstart", onTouch);
  }, []);

  /* ---------- joystick ---------- */
  const R = 44;
  const placeBase = (x, y, active) => { const b = joyBase.current; if (!b) return; b.style.left = x + "px"; b.style.top = y + "px"; b.dataset.active = active ? "1" : "0"; };
  const resetKnob = () => { if (joyKnob.current) joyKnob.current.style.transform = "translate(0px,0px)"; };
  const restBase = () => { const r = rootRef.current.getBoundingClientRect(); placeBase(94, r.height - 96, false); };
  const controlsOn = screen === "game" && !menu && !shopOpen && !job;
  const packBtn = <button className="dz-btn dz-btn-pack" id="dz-pack" aria-label="Open your pack" onPointerDown={(e) => e.stopPropagation()} onClick={() => setMenu("gear")}><div><span>Pack</span></div></button>;
  useEffect(() => {
    if (!showTouch || !controlsOn) return;
    restBase();
    const onResize = () => { if (joy.current.id === null) restBase(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showTouch, controlsOn]);
  const onCtlDown = (e) => {
    if (joy.current.id !== null) return;
    const r = rootRef.current.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (ui.current.dlg) { if (!ui.current.dlg.choices) pressA(); return; }
    if (x > r.width * 0.55) return;
    joy.current = { id: e.pointerId, bx: x, by: y };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    placeBase(x, y, true); resetKnob();
  };
  const onCtlMove = (e) => {
    if (e.pointerId !== joy.current.id) return;
    const r = rootRef.current.getBoundingClientRect();
    let dx = e.clientX - r.left - joy.current.bx, dy = e.clientY - r.top - joy.current.by;
    const len = Math.hypot(dx, dy);
    if (len > R) { dx = (dx / len) * R; dy = (dy / len) * R; }
    if (joyKnob.current) joyKnob.current.style.transform = `translate(${dx}px,${dy}px)`;
    const eng = engRef.current;
    if (eng) {
      const m = Math.min(1, len / R), dead = 0.15, scaled = m < dead ? 0 : (m - dead) / (1 - dead);
      eng.input.jx = len ? (dx / Math.max(1e-4, Math.hypot(dx, dy))) * scaled : 0;
      eng.input.jy = len ? (dy / Math.max(1e-4, Math.hypot(dx, dy))) * scaled : 0;
    }
  };
  const onCtlUp = (e) => {
    if (e.pointerId !== joy.current.id) return;
    joy.current = { id: null, bx: 0, by: 0 };
    const eng = engRef.current; if (eng) { eng.input.jx = 0; eng.input.jy = 0; }
    resetKnob(); restBase();
  };
  const btnDown = (which, fn) => (e) => { e.stopPropagation(); e.preventDefault(); setPressed((p) => ({ ...p, [which]: true })); fn(); };
  const btnUp = (which) => (e) => { e.stopPropagation(); setPressed((p) => ({ ...p, [which]: false })); };

  /* ---------- render helpers ---------- */
  const G = GRef.current;
  const eng = engRef.current;
  const V = G ? vars() : {};
  const speaker = (who) => {
    if (!who || who === "narrator" || !G) return null;
    if (who === "player") return { name: `${G.name} ${PLAYER_SURNAME}`, title: "", look: G.look };
    const def = NPC_DEFS[who];
    if (!def) return null;
    return { name: fillText(def.name, V), title: def.title, look: npcLookFor(who, G) };
  };
  const sp = dlg ? speaker(dlg.who) : null;
  const shownText = dlg ? dlg.text.slice(0, typed) : "";
  const lineDone = dlg && typed >= dlg.text.length;
  const lookVerb = { herbpatch: "Pick", shroom: "Pick", rubble: "Look", chest: "Open", bloom: "Pick", goat: "Catch", barricade: "Look", crops: "Look", door: "Knock", board: "Read", pillar: "Touch", fireplace: "Warm", well: "Drink", mirror: "Mirror" };
  const actLabel = dlg ? (dlg.choices ? "Choose" : "Next") : !actTarget ? "Interact"
    : actTarget.kind === "npc" ? "Talk" : actTarget.kind === "sign" ? "Read" : actTarget.kind === "station" ? "Work" : actTarget.kind === "bed" ? "Rest"
    : lookVerb[actTarget.key.split(":")[0]] || "Look";
  const tasks = G ? taskList(G, { hour: eng ? eng.hour() : 8, npcName: (id) => npcName(id, V), where: (id) => { const e = scheduleAt(NPC_DEFS[id], eng ? eng.hour() : 8); return e.map ? `Usually at ${e.where} at this hour` : "Gone home for the night"; } }) : [];
  const curTask = tasks.find((t) => !t.done);
  const saveInfo = hasSave && screen === "title" ? storeGet(SAVE_KEY) : null;
  const magicOn = !!(G && G.flags && G.flags.magic);   // set by the tome in Phase 4

  /* music follows the moment: screen, fight, minigame, map, time of day */
  useEffect(() => { Music.volume(settings.music === undefined ? 0.5 : settings.music); }, [settings.music]);
  useEffect(() => {
    const id = setInterval(() => {
      const mid = eng && screen === "game" ? eng.mapId() : null;
      Music.play(musicFor({ screen, credits, fight, job, dice, G, def: mid && MAP_DEFS[mid], mapId: mid, night: !!(G && isNightT(G.time)) }));
    }, 400);
    return () => clearInterval(id);
  }, [screen, credits, fight, job, dice, G, eng]);
  return (
    <div className="dz-root" ref={rootRef}>
      <style>{CSS}</style>
      <canvas className="dz-canvas" ref={canvasRef} aria-label="Oakhaven" />
      {showRotate ? (
        <div className="dz-rotate" role="alert">
          <div className="dz-rphone" aria-hidden="true" />
          <h2>Turn your device sideways</h2>
          <p>Unwoven is played in landscape. Your progress is paused and will pick up right where you left it.</p>
        </div>
      ) : null}

      {screen === "game" ? (
        <div className="dz-hud">
          <div className="dz-hudbox dz-frame">
            <div className="dz-zone" ref={hudRefs.place}>Oakhaven</div>
            <div className="dz-time"><span ref={hudRefs.time}>Day 1</span><b ref={hudRefs.coins}>0 coppers</b></div>
            {magicOn ? <div className="dz-ley"><span className="dz-ley-ico" aria-hidden="true" /><span ref={hudRefs.ley}>Calm</span></div> : null}
            {magicOn ? <div className="dz-bar"><i ref={hudRefs.bar} /></div> : null}
          </div>
          {curTask && !dlg && !menu ? (
            <div className="dz-task dz-frame">{curTask.text}{curTask.hint ? <small>{curTask.hint}</small> : null}</div>
          ) : null}
        </div>
      ) : null}

      {screen === "game" && controlsOn ? (
        showTouch ? (
          <div className="dz-ctl" onPointerDown={onCtlDown} onPointerMove={onCtlMove} onPointerUp={onCtlUp} onPointerCancel={onCtlUp}>
            <div className="dz-joy-base" ref={joyBase}><div className="dz-joy-knob" ref={joyKnob} /></div>
            <button className="dz-btn dz-btn-a" data-down={pressed.a ? "1" : "0"} data-off={!dlg && !actTarget ? "1" : "0"} aria-label={actLabel}
              onPointerDown={btnDown("a", pressA)} onPointerUp={btnUp("a")} onPointerCancel={btnUp("a")} onPointerLeave={btnUp("a")}>
              <div><span>{actLabel}</span></div>
            </button>
            {!dlg ? packBtn : null}
            {!dlg && magicOn ? (
              <button className="dz-btn dz-btn-b" data-down={pressed.b ? "1" : "0"} aria-label="Cast a spell"
                onPointerDown={btnDown("b", pressB)} onPointerUp={btnUp("b")} onPointerCancel={btnUp("b")} onPointerLeave={btnUp("b")}>
                <div><span>Cast</span></div>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="dz-ctl" onPointerDown={() => { if (ui.current.dlg && !ui.current.dlg.choices) pressA(); }}>
            {!dlg ? <div className="dz-hint dz-frame">Arrows or WASD to move · E to talk{magicOn ? " · Q to cast" : ""} · I for Pack · Esc for menu</div> : null}
            {!dlg ? packBtn : null}
          </div>
        )
      ) : null}

      {screen === "game" && !job && !dlg && !fight && !menu && !shopOpen && G && eng && eng.safeHere() && !(G.flags && G.flags.d4_fire && !G.flags.d4_lost) ? (
        <button className="dz-dn" id="dz-daynight" aria-label={isNightT(G.time) ? "Let the night pass to day" : "Let the day pass to night"} onPointerDown={(e) => e.stopPropagation()} onClick={() => toggleDayNight()}>
          <i aria-hidden="true">{isNightT(G.time) ? "☀" : "☾"}</i>{isNightT(G.time) ? "Day" : "Night"}
        </button>
      ) : null}
      {screen === "game" && !job ? (
        <button className="dz-menu-btn" id="dz-menu" aria-label="Open menu" onPointerDown={(e) => e.stopPropagation()} onClick={() => setMenu(menu ? null : "settings")}>≡</button>
      ) : null}
      <div className="dz-fps" ref={hudRefs.fps} />
      {toast ? <div className="dz-toast" role="status" key={toast}>{toast}</div> : null}

      {dlg ? (
        <div className="dz-dialog dz-frame" role="dialog" aria-label={sp ? sp.name : "Narration"} onPointerDown={(e) => { e.stopPropagation(); if (!dlg.choices) pressA(); }}>
          {sp ? <div className="dz-portrait"><PixelImage source={getPortrait(sp.look)} scale={1.33} /></div> : null}
          <div className="dz-dbody">
            {sp ? <div className="dz-name">{sp.name}{sp.title ? <small>{sp.title}</small> : null}</div> : null}
            {dlg.text ? (
              <div className="dz-text" data-narr={sp ? "0" : "1"}>{shownText}{lineDone && !dlg.choices ? <span className="dz-more" aria-hidden="true">▼</span> : null}</div>
            ) : null}
            {dlg.choices ? (
              <div className="dz-choices">
                {dlg.choices.map((c, i) => (
                  <button key={i} id={`dz-choice-${i}`} className="dz-choice" data-sel={dlg.sel === i ? "1" : "0"}
                    onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); if (performance.now() - choiceShownAt.current < 400) return; choose(i); }}>{c.label}</button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {screen === "game" && castMenu && !dlg && !menu && !shopOpen && !job && !fight ? (
        <div className="dz-castm dz-frame" id="dz-castm" role="menu" aria-label="Cast">
          <div className="dz-bwho">Cast · Breath {G && G.party && G.party.wren ? G.party.wren.mp : 0}/{G && G.party && G.party.wren ? btlStatsFor(G, "wren", G.party.wren.lv).mp : 0}</div>
          {(G ? knownSpells(magicEnsure(G) && G.words).filter((x) => x.mapUse) : []).map((sp) => (
            <button key={sp.id} className="dz-bc" id={`dz-map-${sp.id}`} onClick={() => castOnMap(sp)}>{{ light: "Light", scan: "Scan", move: "Move stone" }[sp.mapUse]} <small>{sp.name} · {sp.cost} Br</small></button>
          ))}
          {G && !knownSpells(G.words).some((x) => x.mapUse) ? <div className="dz-bwait">No words for this yet.</div> : null}
          <button className="dz-bc dz-back" onClick={() => setCastMenu(false)}>Close</button>
        </div>
      ) : null}
      {screen === "game" && dice && G ? <DiceGame key={dice.key} opp={dice.opp} coins={G.coins} onCoins={(d) => { G.coins = Math.max(0, G.coins + d); G.stats = G.stats || {}; G.stats.dice = (G.stats.dice || 0) + 1; bump(); }} onDone={() => setDice(null)} /> : null}
      {screen === "game" && tut ? <CastTutorial key={tut.key} onDone={finishTut} /> : null}
      {screen === "tap" ? <TapToBegin onTap={() => setScreen("splash")} /> : null}
      {screen === "splash" ? <Splash onDone={() => setScreen("title")} /> : null}

      {screen === "title" ? (
        <div className="dz-title">
          <div className="dz-tcard dz-frame">
            <h1 className="dz-logo">UNWOVEN</h1>
            <div className="dz-sub">A Tale of Talvora</div>
            {confirm === "ios" ? (
              <div className="dz-tbtns">
                <div className="dz-tsave">Install Unwoven on this device</div>
                <ol className="dz-tsteps"><li>Tap the Share button in Safari.</li><li>Choose Add to Home Screen.</li><li>Tap Add. Unwoven opens fullscreen like an app.</li></ol>
                <button className="dz-opt" id="dz-title-ios-back" onClick={() => setConfirm(null)}>Back</button>
              </div>
            ) : confirm === "new" ? (
              <div className="dz-tbtns">
                <div className="dz-tsave">Starting over replaces your saved apprentice.</div>
                <button className="dz-act" data-tone="danger" id="dz-title-replace" onClick={() => { setConfirm(null); setScreen("intro1"); }}>Replace save</button>
                <button className="dz-opt" id="dz-title-cancel" onClick={() => setConfirm(null)}>Back</button>
              </div>
            ) : (
              <div className="dz-tbtns">
                {saveInfo ? (
                  <>
                    <button className="dz-act" id="dz-title-continue" onClick={continueGame}>Continue</button>
                    <div className="dz-tsave">{saveInfo.name} {PLAYER_SURNAME} · Day {saveInfo.day} · {formatClock(saveInfo.time)}</div>
                  </>
                ) : null}
                <button className="dz-opt" id="dz-title-battle" onClick={startPractice}>Practice battle</button>
                <button className={saveInfo ? "dz-opt" : "dz-act"} id="dz-title-new" onClick={() => (saveInfo ? setConfirm("new") : setScreen("intro1"))}>New game</button>
                {canInstall ? <button className="dz-opt dz-install" id="dz-title-install" onClick={doInstall}>Install <b>Unwoven</b> as an app</button> : null}
              </div>
            )}
            <div className="dz-tfoot">Act One · playtest build</div>
          </div>
        </div>
      ) : null}

      {fight ? <BattleScreen key={fight.id} G={fight.G} foes={fight.foes} party={partyFor(fight.G)} magic={!!(fight.G.flags && fight.G.flags.magic)} practice={fight.practice} settings={settings} wild={!!fight.wild} canFlee={!fight.boss} onEnd={finishFight} /> : null}

      {screen === "intro1" ? <IntroSlides part={1} eng={engRef.current} canSkip={introSeen()} onDone={() => setScreen("create")} /> : null}
      {screen === "create" ? <Creator onBack={() => setScreen("title")} onDone={(spec) => { setPending(spec); setScreen("intro2"); }} /> : null}
      {screen === "intro2" && pending ? <IntroSlides part={2} eng={engRef.current} trade={pending.trade} look={pending.look} canSkip={introSeen()} onDone={() => { markIntroSeen(); const sp = pending; setPending(null); beginNew(sp); }} /> : null}
      {credits ? <ActCredits onDone={() => setCredits(false)} /> : null}
      {mirror && G ? <Wardrobe look={G.look} first={mirror.first} onCancel={() => setMirror(null)} onDone={(lk) => { G.look = { ...G.look, ...lk }; if (!G.flags.wardrobe_done) { G.flags.wardrobe_done = true; runScript([{ who: "narrator", t: "That will do. Time to see what the day wants." }], "narrator"); } setMirror(null); saveGame(); bump(); }} /> : null}

      {shopOpen && G ? (
        <div className="dz-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setShopOpen(false); }}>
          <div className="dz-panel" role="dialog" aria-label="Pike's Provisions" style={{ width: "min(560px,100%)" }}>
            <div className="dz-phead"><div className="dz-ptitle">Pike's Provisions</div><span className="dz-coins">{G.coins} coppers</span>
              <button className="dz-close" id="dz-shop-close" onClick={() => setShopOpen(false)}>Leave</button></div>
            <div className="dz-pbody">
              <div className="dz-items">
                {Object.keys(G.items).filter((id) => ITEMS[id] && ITEMS[id].sell && G.items[id] > 0).map((id) => {
                  const it = ITEMS[id], owned = G.items[id];
                  return (
                    <div className="dz-item" key={"sell-" + id}>
                      <b>Sell: {it.name}<span style={{ marginLeft: 8 }}>you have {owned}</span></b>
                      <span>{it.desc}</span>
                      <button className="dz-act" id={`dz-sell-${id}`} onClick={() => {
                        G.coins += it.sell; G.items[id] = owned - 1; if (!G.items[id]) delete G.items[id]; bump();
                        flashToast(`Sold ${it.name.toLowerCase()} for ${it.sell}`);
                      }}>Sell · {it.sell}</button>
                    </div>
                  );
                })}
                {SHOP_STOCK.map((id) => {
                  const it = ITEMS[id], owned = G.items[id] || 0;
                  return (
                    <div className="dz-item" key={id}>
                      <b>{it.name}{owned ? <span style={{ marginLeft: 8 }}>you have {owned}</span> : null}</b>
                      <span>{it.desc} {it.price} coppers.</span>
                      <button className="dz-act" id={`dz-buy-${id}`} disabled={G.coins < it.price} onClick={() => {
                        G.coins -= it.price; G.items[id] = owned + 1; bump();
                        flashToast(`Bought ${it.name.toLowerCase()}`);
                      }}>Buy · {it.price}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {job && G ? (
        <MinigameHost key={job.key} kind={job.kind} level={job.level} art={eng.art} reward={computeReward} touch={showTouch}
          onCancel={() => setJob(null)} onDone={finishJob} />
      ) : null}

      {menu && G ? (
        <div className="dz-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) setMenu(null); }}>
          <div className="dz-panel" role="dialog" aria-label="Menu">
            <div className="dz-phead">
              <div className="dz-ptitle">{PACK_TABS.includes(menu) ? "Pack" : "Menu"} · {G.name} {PLAYER_SURNAME}</div>
              <div role="tablist" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(PACK_TABS.includes(menu) ? [["gear", "Gear"], ["items", "Items"], ["tasks", "Quests"], ...(magicOn ? [["tome", "Tome"]] : []), ["self", "Character"]] : [["settings", "Settings"], ...(magicOn ? [["guide", "How magic works"]] : []), ["art", "Art"]]).map(([id, label]) => (
                  <button key={id} id={`dz-tab-${id}`} role="tab" className="dz-tab" aria-selected={menu === id} onClick={() => { setMenu(id); setConfirm(null); }}>{label}</button>
                ))}
              </div>
              <button className="dz-close" id="dz-close" onClick={() => setMenu(null)}>Resume</button>
            </div>
            <div className="dz-pbody">
              {menu === "gear" ? (() => {
                btlEnsureParty(G);
                const eqNow = (G.equip && G.equip.wren) || {}, m = G.party.wren, st = btlStatsFor(G, "wren", m.lv), base = btlStats("wren", m.lv);
                const owned = gearList(G).filter((id) => ITEMS[id].gear.slot === gearSlot);
                const iconBox = (id, sc) => <div className="dz-gicon">{id ? <PixelImage source={gearIcon(id)} scale={sc} /> : null}</div>;
                return (
                  <section className="dz-sec dz-gear">
                    <div className="dz-gslots">
                      {GEAR_SLOTS.map(([slot, label]) => {
                        const id = eqNow[slot], it = id && ITEMS[id];
                        return (
                          <button key={slot} id={`dz-slot-${slot}`} className="dz-gslot" aria-pressed={gearSlot === slot} onClick={() => setGearSlot(slot)}>
                            {iconBox(id, 2)}
                            <span><small>{label.toUpperCase()}</small><b>{it ? it.name : "Empty"}</b>{it ? <em>{gearText(it)}</em> : null}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="dz-glist">
                      <small>{GEAR_SLOTS.find((s) => s[0] === gearSlot)[1].toUpperCase()} · CARRIED</small>
                      {owned.length ? owned.map((id) => {
                        const it = ITEMS[id], on = eqNow[gearSlot] === id;
                        return (
                          <div className="dz-grow" key={id}>
                            {iconBox(id, 2)}
                            <div><b>{it.name}</b> <em>{gearText(it)}</em><span>{it.desc}</span></div>
                            {on ? <button className="dz-act" id={`dz-unequip-${id}`} onClick={() => { gearRemove(G, gearSlot); bump(); }}>Unequip</button>
                              : <button className="dz-act" id={`dz-equip-${id}`} onClick={() => { gearEquip(G, id); bump(); }}>Equip</button>}
                          </div>
                        );
                      }) : <p>Nothing here yet. Old chests and strange corners sometimes hold something useful.</p>}
                    </div>
                    <dl className="dz-stat dz-gstats">
                      <dt style={{ gridColumn: "1/3" }}><small>{G.name.toUpperCase()} · LV {m.lv}</small></dt>
                      {Object.keys(GEAR_STATS).map((k) => [<dt key={k + "k"}>{GEAR_STATS[k]}</dt>, <dd key={k + "v"}>{st[k]}{st[k] !== base[k] ? <i> {st[k] > base[k] ? "+" : ""}{st[k] - base[k]}</i> : null}</dd>])}
                    </dl>
                  </section>
                );
              })() : null}
              {menu === "self" ? (() => {
                const t = TRADES[G.trade], lvl = tradeLevel(G.tradeXP), into = G.tradeXP - (lvl - 1) * XP_PER_LEVEL;
                return (
                  <section className="dz-sec" style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div className="dz-portrait" style={{ width: 128, height: 128 }}><PixelImage source={getPortrait(G.look)} scale={1.5} /></div>
                    <div style={{ display: "grid", gap: 10, minWidth: 0, flex: "1 1 220px" }}>
                      <h3 style={{ margin: 0 }}>{t.name}'s apprentice to {G.mentorName}</h3>
                      <dl className="dz-stat">
                        <dt>Trade level</dt><dd>{lvl}{lvl < 10 ? <div className="dz-xp"><i style={{ width: `${(into / XP_PER_LEVEL) * 100}%` }} /></div> : null}</dd>
                        <dt>Purse</dt><dd>{G.coins} coppers</dd>
                        <dt>Day</dt><dd>Day {G.day}, {partOfDay(G.time).toLowerCase()}</dd>
                        <dt>Jobs done</dt><dd>{G.stats.jobs || 0}</dd>
                        {(() => { btlEnsureParty(G); return G.partyIds.map((id) => { const m = G.party[id], st = btlStatsFor(G, id, m.lv); return [<dt key={id + "k"}>{id === "wren" ? G.name : BTL_PARTY[id].name}</dt>, <dd key={id + "v"}>Lv {m.lv} · HP {m.hp}/{st.hp} · MP {m.mp}/{st.mp}</dd>]; }); })()}
                        <dt>Later</dt><dd>{t.bonus}</dd>
                      </dl>
                    </div>
                  </section>
                );
              })() : null}
              {menu === "tome" ? (() => {
                magicEnsure(G);
                const sp = tomeSel.r && tomeSel.s ? weaveSpell(tomeSel.r, tomeSel.s) : null;
                const known = (r, s) => G.words.r.includes(r) && G.words.s.includes(s);
                const inHot = sp && sp.ok && G.hotbar.includes(sp.id);
                return (
                  <section className="dz-sec dz-tome">
                    <div>
                      <h3>Hotbar</h3>
                      <div className="dz-hot">
                        {G.hotbar.map((id, i) => {
                          const w = id ? weaveSpell(...id.split("-")) : null;
                          return <button key={i} id={`dz-slot-${i}`} className="dz-slot" data-empty={id ? "0" : "1"} aria-pressed={tomeSlot === i} onClick={() => setTomeSlot(i)}>
                            <span>{w && w.ok ? w.name : "Empty"}</span><small>{w && w.ok ? `${w.cost} breath · ${w.charge ? w.charge.toFixed(1) + "s" : "instant"}` : `Slot ${i + 1}`}</small></button>;
                        })}
                      </div>
                    </div>
                    <div>
                      <h3>Weaving table</h3>
                      <div className="dz-sub">Roots</div>
                      <div className="dz-chips" role="group" aria-label="Roots">
                        {G.words.r.map((r) => <button key={r} id={`dz-tr-${r}`} className="dz-chip" aria-pressed={tomeSel.r === r} onClick={() => setTomeSel((t) => ({ ...t, r }))}>{r}</button>)}
                        <span className="dz-chip" data-unk="1">{OT_ROOTS.length - G.words.r.length} unwritten</span>
                      </div>
                      <div className="dz-sub" style={{ marginTop: 10 }}>Suffixes</div>
                      <div className="dz-chips" role="group" aria-label="Suffixes">
                        {G.words.s.map((x) => <button key={x} id={`dz-ts-${x}`} className="dz-chip" aria-pressed={tomeSel.s === x} onClick={() => setTomeSel((t) => ({ ...t, s: x }))}>{OT_SUFFIXES[x].name}</button>)}
                        <span className="dz-chip" data-unk="1">{Object.keys(OT_SUFFIXES).length - G.words.s.length} unwritten</span>
                      </div>
                    </div>
                    <div className="dz-prev" id="dz-prev" aria-live="polite">
                      {!sp ? <p>Choose a root and a suffix. Not every pair is a word.</p> : sp.ok ? (
                        <>
                          <h4>{sp.name}</h4>
                          <p>{sp.desc}</p>
                          <dl><div>Breath <dd>{sp.cost}</dd></div><div>Charge <dd>{sp.charge ? sp.charge.toFixed(1) + "s" : "instant"}</dd></div><div>Element <dd>{sp.el}</dd></div></dl>
                          <div className="dz-row2">
                            <button className="dz-act" id="dz-set-slot" onClick={() => { const h = [...G.hotbar]; const j = h.indexOf(sp.id); if (j >= 0) h[j] = null; h[tomeSlot] = sp.id; G.hotbar = h; bump(); }}>Set slot {tomeSlot + 1}</button>
                            {inHot ? <button className="dz-opt" id="dz-clear-slot" onClick={() => { G.hotbar = G.hotbar.map((x) => (x === sp.id ? null : x)); bump(); }}>Clear from hotbar</button> : null}
                          </div>
                        </>
                      ) : <p className="dz-why">{sp.why}</p>}
                    </div>
                    <p className="dz-torn">The tome's last pages have been torn out. {G.sigs ? `Every working leaves a trace: you have left ${G.sigs} so far.` : "Every working leaves a trace that those who know how can read."}</p>
                  </section>
                );
              })() : null}
              {menu === "guide" ? (() => {
                magicEnsure(G);
                const EL = { fire: "Fire", cold: "Frost", wind: "Wind", stone: "Stone", storm: "Storm", light: "Light", force: "Force", life: "Life", mind: "Mind", growth: "Growth" };
                return (
                  <section className="dz-sec dz-guide">
                    <div className="dz-gcard"><h3>1 · Two words make a spell</h3>
                      <p>Every spell is a <b>root</b> and an <b>ending</b>. The root says <i>what</i> the magic is. The ending says <i>how</i> it is shaped.</p>
                      <div className="dz-geq"><span className="dz-gw">Pyr</span><em>flame</em><span>+</span><span className="dz-gw">-or</span><em>a thrown bolt</em><span>=</span><span className="dz-gw dz-gres">Pyr-or</span><em>a fire bolt</em></div>
                      <p>Not every pair is a real word. The Tome's weaving table tells you which pairs work. Put the ones you like on your hotbar.</p></div>
                    <div className="dz-gcard"><h3>2 · Casting takes four beats</h3>
                      <ol className="dz-gsteps">
                        <li><b>Inhale.</b> Choose a spell. It costs <b>Breath</b>, shown under your health.</li>
                        <li><b>Weave.</b> A bar fills over your head. Bigger endings take longer. <b>If you are hit now, the weave tears.</b> That is a <b>Rupture</b>: the spell is lost, you take a small burn and lose your turn.</li>
                        <li><b>Hold.</b> When the bar is full, the Release bar appears.</li>
                        <li><b>Release.</b> Tap <b>Release</b> while the marker is in the zone. Gold is <b>Clean</b> (strongest), the pale band is <b>Steady</b>, outside it is <b>Sloppy</b> (weakest).</li>
                      </ol>
                      <p>Endings marked <b>instant</b> (like -it) skip the weave. They are weaker, but they can never be torn.</p></div>
                    <div className="dz-gcard"><h3>3 · Breath</h3>
                      <p>Breath is your magic. It comes back slowly in battle and as you walk, and fully when you sleep. Striking with your weapon also steadies your breath a little.</p>
                      <p>Health mends while you are indoors or within a Pillar's calm. Out in the wild, carry poultices.</p></div>
                    <div className="dz-gcard"><h3>4 · Weakness and the leyline</h3>
                      <p>Beasts have weaknesses. Hitting one deals <b>much more</b> damage (you'll see "Weak!"). Some resist an element and take less. Wolves fear fire and light.</p>
                      <p>Near a Pillar the leyline is <b>calm</b>. Out in the wild it is <b>surging</b>: your spells hit harder, but sometimes slip and strike the wrong target. The meter under the clock shows which.</p></div>
                    <div className="dz-gcard"><h3>Your roots</h3>
                      <ul className="dz-glist">{G.words.r.map((r) => { const R = rootInfo(r), E = OT_EFFECT[r]; return <li key={r}><b>{r}</b> {R ? R.meaning : ""}{E ? <small> · {EL[E.el] || E.el}</small> : null}</li>; })}</ul></div>
                    <div className="dz-gcard"><h3>Your endings</h3>
                      <ul className="dz-glist">{G.words.s.map((x) => { const S = OT_SUFFIXES[x]; return <li key={x}><b>{S.name}</b> {S.tag} <small>{S.cost} breath · {S.charge ? S.charge.toFixed(1) + "s weave" : "instant"}</small></li>; })}</ul></div>
                    <div className="dz-gcard"><h3>Outside battle</h3>
                      <p>Press <b>Cast</b> to use a spell on the road. <b>Phaos-is</b> calls a light that pushes back the dark for a while.</p></div>
                  </section>
                );
              })() : null}
              {menu === "items" ? (
                <section className="dz-sec">
                  <h3>Pockets</h3>
                  {Object.keys(G.items).length ? (
                    <div className="dz-items">
                      {Object.entries(G.items).map(([id, n]) => {
                        const it = ITEMS[id] || { name: id, desc: "" };
                        const nm = id === "delivery" ? TRADES[G.trade].itemName : it.name;
                        const desc = id === "delivery" ? `For ${V.recipient}. ${G.mentorName} is waiting on payment.` : it.desc;
                        return <div className="dz-item" key={id}><b>{nm}</b><em>×{n}</em><span>{desc}</span></div>;
                      })}
                    </div>
                  ) : <p>Your pockets are empty. Pike's Provisions sells most things.</p>}
                </section>
              ) : null}
              {menu === "tasks" ? (
                <section className="dz-sec">
                  <h3>Day {G.day}</h3>
                  <ul className="dz-check">
                    {tasks.map((t, i) => <li key={i} data-done={t.done ? "1" : "0"}>{t.text}{t.hint && !t.done ? <small>{t.hint}</small> : null}</li>)}
                  </ul>
                </section>
              ) : null}
              {menu === "settings" ? (
                <>
                  <section className="dz-sec">
                    <h3>Touch controls</h3>
                    <div className="dz-opts">
                      {[["auto", "Auto"], ["on", "Always on"], ["off", "Off"]].map(([id, label]) => (
                        <button key={id} id={`dz-touch-${id}`} className="dz-opt" aria-pressed={settings.touch === id} onClick={() => setSettings((s) => ({ ...s, touch: id }))}>{label}</button>
                      ))}
                    </div>
                  </section>
                  <section className="dz-sec">
                    <h3>Sound</h3>
                    <div className="dz-opts">
                      {[["Off", 0], ["Low", 0.25], ["Medium", 0.5], ["High", 0.8]].map(([label, v]) => <button key={label} id={`dz-music-${label.toLowerCase()}`} className="dz-opt" aria-pressed={(settings.music === undefined ? 0.5 : settings.music) === v} onClick={() => setSettings((st) => ({ ...st, music: v }))}>Music: {label}</button>)}
                    </div>
                  </section>
                  <section className="dz-sec">
                    <h3>Battle</h3>
                    <div className="dz-opts">
                                            <button id="dz-wait" className="dz-opt" aria-pressed={settings.wait !== false} onClick={() => setSettings((s) => ({ ...s, wait: s.wait === false }))}>Wait while choosing</button>
                      <button id="dz-autorel" className="dz-opt" aria-pressed={!!settings.autoRelease} onClick={() => setSettings((s) => ({ ...s, autoRelease: !s.autoRelease }))}>Auto-release spells</button>
                    </div>
                    <p>Auto-release skips the timing tap: spells release on their own at normal strength.</p>
                  </section>
                  <section className="dz-sec">
                    <h3>Saving</h3>
                    <p>The game saves when you sleep and each time you go through a door.</p>
                    {confirm === "delete" ? (
                      <div className="dz-confirm">This deletes your apprentice for good.
                        <button className="dz-act" data-tone="danger" id="dz-del-yes" onClick={() => { storeDel(SAVE_KEY); setHasSave(false); setConfirm(null); setMenu(null); setDlg(null); dlgQ.current = null; GRef.current = null; engRef.current.attract(); setScreen("title"); }}>Delete save</button>
                        <button className="dz-opt" id="dz-del-no" onClick={() => setConfirm(null)}>Keep it</button>
                      </div>
                    ) : (
                      <div className="dz-opts">
                        <button className="dz-act" id="dz-quit" onClick={quitToTitle}>Save and return to title</button>
                        <button className="dz-opt" id="dz-del" onClick={() => setConfirm("delete")}>Delete save</button>
                      </div>
                    )}
                  </section>
                  <section className="dz-sec">
                    <h3>Testing tools</h3>
                    <p>Jump to any finished part of the game, add things, or start a fight. Jumping rebuilds your story progress to that point and keeps your gear and loot.</p>
                    <div className="dz-opts"><button id="dz-tools" className="dz-opt" aria-pressed={toolsOpen} onClick={() => setToolsOpen((v) => !v)}>{toolsOpen ? "Hide testing tools" : "Show testing tools"}</button></div>
                    {toolsOpen && G ? (
                      <div className="dz-tools">
                        <h4>Skip ahead</h4>
                        <div className="dz-toolgrid">
                          {DBG_STAGES.map((st, i) => <button key={st.id} id={`dz-jump-${st.id}`} className="dz-opt" onClick={() => dbgSkip(i)}>{st.label}</button>)}
                        </div>
                        <h4>Go to</h4>
                        <div className="dz-opts">
                          <select id="dz-spot" className="dz-sel" value={spotIdx} onChange={(e) => setSpotIdx(+e.target.value)}>
                            {DBG_SPOTS.map((sp, i) => <option key={i} value={i}>{sp[0]}</option>)}
                          </select>
                          <button id="dz-spot-go" className="dz-act" onClick={() => { const sp = DBG_SPOTS[spotIdx]; dbgGo(sp[1], sp[2], sp[3], sp[4], sp[0]); }}>Go</button>
                        </div>
                        <h4>Player</h4>
                        <div className="dz-opts">
                          {[1, 3, 5, 8, 10].map((lv) => <button key={lv} id={`dz-lv-${lv}`} className="dz-opt" onClick={() => { dbgSetLevel(G, lv); bump(); flashToast(`Party set to level ${lv}`, 1800); }}>Lv {lv}</button>)}
                          <button id="dz-heal" className="dz-opt" onClick={() => { dbgHeal(G); bump(); flashToast("Party healed", 1500); }}>Heal all</button>
                          <button id="dz-coins" className="dz-opt" onClick={() => { G.coins += 50; bump(); flashToast("+50 coppers", 1500); }}>+50 coppers</button>
                          <button id="dz-words" className="dz-opt" onClick={() => { dbgLearnAll(G); bump(); flashToast("Every Old Tongue word learned", 2000); }}>Learn all words</button>
                        </div>
                        <h4>World</h4>
                        <div className="dz-opts">
                          <button id="dz-tnight" className="dz-opt" onClick={() => { engRef.current.setNight(!isNightT(G.time), false); bump(); }}>{isNightT(G.time) ? "Make it day" : "Make it night"}</button>
                          <button id="dz-dayplus" className="dz-opt" onClick={() => { G.day += 1; bump(); }}>Day +1 ({G.day})</button>
                          <button id="dz-dayminus" className="dz-opt" onClick={() => { G.day = Math.max(1, G.day - 1); bump(); }}>Day −1</button>
                          <button id="dz-nowild" className="dz-opt" aria-pressed={!!G.flags.__nowild} onClick={() => { G.flags.__nowild = !G.flags.__nowild; engRef.current.setNight(isNightT(G.time), false); bump(); }}>No wild spawns</button>
                          <button id="dz-chests" className="dz-opt" onClick={() => { dbgClearLoot(G); engRef.current.refreshWorld(); bump(); flashToast("Chests and herb patches refilled", 2000); }}>Refill chests and herbs</button>
                        </div>
                        <h4>Items</h4>
                        <div className="dz-opts">
                          <select id="dz-give-id" className="dz-sel" value={giveId} onChange={(e) => setGiveId(e.target.value)}>
                            {Object.keys(ITEMS).map((id) => <option key={id} value={id}>{ITEMS[id].name}</option>)}
                          </select>
                          {[1, 5].map((n) => <button key={n} id={`dz-give-${n}`} className="dz-act" onClick={() => { dbgGive(G, giveId, n); bump(); flashToast(`+${n} ${ITEMS[giveId].name}`, 1500); }}>Give {n}</button>)}
                          <button id="dz-give-gear" className="dz-opt" onClick={() => { Object.keys(ITEMS).filter((id) => ITEMS[id].gear && !G.items[id]).forEach((id) => dbgGive(G, id, 1)); bump(); flashToast("All gear added", 1800); }}>All gear</button>
                          <button id="dz-give-kit" className="dz-opt" onClick={() => { dbgGive(G, "poultice", 5); dbgGive(G, "tonic", 3); bump(); flashToast("Healing kit added", 1800); }}>Healing kit</button>
                          <button id="dz-give-loot" className="dz-opt" onClick={() => { ["pelt", "fang", "yarrow", "token"].forEach((id) => dbgGive(G, id, 4)); bump(); flashToast("Sellable loot added", 1800); }}>Loot to sell</button>
                        </div>
                        <h4>Start a fight</h4>
                        <div className="dz-opts">
                          {DBG_FIGHTS.map(([label, foes]) => <button key={label} id={`dz-fight-${foes.join("-")}`} className="dz-opt" onClick={() => dbgFight(foes)}>{label}</button>)}
                        </div>
                      </div>
                    ) : null}
                  </section>
                  <section className="dz-sec">
                    <h3>Developer</h3>
                    <div className="dz-opts">
                      <button id="dz-debug" className="dz-opt" aria-pressed={settings.debug} onClick={() => setSettings((s) => ({ ...s, debug: !s.debug }))}>Show collision</button>
                      <button id="dz-fpsbtn" className="dz-opt" aria-pressed={settings.fps} onClick={() => setSettings((s) => ({ ...s, fps: !s.fps }))}>Show frame rate</button>
                    </div>
                  </section>
                </>
              ) : null}
              {menu === "art" && eng ? (
                <>
                  <section className="dz-sec">
                    <h3>Portraits · 48 × 48</h3>
                    <div className="dz-grid">
                      <PixelImage source={getPortrait(G.look)} scale={1} label={G.name} bg />
                      {Object.keys(NPC_DEFS).map((id) => <PixelImage key={id} source={getPortrait(npcLookFor(id, G))} scale={1} label={fillText(NPC_DEFS[id].name, V)} bg />)}
                    </div>
                  </section>
                  <section className="dz-sec">
                    <h3>Characters · 4 directions × 4 walk frames</h3>
                    <div className="dz-grid">
                      <PixelImage source={charSheet(G.look)} scale={2} label={G.name} bg />
                      {Object.keys(NPC_DEFS).map((id) => <PixelImage key={id} source={charSheet(npcLookFor(id, G))} scale={2} label={fillText(NPC_DEFS[id].name, V)} bg />)}
                    </div>
                  </section>
                  <section className="dz-sec">
                    <h3>Tiles · 16 × 16</h3>
                    <div className="dz-grid">{tileSamples(eng.art).map(([name, c]) => <PixelImage key={name} source={c} scale={3} label={name} />)}</div>
                  </section>
                  <section className="dz-sec">
                    <h3>Furniture and props</h3>
                    <div className="dz-grid">{PROP_SAMPLES.map(([p, v], i) => <PixelImage key={i} source={eng.art.prop(p, v)} scale={2} label={p} />)}</div>
                  </section>
                  <section className="dz-sec">
                    <h3>Palette</h3>
                    <div className="dz-swatches">
                      {PALETTE_GROUPS.map(([name, keys]) => (
                        <div className="dz-group" key={name}><b>{name}</b>
                          {keys.map((k) => <div className="dz-sw" key={k}><i style={{ background: PAL[k] }} /><span>{k}</span><code>{PAL[k]}</code></div>)}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
