/* ------------------------------------------------------------------ */
/* Thread Study: trace the root's rune, then bind an ending to it.     */
/* Two short steps. Tap the knots in order, or drag through them.      */
/* A wrong knot frays the thread; three frays and the trace starts over. */
/* ------------------------------------------------------------------ */
function ThreadStudy({ root, rank, words, learn, easy, onDone, onCancel }) {
  const n = 5 + Math.min(2, rank);
  const pts = useMemo(() => runeFor(root, n), [root, n]);
  const quiz = useMemo(() => studyQuiz(root, words), [root]);
  const info = rootInfo(root) || { meaning: "" };
  const [stage, setStage] = useState("show");      // show, trace, bind, done
  const [at, setAt] = useState(0), [frays, setFrays] = useState(0), [clean, setClean] = useState(true), [bad, setBad] = useState(-1), [pick, setPick] = useState(null);
  const svgRef = useRef(null), st = useRef({}); st.current = { stage, at, frays };
  useEffect(() => { if (stage !== "show") return; const id = setTimeout(() => setStage("trace"), rank >= 2 ? 2200 : 1500); return () => clearTimeout(id); }, [stage]);
  const hit = (e) => {
    const s = st.current; if (s.stage !== "trace") return;
    const r = svgRef.current.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * 300, y = ((e.clientY - r.top) / r.height) * 300;
    const i = pts.findIndex((p) => Math.hypot(p.x - x, p.y - y) < 24);
    if (i < 0 || i < s.at) return;
    if (i === s.at) { const nx = s.at + 1; setAt(nx); st.current.at = nx; if (nx >= pts.length) setTimeout(() => setStage("bind"), 450); return; }
    if (easy || (e.type === "pointermove" && st.current.lastBad === i)) return;
    st.current.lastBad = i; setBad(i); setTimeout(() => setBad(-1), 350); setClean(false);
    const f = s.frays + 1;
    if (f >= 3) { setFrays(0); setAt(0); st.current.at = 0; st.current.frays = 0; st.current.lastBad = -1; } else { setFrays(f); st.current.frays = f; }
  };
  const choose = (k) => { if (pick) return; setPick(k); const ok = k === quiz.ans; if (!ok) setClean(false); setTimeout(() => setStage("done"), 900); };
  const won = clean && pick === quiz.ans;
  const path = (k) => pts.slice(0, k).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const showGuide = stage === "show" || (stage === "trace" && rank === 0), showNums = stage === "show" || (stage === "trace" && rank < 2);
  return (
    <div className="dz-tut dz-study" role="dialog" aria-label={`Thread Study: ${root}`} id="dz-study">
      <div className="dz-stcard dz-frame">
        <div className="dz-sthead"><b>{root}</b><span>{info.meaning}</span><em>{"●".repeat(rank)}{"○".repeat(MASTERY_MAX - rank)}</em></div>
        {stage === "bind" || stage === "done" ? (
          <div className="dz-stbind">
            {stage === "done" ? (
              <>
                <p className="dz-stline">{learn ? `The word is yours: ${root}.` : won ? "The thread holds. The word sits a little truer in your mouth." : "The thread held, but not cleanly. The word is no worse for it."}</p>
                <p className="dz-stsmall">{won ? (rank < MASTERY_MAX ? "A clean study. If this word has room to grow, it has grown." : "You know this word as well as it can be known.") : "A clean study (no frays, and the right ending) earns a mastery mark. Try again after your next rest, or now for practice."}</p>
                <button className="dz-act" id="dz-study-done" onClick={() => onDone(won)}>Close the tome</button>
              </>
            ) : (
              <>
                <p className="dz-stline">Bind an ending. The page says:</p>
                <p className="dz-stclue">“{quiz.clue}”</p>
                <div className="dz-stopts">{quiz.options.map((k) => <button key={k} id={`dz-study-opt-${k}`} className="dz-opt" data-state={pick ? (k === quiz.ans ? "ok" : k === pick ? "no" : "") : ""} onClick={() => choose(k)}>{OT_SUFFIXES[k].name}</button>)}</div>
              </>
            )}
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="dz-stsvg" viewBox="0 0 300 300" onPointerDown={(e) => { e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); st.current.down = true; hit(e); }} onPointerMove={(e) => { if (st.current.down) hit(e); }} onPointerUp={() => { st.current.down = false; }} onPointerCancel={() => { st.current.down = false; }}>
              {showGuide ? <path d={path(pts.length)} className="dz-stguide" data-show={stage === "show" ? "1" : "0"} /> : null}
              <path d={path(at)} className="dz-stthread" />
              {pts.map((p, i) => (
                <g key={i} data-i={i}>
                  <circle cx={p.x} cy={p.y} r={i < at ? 9 : 12} className="dz-stnode" data-on={i < at ? "1" : "0"} data-bad={bad === i ? "1" : "0"} data-next={stage === "trace" && i === at && rank === 0 ? "1" : "0"} />
                  {showNums && i >= at ? <text x={p.x} y={p.y + 4} className="dz-stnum">{i + 1}</text> : null}
                </g>
              ))}
            </svg>
            <p className="dz-stsmall">{stage === "show" ? "Watch the thread." : `Trace the rune: tap the knots in order, or drag through them.${rank >= 2 ? " From memory." : ""}`} <span className="dz-stfray" data-n={frays}>Frays: {frays}/3</span></p>
          </>
        )}
        {stage !== "done" ? <button className="dz-opt dz-stleave" id="dz-study-leave" onClick={onCancel}>Leave it</button> : null}
      </div>
    </div>
  );
}
