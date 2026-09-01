import { useState, useEffect, useRef, useCallback, memo } from "react";
import portfolioData from "./data/portfolioData";
import "./App.css";

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const GROUND_PX   = 130;
const SPEED       = 0.38;
const JUMP_V      = 5.5;
const JUMP_V2     = 8.0;   // double-jump boost
const DASH_SPEED  = 1.8;
const DASH_DUR    = 160;   // ms
const GRAV        = 0.35;
const TOTAL_SECS  = 6;

const SECTIONS = [
  { id:"aboutMe",      x:8,  label:"About Me",  color:"#00e5ff", top:"#0e7490", front:"#0c4a6e", side:"#083344" },
  { id:"skills",       x:23, label:"Skills",    color:"#fbbf24", top:"#d97706", front:"#92400e", side:"#78350f" },
  { id:"projects",     x:39, label:"Projects",  color:"#c084fc", top:"#9333ea", front:"#6b21a8", side:"#4c1d95" },
  { id:"publications", x:55, label:"Papers",    color:"#34d399", top:"#059669", front:"#065f46", side:"#022c22" },
  { id:"awards",       x:71, label:"Awards",    color:"#fb923c", top:"#ea580c", front:"#9a3412", side:"#7c2d12" },
  { id:"contact",      x:87, label:"Contact",   color:"#f472b6", top:"#db2777", front:"#9d174d", side:"#831843" },
];

const COIN_DEFS = [
  {id:0,x:15.5},{id:1,x:16.5},{id:2,x:17.5},
  {id:3,x:31},{id:4,x:32},
  {id:5,x:47},{id:6,x:48},{id:7,x:49},
  {id:8,x:63},{id:9,x:64},
  {id:10,x:79},{id:11,x:80},{id:12,x:81},
];

const ACHIEVEMENTS = [
  { id:"first",   icon:"🏅", title:"First Step!",       desc:"Opened your first section",    condition: o => o >= 1 },
  { id:"half",    icon:"⚡", title:"Half Way There!",   desc:"Explored 3 sections",           condition: o => o >= 3 },
  { id:"complete",icon:"🏆", title:"Portfolio Master!",  desc:"Explored all 6 sections",       condition: o => o >= 6 },
  { id:"coins5",  icon:"🪙", title:"Coin Collector!",   desc:"Collected 5 coins",             condition: (o, c) => c >= 5 },
];

const SPEECH_TIPS = [
  "Walk right → hit blocks!",
  "SHIFT to dash! ⚡",
  "Double jump possible!",
  "Collect coins for score!",
  "Check out my projects →",
  "SPACE near block to open!",
];

// ── WEB AUDIO ─────────────────────────────────────────────────────────────────
function createAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const play = (type, freq, duration, vol = 0.18) => {
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
    };
    return {
      hit:      () => { play("square", 440, 0.08, 0.22); setTimeout(() => play("square", 330, 0.07, 0.15), 60); },
      step:     () => play("sine", 180, 0.04, 0.06),
      coin:     () => { play("sine", 880, 0.06, 0.12); setTimeout(() => play("sine", 1100, 0.08, 0.1), 40); },
      jump:     () => { play("sine", 300, 0.05); setTimeout(() => play("sine", 500, 0.08, 0.1), 30); },
      dash:     () => play("sawtooth", 200, 0.12, 0.1),
      achieve:  () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => play("sine", f, 0.15, 0.18), i*80)); },
      ctx,
      resume:   () => { if (ctx.state === "suspended") ctx.resume(); },
    };
  } catch { return { hit:()=>{}, step:()=>{}, coin:()=>{}, jump:()=>{}, dash:()=>{}, achieve:()=>{}, resume:()=>{} }; }
}

// ── TYPEWRITER ────────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 16) {
  const [d, setD] = useState("");
  useEffect(() => {
    setD(""); if (!text) return;
    let i = 0;
    const t = setInterval(() => { i++; setD(text.slice(0,i)); if (i >= text.length) clearInterval(t); }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return d;
}
function TW({ text, tag: Tag = "p", className = "", style = {} }) {
  const d = useTypewriter(text, 15);
  return <Tag className={className} style={style}>{d}<span className="tw-cursor">▌</span></Tag>;
}

// ── CONFETTI ──────────────────────────────────────────────────────────────────
const CONFETTI_PIECES = Array.from({length:32},(_,i) => ({
  x: 15 + (i * 7.3 + 11) % 70,
  delay: (i * 0.13) % 0.35,
  color: ["#fde047","#f472b6","#34d399","#00e5ff","#c084fc","#fb923c"][i%6],
  size: 6 + (i * 1.7) % 8,
  rotate: (i * 41) % 360,
}));

const Confetti = memo(function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="confetti-wrap" aria-hidden>
      {CONFETTI_PIECES.map((p,i) => (
        <div key={i} className="confetti-piece" style={{
          left:`${p.x}%`, background:p.color,
          width:p.size, height:p.size,
          animationDelay:`${p.delay}s`,
          transform:`rotate(${p.rotate}deg)`,
        }}/>
      ))}
    </div>
  );
});

// ── ACHIEVEMENT TOAST ─────────────────────────────────────────────────────────
const AchievementToast = memo(function AchievementToast({ achievement, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  if (!achievement) return null;
  return (
    <div className="achieve-toast">
      <span className="ach-icon">{achievement.icon}</span>
      <div>
        <div className="ach-title">{achievement.title}</div>
        <div className="ach-desc">{achievement.desc}</div>
      </div>
    </div>
  );
});

// ── RAIN / SNOW ───────────────────────────────────────────────────────────────
const RAIN_DROPS  = Array.from({length:45}, (_,i) => ({
  x: (i * 13.7) % 100, delay: (i * 0.23) % 2,
  dur: 0.6 + (i * 0.11) % 0.8, size: 1 + (i * 0.3) % 1,
}));
const SNOW_DROPS  = Array.from({length:35}, (_,i) => ({
  x: (i * 17.1) % 100, delay: (i * 0.31) % 2,
  dur: 1.2 + (i * 0.19) % 0.8, size: 3 + (i * 0.61) % 4,
}));

const Weather = memo(function Weather({ type }) {
  if (!type) return null;
  const drops = type === "snow" ? SNOW_DROPS : RAIN_DROPS;
  return (
    <div className="weather-layer" aria-hidden>
      {drops.map((d,i) => (
        <div key={i} className={`w-drop ${type==="snow"?"w-snow":"w-rain"}`} style={{
          left:`${d.x}%`,
          animationDelay:`-${d.delay}s`,
          animationDuration:`${d.dur}s`,
          width: type==="rain" ? d.size : d.size*2,
          height: type==="rain" ? d.size*14 : d.size*2,
        }}/>
      ))}
    </div>
  );
});

// ── LOADING SCREEN ────────────────────────────────────────────────────────────
const LoadingScreen = memo(function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const steps = [
      {to:25, delay:60},  {to:55, delay:50},  {to:80, delay:60},
      {to:100, delay:40},
    ];
    let p = 0;
    const run = () => {
      if (p >= steps.length) { setTimeout(onDone, 200); return; }
      const s = steps[p++];
      setPct(s.to);
      setTimeout(run, s.delay);
    };
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="loading-screen">
      <div className="ls-world">
        <div className="ls-pixel-art">
          <div className="ls-block" style={{background:"#0c4a6e"}}/>
          <div className="ls-block" style={{background:"#92400e"}}/>
          <div className="ls-block" style={{background:"#6b21a8"}}/>
          <div className="ls-block" style={{background:"#065f46"}}/>
          <div className="ls-block" style={{background:"#9a3412"}}/>
          <div className="ls-block" style={{background:"#9d174d"}}/>
        </div>
        <div className="ls-title">RAHIN&apos;S PORTFOLIO</div>
        <div className="ls-sub">Loading Adventure...</div>
        <div className="ls-bar-wrap">
          <div className="ls-bar-track">
            <div className="ls-bar-fill" style={{width:`${pct}%`}}/>
            <div className="ls-bar-shine"/>
          </div>
          <div className="ls-pct">{pct}%</div>
        </div>
        <div className="ls-hint">Press ← → to move &nbsp;|&nbsp; SPACE to hit blocks</div>
      </div>
    </div>
  );
});

// ── CHARACTER ─────────────────────────────────────────────────────────────────
const Character = memo(function Character({ charRef, facing, walking, swinging, idle, speech, dashing, isFlipping }) {
  return (
    <div
      ref={charRef}
      className={`char-root ${walking ? "char-walking" : ""} ${swinging ? "char-swinging" : ""} ${isFlipping ? "char-flip" : ""}`}
      style={{
        left: `3%`,
        bottom: `${GROUND_PX}px`,
        transform: `scaleX(${facing === "right" ? 1 : -1})`,
      }}
    >
      {/* Floating name tag */}
      <div className="char-nametag" style={{transform:`scaleX(${facing==="right"?1:-1})`}}>
        Rahin ⚔
      </div>

      {/* Speech bubble */}
      {speech && (
        <div className="speech-bubble" style={{transform:`scaleX(${facing==="right"?1:-1})`}}>
          {speech}<div className="speech-tail"/>
        </div>
      )}

      {/* Dash trail */}
      {dashing && <div className="dash-trail"/>}

      <div className="ch-head">
        <div className="ch-hair"/>
        <div className="ch-face">
          <div className="ch-eye l"/><div className="ch-eye r"/>
          <div className="ch-nose"/><div className={`ch-smile ${idle?"smile-wide":""}`}/>
        </div>
        <div className="ch-ear"/>
      </div>
      <div className="ch-neck"/>
      <div className="ch-body-row">
        <div className="ch-arm ch-al" style={{transform: idle ? "rotate(20deg)" : (dashing ? "rotate(-50deg)" : undefined)}}/>
        <div className="ch-torso">
          <div className="ch-stripe"/><div className="ch-belt"/>
        </div>
        <div className="ch-arm ch-ar" style={{transform: idle ? "rotate(20deg)" : undefined}}>
          <div className="ch-hammer">
            <div className="ch-hhandle"/>
            <div className="ch-hhead"><div className="ch-hshine"/></div>
          </div>
        </div>
      </div>
      {idle ? (
        <div className="ch-idle-sit">
          <div className="ch-legs-sit">
            <div className="ch-leg-sit l"><div className="ch-boot"/></div>
            <div className="ch-leg-sit r"><div className="ch-boot"/></div>
          </div>
          <div className="ch-laptop">
            <div className="ch-laptop-screen"/>
            <div className="ch-laptop-base"/>
          </div>
        </div>
      ) : (
        <div className="ch-legs">
          <div className="ch-leg l"><div className="ch-boot"/></div>
          <div className="ch-leg r"><div className="ch-boot"/></div>
        </div>
      )}
      <div className="ch-shadow"/>
    </div>
  );
});

// ── COIN ──────────────────────────────────────────────────────────────────────
const Coin = memo(function Coin({ x, collected }) {
  if (collected) return null;
  return (
    <div className="coin" style={{left:`${x}%`}}>
      <div className="coin-inner">$</div>
    </div>
  );
});

// ── BLOCK ─────────────────────────────────────────────────────────────────────
const Block = memo(function Block({ sec, glowing, shaking, visited, onClick }) {
  return (
    <div className={`mc-blk ${shaking?"blk-shake":""} ${glowing?"blk-glow":""}`}
      style={{"--ct":sec.top,"--cf":sec.front,"--cs":sec.side,"--cc":sec.color}}
      onClick={onClick}
    >
      {visited && <div className="blk-check">✓</div>}
      <div className="blk-top"/>
      <div className="blk-front">
        <div className="blk-crosshatch"/>
        {glowing && <div className="blk-iglow"/>}
      </div>
      <div className="blk-side"/>
    </div>
  );
});

// ── SECTION COLUMN ────────────────────────────────────────────────────────────
const SectionCol = memo(function SectionCol({ sec, near, active, visited, onHit }) {
  const [shaking, setShaking] = useState(false);
  const [pts, setPts]         = useState([]);

  const hit = useCallback(() => {
    setShaking(true); setTimeout(() => setShaking(false), 380);
    setPts([0,1,2,3,4,5]); setTimeout(() => setPts([]), 700);
    onHit();
  }, [onHit]);

  return (
    <div className="sec-col" style={{left:`${sec.x}%`}}>
      <div className={`sec-tag ${near?"tag-near":""} ${visited?"tag-visited":""}`} style={{color:sec.color}}>
        <span>{sec.label}</span>
        {visited && <span className="tag-check"> ✓</span>}
        {near && !visited && <div className="tag-hint">[ SPACE ]</div>}
        {near && visited  && <div className="tag-hint">[ Revisit ]</div>}
      </div>
      <div className="blk-stack">
        <Block sec={sec} glowing={near||active} shaking={shaking} visited={visited} onClick={hit}/>
        <Block sec={sec} glowing={false} shaking={false} visited={false} onClick={hit}/>
        <Block sec={sec} glowing={false} shaking={false} visited={false} onClick={hit}/>
      </div>
      {pts.map(i => <div key={i} className={`hpt hpt-${i}`} style={{color:sec.color}}>✦</div>)}
      {active && <div className="active-beam" style={{background:sec.color}}/>}
    </div>
  );
});

// ── MINIMAP (top-right corner, compact) ───────────────────────────────────────
const MiniMap = memo(function MiniMap({ miniPlayerRef, visited }) {
  return (
    <div className="minimap">
      <div className="mm-header">
        <span className="mm-title">MAP</span>
        <span className="mm-frac">{visited.size}/{TOTAL_SECS}</span>
      </div>
      <div className="mm-world">
        <div className="mm-ground"/>
        {SECTIONS.map(s => (
          <div key={s.id} className="mm-block" style={{
            left:`${s.x}%`,
            background: visited.has(s.id) ? s.color : "#1e293b",
            boxShadow: visited.has(s.id) ? `0 0 4px ${s.color}` : "none",
          }}/>
        ))}
        <div ref={miniPlayerRef} className="mm-player" style={{left:"3%"}}/>
      </div>
    </div>
  );
});

// ── PROGRESS BAR ─────────────────────────────────────────────────────────────
const ProgressBar = memo(function ProgressBar({ opened }) {
  const pct = (opened / TOTAL_SECS) * 100;
  const clrs = ["#00e5ff","#fbbf24","#c084fc","#34d399","#fb923c","#f472b6"];
  return (
    <div className="progress-bar-wrap">
      <div className="pb-row">
        <span className="pb-text">EXPLORE</span>
        <div className="pb-track">
          <div className="pb-fill" style={{
            width:`${pct}%`,
            background: opened > 0
              ? `linear-gradient(90deg,${clrs.slice(0,Math.max(opened,1)).join(",")})`
              : "transparent",
          }}/>
          {SECTIONS.map((s,i) => (
            <div key={i} className="pb-pip" style={{
              left:`${((i+1)/TOTAL_SECS)*100}%`,
              background: opened > i ? s.color : "#0f172a",
              borderColor: s.color,
              boxShadow: opened > i ? `0 0 5px ${s.color}` : "none",
            }}/>
          ))}
        </div>
        <span className="pb-frac">{opened}/{TOTAL_SECS}</span>
      </div>
      {opened === TOTAL_SECS && (
        <div className="pb-complete">🎉 COMPLETE!</div>
      )}
    </div>
  );
});

// ── PORTAL ────────────────────────────────────────────────────────────────────
const Portal = memo(function Portal({ onEnter }) {
  return (
    <div className="portal" onClick={onEnter}>
      <div className="portal-ring r1"/>
      <div className="portal-ring r2"/>
      <div className="portal-ring r3"/>
      <div className="portal-core">
        <span>?</span>
      </div>
      <div className="portal-label">FINISH<br/>→ END</div>
    </div>
  );
});

// ── FINISH / THANKS PANEL ────────────────────────────────────────────────────
const FinishPanel = memo(function FinishPanel() {
  const s = portfolioData.hero.social;
  const restart = () => window.location.reload();

  return (
    <div className="finish-overlay">
      <div className="finish-box">
        {/* Top pixel strip */}
        <div className="fin-strip top">
          {["#fde047","#f472b6","#34d399","#00e5ff","#c084fc","#fb923c"].map((c,i)=>
            <div key={i} className="fin-px" style={{background:c}}/>
          )}
        </div>

        <div className="fin-inner">
          <div className="fin-trophy">🏆</div>
          <div className="fin-title">Thanks for Playing!</div>
          <div className="fin-sub">You&apos;ve reached the end of Rahin&apos;s Portfolio Adventure</div>
          <div className="fin-divider"/>
          <div className="fin-msg">
            <TW
              text="Hope you enjoyed the journey through my projects, publications and achievements. Let's build something amazing together!"
              tag="p" className="fin-quote"
            />
          </div>
          <div className="fin-badge-row">
            <div className="fin-badge">
              <div className="fin-badge-icon">🗺️</div>
              <div className="fin-badge-label">ADVENTURE</div>
              <div className="fin-badge-val">COMPLETE</div>
            </div>
            <div className="fin-badge">
              <div className="fin-badge-icon">⭐</div>
              <div className="fin-badge-label">ALL SECTIONS</div>
              <div className="fin-badge-val">EXPLORED</div>
            </div>
          </div>
          <div className="fin-divider"/>
          <div className="fin-connect-label">Connect with me</div>
          <div className="fin-socials">
            <a href={s.linkedin} target="_blank" rel="noreferrer" className="fin-social-btn" style={{"--fc":"#0a66c2"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn
            </a>
            <a href={s.github} target="_blank" rel="noreferrer" className="fin-social-btn" style={{"--fc":"#e2e8f0"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
              GitHub
            </a>
            <a href={s.email} rel="noreferrer" className="fin-social-btn" style={{"--fc":"#ea4335"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email
            </a>
            <a href={portfolioData.hero.cv} download className="fin-social-btn" style={{"--fc":"#fde047"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download CV
            </a>
          </div>
          <button className="fin-close" onClick={restart}>
            🔄 Restart Game
          </button>
        </div>

        {/* Bottom pixel strip */}
        <div className="fin-strip bottom">
          {["#fb923c","#c084fc","#00e5ff","#34d399","#f472b6","#fde047"].map((c,i)=>
            <div key={i} className="fin-px" style={{background:c}}/>
          )}
        </div>
      </div>
    </div>
  );
});

// ── MODAL ──────────────────────────────────────────────────────────────────────
const Modal = memo(function Modal({ title, color, onClose, children, wide }) {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className={`modal-panel ${wide?"panel-wide":""}`}
        style={{"--mc":color, borderColor:color}}
        onClick={e => e.stopPropagation()}
      >
        <div className="mpx-tl" style={{background:color}}/><div className="mpx-tr" style={{background:color}}/>
        <div className="mpx-bl" style={{background:color}}/><div className="mpx-br" style={{background:color}}/>
        <div className="modal-header">
          <div className="modal-hbar" style={{background:color}}/>
          <span className="modal-htitle" style={{color}}>▮ {title}</span>
          <button className="modal-cls" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
});

// ── PANELS ────────────────────────────────────────────────────────────────────
const AboutPanel = memo(function AboutPanel({ onClose }) {
  const d = portfolioData.aboutMe;
  return (
    <Modal title="About Me" color={d.color} onClose={onClose}>
      <div className="ab-wrap">
        <div className="ab-left">
          <p className="ab-desc">
            Hello! I&apos;m <b style={{color:"#00e5ff"}}>Rahin Arefin Ahmed</b>, an aspiring{" "}
            <span style={{color:"#00e5ff"}}>Computer Science Student</span> from Dhaka, Bangladesh,
            currently pursuing my Bachelor&apos;s degree at East West University, with a passion for{" "}
            <span style={{color:"#c084fc"}}>Data Science</span> and{" "}
            <span style={{color:"#c084fc"}}>Software Development</span>.
          </p>
          <div className="ab-research">
            <div className="ab-rlabel">✨ Research Focus</div>
            <TW text={d.research} tag="p" style={{color:"#94a3b8",fontSize:"13px",lineHeight:"1.7"}}/>
          </div>
        </div>
        <div className="ab-right">
          {d.details.map((det,i) => (
            <div key={i} className="ab-det">
              <span className="ab-det-icon">{det.icon}</span>
              <div><div className="ab-det-lbl">{det.label}</div><div className="ab-det-val">{det.value}</div></div>
            </div>
          ))}
          <a href={portfolioData.hero.social.linkedin} target="_blank" rel="noreferrer" className="ab-connect">Let&apos;s Connect →</a>
        </div>
      </div>
    </Modal>
  );
});

const SkillsPanel = memo(function SkillsPanel({ onClose }) {
  const d = portfolioData.skills;
  return (
    <Modal title="Technical Skills" color={d.color} onClose={onClose}>
      <div className="sk-grid">
        {d.categories.map((cat,i) => (
          <div key={i} className="sk-card" style={{animationDelay:`${i*0.06}s`}}>
            <div className="sk-title" style={{color:cat.iconColor}}><span>{cat.icon}</span> {cat.name}</div>
            <div className="sk-tags">
              {cat.items.map((it,j) => (
                <span key={j} className="sk-tag" style={{borderColor:`${cat.iconColor}55`,color:cat.iconColor}}>{it}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
});

const ProjectsPanel = memo(function ProjectsPanel({ onClose }) {
  const d = portfolioData.projects;
  return (
    <Modal title="Featured Projects" color={d.color} onClose={onClose} wide>
      <div className="pr-grid">
        {d.items.map((p,i) => (
          <div key={i} className="pr-card" style={{animationDelay:`${i*0.07}s`}}>
            <div className="pr-num" style={{color:d.color}}>0{i+1}</div>
            <div className="pr-name">{p.name}</div>
            <p className="pr-desc">{p.desc}</p>
            <div className="pr-tags">{p.tags.map((t,j) => <span key={j} className="pr-tag">{t}</span>)}</div>
            <a href={p.github} target="_blank" rel="noreferrer" className="pr-gh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
              View on GitHub
            </a>
          </div>
        ))}
      </div>
    </Modal>
  );
});

const PubsPanel = memo(function PubsPanel({ onClose }) {
  const d = portfolioData.publications;
  return (
    <Modal title="Academic Publications" color={d.color} onClose={onClose}>
      <div className="pub-wrap">
        {d.items.map((p,i) => (
          <div key={i} className="pub-card">
            <div className="pub-type">📖 {p.type}</div>
            <div className="pub-title">{p.title} <span style={{color:d.color}}>{p.titleHighlight}</span></div>
            <div className="pub-venue">{p.venue} • <span style={{color:d.color}}>{p.venueHighlight}</span></div>
            <TW text={p.desc} tag="p" className="pub-desc"/>
            <a href={p.link} target="_blank" rel="noreferrer" className="pub-btn" style={{borderColor:d.color,color:d.color}}>↗ Read Publication</a>
          </div>
        ))}
      </div>
    </Modal>
  );
});

const AwardsPanel = memo(function AwardsPanel({ onClose }) {
  const d = portfolioData.awards;
  const [viewing, setViewing] = useState(null);
  return (
    <Modal title="Awards & Certifications" color={d.color} onClose={onClose} wide>
      <div className="aw-grid">
        {d.items.map((a,i) => (
          <div key={i} className="aw-card" style={{animationDelay:`${i*0.06}s`}}>
            <div className="aw-issuer" style={{color:d.color}}>🏅 {a.issuer}</div>
            <div className="aw-title">{a.title}</div>
            <p className="aw-desc">{a.desc}</p>
            <button className="aw-btn" style={{borderColor:d.color,color:d.color}} onClick={() => setViewing(a)}>📄 View Certificate</button>
          </div>
        ))}
      </div>
      {viewing && (
        <div className="cert-lb" onClick={() => setViewing(null)}>
          <div className="cert-inner" onClick={e => e.stopPropagation()}>
            <div className="cert-hdr">
              <span>{viewing.title}</span>
              <button onClick={() => setViewing(null)}>✕ Close</button>
            </div>
            {viewing.fileType==="pdf"
              ? <iframe src={viewing.file} title={viewing.title} className="cert-iframe"/>
              : <img src={viewing.file} alt={viewing.title} className="cert-imgv"/>}
          </div>
        </div>
      )}
    </Modal>
  );
});

const ContactPanel = memo(function ContactPanel({ onClose }) {
  const s = portfolioData.hero.social;
  const links = [
    {label:"LinkedIn", url:s.linkedin, color:"#0a66c2", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>},
    {label:"GitHub",   url:s.github,   color:"#e2e8f0", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>},
    {label:"Twitter",  url:s.twitter,  color:"#1da1f2", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>},
    {label:"Gmail",    url:s.email,    color:"#ea4335", icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>},
  ];
  return (
    <Modal title="Get in Touch" color="#f472b6" onClose={onClose}>
      <div className="ct-wrap">
        <TW text="Whether you have a question, a project idea, or just want to say hi — I'd love to hear from you!" tag="p" className="ct-sub"/>
        <div className="ct-links">
          {links.map((l,i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer" className="ct-link" style={{"--lc":l.color}}>
              <div className="ct-ico">{l.icon}</div>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
        <a href={portfolioData.hero.cv} download className="ct-dl">⬇ Download CV (PDF)</a>
      </div>
    </Modal>
  );
});

// ── SKY ────────────────────────────────────────────────────────────────────────
const SKY_STARS = Array.from({length:50},(_,i) => ({
  x:(i*17.3)%100, y:(i*13.1)%60, s:i%5===0?3:i%3===0?2:1, d:(i*0.41)%4
}));

const Sky = memo(function Sky({ isDay, mtnRef, cloudRef }) {
  return (
    <>
      <div className={`sky-bg ${isDay?"sky-day":"sky-night"}`}/>
      {!isDay && (
        <div className="sky-stars">
          {SKY_STARS.map((s,i) => <div key={i} className="sstar" style={{left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,animationDelay:`${s.d}s`}}/>)}
        </div>
      )}
      {isDay ? (
        <div className="sky-sun">
          <div className="sun-core"/>
          {[0,45,90,135,180,225,270,315].map(r => <div key={r} className="sun-ray" style={{transform:`rotate(${r}deg)`}}/>)}
        </div>
      ) : (
        <div className="sky-moon">
          <div className="moon-face"/><div className="moon-cr mc1"/><div className="moon-cr mc2"/><div className="moon-halo"/>
        </div>
      )}
      {!isDay && <div className="aurora-layer"><div className="aur a1"/><div className="aur a2"/><div className="aur a3"/></div>}

      {/* Parallax mountains */}
      <div ref={mtnRef} className="mtn-layer">
        <div className="mtn m1"/><div className="mtn m2"/><div className="mtn m3"/><div className="mtn m4"/>
      </div>

      {/* Parallax clouds */}
      <div ref={cloudRef} className="cloud-layer">
        {[6,28,52,74].map((x,i) => (
          <div key={i} className={`pcloud pc${i}`} style={{left:`${x}%`}}>
            {[...Array(5)].map((_,j) => <div key={j} className={`pcb ${isDay?"pcb-day":""}`}/>)}
          </div>
        ))}
      </div>

      {[3,13,47,63,80,92].map((x,i) => (
        <div key={i} className={`ptree pt${i%3}`} style={{left:`${x}%`}}>
          <div className="pt-leaves"/><div className="pt-trunk"/>
        </div>
      ))}
    </>
  );
});

// ── GROUND ────────────────────────────────────────────────────────────────────
const Ground = memo(function Ground() {
  return (
    <div className="gnd-wrap">
      <div className="gnd-grass"><div className="gnd-grassline"/></div>
      <div className="gnd-dirt">
        {Array.from({length:20}).map((_,i) => <div key={i} className="gnd-seam" style={{left:`${i*5}%`}}/>)}
      </div>
      {[10,28,50,68,88].map((x,i) => (
        <div key={i} className="torch" style={{left:`${x}%`}}>
          <div className="t-stick"/><div className="t-flame"/><div className="t-glow"/>
        </div>
      ))}
      {[18,38,58,80].map((x,i) => <div key={i} className="gnd-flower" style={{left:`${x}%`}}>🌸</div>)}
    </div>
  );
});

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded,       setLoaded]       = useState(false);
  const [facing,       setFacing]       = useState("right");
  const [walking,      setWalking]      = useState(false);
  const [swinging,     setSwinging]     = useState(false);
  const [dashing,      setDashing]      = useState(false);
  const [isFlipping,   setIsFlipping]   = useState(false);

  const [isDay,        setIsDay]        = useState(false);
  const [weather,      setWeather]      = useState(null); // null | "rain" | "snow"
  const [musicOn,      setMusicOn]      = useState(false);
  const [shake,        setShake]        = useState(false);
  const [confetti,     setConfetti]     = useState(false);
  const [coins,        setCoins]        = useState(new Set());
  const [score,        setScore]        = useState(0);
  const [idle,         setIdle]         = useState(false);
  const [speech,       setSpeech]       = useState(SPEECH_TIPS[0]);
  const [showSpeech,   setShowSpeech]   = useState(true);
  const [achievement,  setAchievement]  = useState(null);
  const [showFinish,   setShowFinish]   = useState(false);
  const [activePanel,  setActivePanel]  = useState(null);
  const [nearId,       setNearId]       = useState(null);
  const [opened,       setOpened]       = useState(new Set());
  const [showIntro,    setShowIntro]    = useState(true);

  // DOM Refs for direct 60fps+ updates (bypasses React reconciliation overhead)
  const charRef        = useRef(null);
  const miniPlayerRef  = useRef(null);
  const mtnRef         = useRef(null);
  const cloudRef       = useRef(null);

  // State mirror refs for event listeners and animation loop
  const keys           = useRef({});
  const ref            = useRef({ x:3, bot:GROUND_PX, vy:0, onGnd:true, jumps:0 });
  const raf            = useRef();
  const idleTimer      = useRef(null);
  const dashTimer      = useRef(null);
  const firstOpen      = useRef(new Set());
  const unlockedAch    = useRef(new Set());
  const audio          = useRef(null);
  const bgOsc          = useRef(null);
  const introActive    = useRef(true);
  const finishTriggered= useRef(false);
  const coinsRef       = useRef(new Set());
  const walkingRef     = useRef(false);
  const facingRef      = useRef("right");
  const nearRef        = useRef(null);
  const parallaxXRef   = useRef(0);

  const setIntroWrapper = (val) => { introActive.current = val; setShowIntro(val); };

  // Init audio on first interaction
  const initAudio = useCallback(() => {
    if (!audio.current) audio.current = createAudio();
    audio.current.resume();
  }, []);

  // Background 8-bit music
  const musicOnRef = useRef(false);
  const toggleMusic = useCallback(() => {
    initAudio();
    const ctx = audio.current?.ctx;
    if (!ctx) return;
    if (musicOnRef.current) {
      if (bgOsc.current) { clearInterval(bgOsc.current); bgOsc.current = null; }
      musicOnRef.current = false;
      setMusicOn(false);
    } else {
      const notes = [261,294,330,349,392,440,392,349,330,294,523,440,392,330];
      let ni = 0;
      const playNote = () => {
        if (!musicOnRef.current) return;
        try {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g); g.connect(ctx.destination);
          osc.type = "square";
          osc.frequency.setValueAtTime(notes[ni % notes.length], ctx.currentTime);
          g.gain.setValueAtTime(0.04, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.22);
          ni++;
        } catch {}
      };
      musicOnRef.current = true;
      setMusicOn(true);
      bgOsc.current = setInterval(playNote, 300);
    }
  }, [initAudio]);

  useEffect(() => () => { if (bgOsc.current) { clearInterval(bgOsc.current); bgOsc.current = null; } }, []);

  // Check achievements
  const checkAchievements = useCallback((openedSet, coinSet) => {
    const oc = openedSet.size, cc = coinSet.size;
    for (const ach of ACHIEVEMENTS) {
      if (!unlockedAch.current.has(ach.id) && ach.condition(oc, cc)) {
        unlockedAch.current.add(ach.id);
        setAchievement(ach);
        audio.current?.achieve();
        break;
      }
    }
  }, []);

  // Speech cycle
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i+1) % SPEECH_TIPS.length;
      setSpeech(SPEECH_TIPS[i]);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 2500);
    }, 5500);
    setTimeout(() => setShowSpeech(false), 2500);
    return () => clearInterval(t);
  }, []);

  const getNear = useCallback(x => {
    for (const s of SECTIONS) if (Math.abs(x - s.x) < 5) return s.id;
    return null;
  }, []);

  const doSwing = useCallback(() => {
    setSwinging(true); setTimeout(() => setSwinging(false), 380);
  }, []);
  const doShake = useCallback(() => {
    setShake(true); setTimeout(() => setShake(false), 400);
  }, []);

  const openSection = useCallback(id => {
    initAudio();
    doSwing(); doShake();
    audio.current?.hit();
    if (!firstOpen.current.has(id)) {
      firstOpen.current.add(id);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
    }
    setActivePanel(p => {
      const next = p === id ? null : id;
      if (next) {
        setOpened(o => {
          const ns = new Set([...o, id]);
          checkAchievements(ns, coinsRef.current);
          return ns;
        });
      }
      return next;
    });
  }, [doSwing, doShake, initAudio, checkAchievements]);

  const resetIdle = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 6000);
  }, []);

  const doDash = useCallback(() => {
    if (dashTimer.current) return;
    initAudio();
    audio.current?.dash();
    setDashing(true);
    dashTimer.current = setTimeout(() => {
      setDashing(false);
      dashTimer.current = null;
    }, DASH_DUR + 350);
  }, [initAudio]);

  // Keyboard
  useEffect(() => {
    const dn = e => {
      if (introActive.current) return;
      keys.current[e.code] = true;
      if (["Space","ArrowUp","ArrowLeft","ArrowRight","KeyA","KeyD","KeyW","ShiftLeft","ShiftRight"].includes(e.code))
        e.preventDefault();
      initAudio();

      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        doDash();
      }
      if (e.code === "Space" || e.code === "KeyE") {
        resetIdle();
        const near = getNear(ref.current.x);
        if (near) { openSection(near); return; }
        const j = ref.current.jumps;
        if (j === 0 && ref.current.onGnd) {
          doSwing();
          ref.current.vy = JUMP_V;
          ref.current.onGnd = false;
          ref.current.jumps = 1;
          audio.current?.jump();
        } else if (j === 1) {
          ref.current.vy = JUMP_V2;
          ref.current.jumps = 2;
          setIsFlipping(true);
          setTimeout(() => setIsFlipping(false), 450);
          audio.current?.jump();
        }
      }
    };
    const up = e => { keys.current[e.code] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [getNear, openSection, doSwing, resetIdle, doDash, initAudio]);

  // Ultra-optimized 60+ FPS Game loop
  useEffect(() => {
    let last = performance.now();
    let stepAcc = 0;
    const loop = now => {
      const dt = Math.min((now - last) / 16.67, 2.5);
      last = now;

      let { x, bot, vy, onGnd: og, jumps: jc } = ref.current;
      let moved = false;
      let newFacing = facingRef.current;

      const spd = (dashing ? DASH_SPEED : SPEED) * dt;
      if (keys.current["ArrowLeft"]  || keys.current["KeyA"]) {
        x = Math.max(1, x - spd);
        newFacing = "left";
        moved = true;
      }
      if (keys.current["ArrowRight"] || keys.current["KeyD"]) {
        x = Math.min(92, x + spd);
        newFacing = "right";
        moved = true;
      }

      if (moved) {
        resetIdle();
        parallaxXRef.current += (newFacing === "right" ? 1 : -1) * 0.5 * dt;
      }

      bot += vy * dt;
      vy  -= GRAV * dt;
      if (bot <= GROUND_PX) {
        bot = GROUND_PX; vy = 0; og = true;
        if (jc > 0) jc = 0;
      } else {
        og = false;
      }

      ref.current = { x, bot, vy, onGnd: og, jumps: jc };

      // 1. Direct hardware-accelerated DOM positioning
      if (charRef.current) {
        charRef.current.style.left = `${x}%`;
        charRef.current.style.bottom = `${bot}px`;
      }
      if (miniPlayerRef.current) {
        miniPlayerRef.current.style.left = `${x}%`;
      }
      if (mtnRef.current) {
        mtnRef.current.style.transform = `translateX(${-parallaxXRef.current * 0.12}px)`;
      }
      if (cloudRef.current) {
        cloudRef.current.style.transform = `translateX(${-parallaxXRef.current * 0.25}px)`;
      }

      // 2. Discrete state updates only when state actually changed
      if (newFacing !== facingRef.current) {
        facingRef.current = newFacing;
        setFacing(newFacing);
      }

      const isWalking = moved && og;
      if (isWalking !== walkingRef.current) {
        walkingRef.current = isWalking;
        setWalking(isWalking);
      }

      // Footstep sound
      if (isWalking) {
        stepAcc += dt;
        if (stepAcc > 10) { audio.current?.step(); stepAcc = 0; }
      } else {
        stepAcc = 0;
      }

      const near = getNear(x);
      if (near !== nearRef.current) {
        nearRef.current = near;
        setNearId(near);
      }

      // 3. Coin collection (checked purely with math, no redundant setState)
      for (let i = 0; i < COIN_DEFS.length; i++) {
        const coin = COIN_DEFS[i];
        if (!coinsRef.current.has(coin.id) && Math.abs(x - coin.x) < 2.5) {
          coinsRef.current.add(coin.id);
          const ns = new Set(coinsRef.current);
          audio.current?.coin();
          setCoins(ns);
          setScore(s => s + 50);
          setOpened(o => { checkAchievements(o, ns); return o; });
        }
      }

      // 4. Portal check
      if (x > 90.5 && !finishTriggered.current) {
        finishTriggered.current = true;
        setShowFinish(true);
      }

      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    idleTimer.current = setTimeout(() => setIdle(true), 6000);
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(idleTimer.current);
    };
  }, [getNear, resetIdle, checkAchievements, dashing]);

  const PANELS = {
    aboutMe:      <AboutPanel    onClose={() => setActivePanel(null)}/>,
    skills:       <SkillsPanel   onClose={() => setActivePanel(null)}/>,
    projects:     <ProjectsPanel onClose={() => setActivePanel(null)}/>,
    publications: <PubsPanel     onClose={() => setActivePanel(null)}/>,
    awards:       <AwardsPanel   onClose={() => setActivePanel(null)}/>,
    contact:      <ContactPanel  onClose={() => setActivePanel(null)}/>,
  };

  const mbDown = dir => { initAudio(); keys.current[dir] = true; resetIdle(); };
  const mbUp   = dir => { keys.current[dir] = false; };
  const mbHit  = () => {
    initAudio(); resetIdle();
    const near = getNear(ref.current.x);
    if (near) { openSection(near); return; }
    const j = ref.current.jumps;
    if (j === 0 && ref.current.onGnd) {
      doSwing();
      ref.current.vy = JUMP_V;
      ref.current.onGnd = false;
      ref.current.jumps = 1;
      audio.current?.jump();
    } else if (j === 1) {
      ref.current.vy = JUMP_V2;
      ref.current.jumps = 2;
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 450);
      audio.current?.jump();
    }
  };

  const weatherCycle = () => setWeather(w => w === null ? "rain" : w === "rain" ? "snow" : null);

  if (!loaded) return <LoadingScreen onDone={() => setLoaded(true)}/>;

  return (
    <div className={`world-root ${shake?"world-shake":""} ${isDay?"is-day":""}`}
      onMouseMove={initAudio} onKeyDown={initAudio}>
      <Sky isDay={isDay} mtnRef={mtnRef} cloudRef={cloudRef}/>
      <Weather type={weather}/>

      {/* ── TOP BAR ── title center, controls left+right */}
      <div className="world-title-wrap">
        <div className="wt-main"><span className="wt-sword">⚔</span> Rahin&apos;s Portfolio <span className="wt-sword">⚔</span></div>
        <div className="wt-sub">Portfolio Adventure — Walk &amp; Hit Blocks to Explore</div>
      </div>

      {/* Left controls group */}
      <div className="ctrl-left">
        <button className="ctrl-btn" onClick={() => { initAudio(); setIsDay(d => !d); }}>
          {isDay ? "🌙" : "☀️"}
        </button>
        <button className="ctrl-btn" onClick={weatherCycle} title="Weather">
          {weather === "rain" ? "🌧️" : weather === "snow" ? "❄️" : "🌤️"}
        </button>
        <button className="ctrl-btn" onClick={toggleMusic} title="Music">
          {musicOn ? "🔊" : "🔇"}
        </button>
      </div>

      {/* HUD top-right */}
      <div className="game-hud">
        <div className="hud-hearts">❤️ ❤️ ❤️</div>
        <div className="hud-score">SCORE: {score + opened.size * 100}</div>
        <div className="hud-coins">🪙 {coins.size} coins</div>
        <div className="hud-tip">← → Move | SPACE Jump/Hit | SHIFT Dash</div>
      </div>

      {/* MiniMap — top right below HUD */}
      <MiniMap miniPlayerRef={miniPlayerRef} visited={opened}/>

      {/* Progress bar — below title pill */}
      <ProgressBar opened={opened.size}/>

      {/* Portal at right edge */}
      <Portal onEnter={() => setShowFinish(true)}/>

      {/* Coins */}
      {COIN_DEFS.map(coin => <Coin key={coin.id} x={coin.x} collected={coins.has(coin.id)}/>)}

      {/* Sections */}
      {SECTIONS.map(s => (
        <SectionCol key={s.id} sec={s}
          near={nearId===s.id} active={activePanel===s.id}
          visited={opened.has(s.id)} onHit={() => openSection(s.id)}/>
      ))}

      {/* Character */}
      <Character
        charRef={charRef}
        facing={facing}
        walking={walking}
        swinging={swinging}
        idle={idle}
        dashing={dashing}
        isFlipping={isFlipping}
        speech={showSpeech && !walking && !idle ? speech : null}
      />

      <Ground/>
      <Confetti active={confetti}/>

      {/* Panels */}
      {activePanel && PANELS[activePanel]}
      {showFinish && <FinishPanel/>}

      {/* Achievement toast */}
      {achievement && (
        <AchievementToast achievement={achievement} onDone={() => setAchievement(null)}/>
      )}

      {/* Intro */}
      {showIntro && (
        <div className="intro-overlay" onClick={() => { keys.current = {}; setIntroWrapper(false); initAudio(); resetIdle(); }}>
          <div className="intro-box">
            <div className="ib-icon">⚔️</div>
            <div className="ib-title">Welcome to<br/><span>Rahin&apos;s Portfolio</span></div>
            <div className="ib-sub">A Minecraft-Style Adventure</div>
            <div className="ib-controls">
              <div><kbd>← →</kbd> Move &amp; explore</div>
              <div><kbd>SPACE</kbd> Jump / Hit blocks</div>
              <div><kbd>SPACE×2</kbd> Double jump flip!</div>
              <div><kbd>SHIFT</kbd> Dash forward ⚡</div>
              <div><kbd>🪙</kbd> Collect coins for score</div>
              <div><kbd>→→→</kbd> Walk to the end to finish!</div>
            </div>
            <div className="ib-start">▶ CLICK TO START</div>
          </div>
        </div>
      )}

      {/* Mobile pad */}
      <div className="mob-pad">
        <button className="mpb" onPointerDown={() => mbDown("ArrowLeft")} onPointerUp={() => mbUp("ArrowLeft")} onPointerLeave={() => mbUp("ArrowLeft")}>◀</button>
        <button className="mpb mpb-hit" onPointerDown={mbHit}>⚒</button>
        <button className="mpb" onPointerDown={() => mbDown("ArrowRight")} onPointerUp={() => mbUp("ArrowRight")} onPointerLeave={() => mbUp("ArrowRight")}>▶</button>
      </div>
    </div>
  );
}
