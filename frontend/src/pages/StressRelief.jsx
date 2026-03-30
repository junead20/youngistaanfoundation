import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';

const breathingPatterns = [
  {
    id: 'box',
    name: 'Box 4-4-4-4',
    description: 'Steady and balanced, like a soft square.',
    phases: [
      { label: 'breathe in', duration: 4, type: 'inhale' },
      { label: 'hold', duration: 4, type: 'hold' },
      { label: 'breathe out', duration: 4, type: 'exhale' },
      { label: 'hold', duration: 4, type: 'hold' },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Calm',
    description: 'Long, cozy exhale to soften the body.',
    phases: [
      { label: 'breathe in', duration: 4, type: 'inhale' },
      { label: 'hold', duration: 7, type: 'hold' },
      { label: 'breathe out', duration: 8, type: 'exhale' },
    ],
  },
  {
    id: '505',
    name: '5-0-5 Gentle',
    description: 'Smooth inhale and exhale, no holding.',
    phases: [
      { label: 'breathe in', duration: 5, type: 'inhale' },
      { label: 'breathe out', duration: 5, type: 'exhale' },
    ],
  },
];

const groundingSteps = [
  { count: 5, prompt: 'Look around. I notice 5 things I can see. I tap each one as I spot it.' },
  { count: 4, prompt: 'I notice 4 things I can feel right now. I tap to mark them.' },
  { count: 3, prompt: 'I listen for 3 sounds. I tap as I hear them.' },
  { count: 2, prompt: 'I notice or imagine 2 smells I like. I tap to hold them in mind.' },
  { count: 1, prompt: 'I notice 1 taste or one thing I am grateful for. I tap to honor it.' },
];

const phrases = [
  'I showed up. That counts.',
  'No rush. I am just here.',
  'One minute at a time.',
  'Breath by breath, I soften.',
  'I can pause whenever I need.',
  'I move at my own pace.',
  'Calm is allowed right now.',
  'Rest is productive too.',
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function playSoftBell() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 480;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
  } catch (err) {
    // Fail silently to keep the experience gentle.
  }
}

export default function StressRelief() {
  const [selectedTool, setSelectedTool] = useState('breathing');

  // Breathing state
  const [patternId, setPatternId] = useState('box');
  const [targetCycles, setTargetCycles] = useState(4);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingDone, setBreathingDone] = useState(false);
  const [breathingState, setBreathingState] = useState({ phaseIndex: 0, elapsed: 0, cyclesCompleted: 0 });

  // Meditation
  const [medMinutes, setMedMinutes] = useState(5);
  const [medSecondsLeft, setMedSecondsLeft] = useState(5 * 60);
  const [medRunning, setMedRunning] = useState(false);
  const [bellOn, setBellOn] = useState(true);

  // Walking
  const [walkTargetMinutes, setWalkTargetMinutes] = useState(10);
  const [walkSeconds, setWalkSeconds] = useState(0);
  const [walkRunning, setWalkRunning] = useState(false);
  const [walkHalfShown, setWalkHalfShown] = useState(false);
  const [walkFinished, setWalkFinished] = useState(false);

  // Motivation phrases
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Grounding
  const [groundStep, setGroundStep] = useState(0);
  const [groundFilled, setGroundFilled] = useState(0);
  const [groundDone, setGroundDone] = useState(false);

  const pattern = useMemo(() => breathingPatterns.find(p => p.id === patternId) || breathingPatterns[0], [patternId]);
  const currentPhase = pattern.phases[breathingState.phaseIndex];
  const phaseProgress = Math.min(breathingState.elapsed / currentPhase.duration, 1);

  // Breathing animation loop
  useEffect(() => {
    if (!isBreathing) return undefined;
    setBreathingDone(false);
    let rafId;
    let last = performance.now();
    const loop = (now) => {
      const delta = (now - last) / 1000;
      last = now;
      let finished = false;
      setBreathingState((prev) => {
        let elapsed = prev.elapsed + delta;
        let phaseIndex = prev.phaseIndex;
        let cyclesCompleted = prev.cyclesCompleted;
        const phases = pattern.phases;
        while (elapsed >= phases[phaseIndex].duration && !finished) {
          elapsed -= phases[phaseIndex].duration;
          phaseIndex += 1;
          if (phaseIndex >= phases.length) {
            phaseIndex = 0;
            cyclesCompleted += 1;
            if (cyclesCompleted >= targetCycles) {
              finished = true;
              elapsed = 0;
            }
          }
        }
        return finished ? { phaseIndex: 0, elapsed: 0, cyclesCompleted } : { phaseIndex, elapsed, cyclesCompleted };
      });
      if (finished) {
        setIsBreathing(false);
        setBreathingDone(true);
        return;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isBreathing, pattern, targetCycles]);

  useEffect(() => {
    setBreathingState({ phaseIndex: 0, elapsed: 0, cyclesCompleted: 0 });
    setBreathingDone(false);
    setIsBreathing(false);
  }, [patternId, targetCycles]);

  // Meditation countdown
  useEffect(() => {
    if (!medRunning) return undefined;
    const id = setInterval(() => {
      setMedSecondsLeft((prev) => {
        if (prev <= 1) {
          if (bellOn) playSoftBell();
          setMedRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [medRunning, bellOn]);

  // Walking count-up
  useEffect(() => {
    if (!walkRunning) return undefined;
    const id = setInterval(() => {
      setWalkSeconds((prev) => {
        const next = prev + 1;
        const targetSeconds = walkTargetMinutes * 60;
        if (!walkHalfShown && next >= targetSeconds / 2) {
          setWalkHalfShown(true);
        }
        if (next >= targetSeconds) {
          setWalkRunning(false);
          setWalkFinished(true);
          return targetSeconds;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [walkRunning, walkTargetMinutes, walkHalfShown]);

  // Motivation phrase rotation every 60 seconds while any timer runs
  useEffect(() => {
    const active = medRunning || walkRunning;
    if (!active) return undefined;
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length);
    }, 60000);
    return () => clearInterval(id);
  }, [medRunning, walkRunning]);

  // Reset phrase when switching tools to keep it fresh
  useEffect(() => { setPhraseIndex(0); }, [selectedTool]);

  // Grounding helpers
  useEffect(() => {
    setGroundFilled(0);
  }, [groundStep]);

  useEffect(() => {
    if (groundStep >= groundingSteps.length) {
      setGroundDone(true);
    }
  }, [groundStep]);

  const handleGroundTap = () => {
    const total = groundingSteps[groundStep]?.count || 0;
    setGroundFilled((prev) => {
      const next = Math.min(prev + 1, total);
      if (next === total) {
        setTimeout(() => setGroundStep((s) => s + 1), 400);
      }
      return next;
    });
  };

  const circleScale = useMemo(() => {
    const phases = pattern.phases;
    const prevType = phases[(breathingState.phaseIndex - 1 + phases.length) % phases.length].type;
    const startScale = prevType === 'inhale' ? 1.05 : prevType === 'exhale' ? 0.7 : 0.88;
    const endScale = currentPhase.type === 'inhale' ? 1.05 : currentPhase.type === 'exhale' ? 0.7 : startScale;
    const eased = phaseProgress * phaseProgress * (3 - 2 * phaseProgress);
    return startScale + (endScale - startScale) * eased;
  }, [breathingState.phaseIndex, currentPhase.type, phaseProgress, pattern.phases]);

  const renderBreathing = () => (
    <div className="calm-card fade-in">
      <div className="card-head">
        <div>
          <p className="eyebrow">Breathing exercises</p>
          <h2>Gentle guided breaths</h2>
          <p className="sub">Choose a pattern, set cycles, and flow with the expanding circle.</p>
        </div>
        <div className="pill">Default 4 cycles — change before starting.</div>
      </div>

      <div className="pattern-grid">
        {breathingPatterns.map((p) => (
          <button
            key={p.id}
            className={`pattern ${p.id === patternId ? 'pattern-active' : ''}`}
            onClick={() => setPatternId(p.id)}
            disabled={isBreathing}
          >
            <div className="pattern-name">{p.name}</div>
            <div className="pattern-desc">{p.description}</div>
          </button>
        ))}
      </div>

      <div className="breath-layout">
        <div className="breath-visual">
          <div className="pulse" style={{ transform: `scale(${circleScale})` }} />
          <div className="breath-time">{Math.max(0, Math.ceil(currentPhase.duration - breathingState.elapsed))}s</div>
          <div className="breath-phase">{currentPhase.label}</div>
        </div>

        <div className="breath-controls">
          <label className="input-label">Cycles (1–8)</label>
          <input
            type="range"
            min="1"
            max="8"
            value={targetCycles}
            onChange={(e) => setTargetCycles(Number(e.target.value))}
            disabled={isBreathing}
          />
          <div className="range-value">{targetCycles} cycles</div>

          <div className="controls-row">
            <button className="soft-btn primary" onClick={() => { if (breathingDone) setBreathingState({ phaseIndex: 0, elapsed: 0, cyclesCompleted: 0 }); setBreathingDone(false); setIsBreathing((s) => !s); }}>
              {isBreathing ? 'Pause' : 'Start'}
            </button>
            <button className="soft-btn" onClick={() => {
              setIsBreathing(false);
              setBreathingDone(false);
              setBreathingState({ phaseIndex: 0, elapsed: 0, cyclesCompleted: 0 });
            }}>
              Reset
            </button>
          </div>

          <div className="progress-wrap">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((breathingState.cyclesCompleted / targetCycles) * 100, 100)}%` }}
              />
            </div>
            <p className="progress-label">{breathingState.cyclesCompleted} / {targetCycles} cycles</p>
          </div>
          {breathingDone && (
            <div className="completion">All cycles are done. I stay here as long as it feels good.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMeditation = () => (
    <div className="calm-card fade-in">
      <div className="card-head">
        <div>
          <p className="eyebrow">Meditation timer</p>
          <h2>Soft countdown with space</h2>
          <p className="sub">Set a gentle window and let the timer breathe with you.</p>
        </div>
        <div className="pill">Optional bell at start and finish</div>
      </div>

      <div className="timer-shell">
        <div className="glow-circle" />
        <div className="timer-time">{formatTime(medSecondsLeft)}</div>
        <div className="timer-phrase">{phrases[phraseIndex]}</div>
      </div>

      <div className="slider-row">
        <label className="input-label">Minutes (1–30)</label>
        <input
          type="range"
          min="1"
          max="30"
          value={medMinutes}
          onChange={(e) => {
            const val = Number(e.target.value);
            setMedMinutes(val);
            if (!medRunning) setMedSecondsLeft(val * 60);
          }}
          disabled={medRunning}
        />
        <div className="range-value">{medMinutes} minutes</div>
      </div>

      <div className="controls-row">
        <button className="soft-btn primary" onClick={() => {
          if (!medRunning) {
            setMedSecondsLeft(medMinutes * 60);
            if (bellOn) playSoftBell();
          }
          setMedRunning((s) => !s);
        }}>
          {medRunning ? 'Pause' : 'Start'}
        </button>
        <button className="soft-btn" onClick={() => { setMedRunning(false); setMedSecondsLeft(medMinutes * 60); }}>
          Reset
        </button>
        <label className="toggle">
          <input type="checkbox" checked={bellOn} onChange={(e) => setBellOn(e.target.checked)} />
          <span>Soft bell</span>
        </label>
      </div>
    </div>
  );

  const renderWalking = () => {
    const targetSeconds = walkTargetMinutes * 60;
    const halfwayReached = walkHalfShown && walkSeconds < targetSeconds;
    return (
      <div className="calm-card fade-in">
        <div className="card-head">
          <div>
            <p className="eyebrow">Walking mode</p>
            <h2>Unhurried steps</h2>
            <p className="sub">Time moves forward gently. I notice how my body feels.</p>
          </div>
          <div className="pill">No alarms — just a visual shift</div>
        </div>

        <div className="timer-shell">
          <div className="glow-circle slow" />
          <div className="timer-time">{formatTime(walkSeconds)}</div>
          <div className="timer-phrase">{phrases[phraseIndex]}</div>
        </div>

        {halfwayReached && (
          <div className="gentle-note">You're halfway. I take a breath and keep moving.</div>
        )}

        {walkFinished && (
          <div className="completion">I reached my intention. I can linger here before moving on.</div>
        )}

        <div className="slider-row">
          <label className="input-label">Intention (minutes)</label>
          <input
            type="range"
            min="5"
            max="45"
            value={walkTargetMinutes}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWalkTargetMinutes(val);
              if (!walkRunning) setWalkSeconds(0);
            }}
            disabled={walkRunning}
          />
          <div className="range-value">{walkTargetMinutes} minutes</div>
        </div>

        <div className="controls-row">
          <button className="soft-btn primary" onClick={() => {
            setWalkFinished(false);
            setWalkHalfShown(false);
            setWalkRunning((s) => !s);
          }}>
            {walkRunning ? 'Pause' : 'Start'}
          </button>
          <button className="soft-btn" onClick={() => { setWalkRunning(false); setWalkSeconds(0); setWalkFinished(false); setWalkHalfShown(false); }}>
            Reset
          </button>
        </div>
      </div>
    );
  };

  const renderGrounding = () => {
    if (groundDone && groundStep >= groundingSteps.length) {
      return (
        <div className="calm-card fade-in full">
          <div className="grounding-final">
            <p className="eyebrow">5-4-3-2-1 complete</p>
            <h2>You're here. That's enough.</h2>
            <p className="sub">I can return to the start anytime or rest here for a moment.</p>
            <button className="soft-btn primary" onClick={() => { setGroundStep(0); setGroundDone(false); }}>
              Return to beginning
            </button>
          </div>
        </div>
      );
    }

    const step = groundingSteps[groundStep];
    const total = step?.count || 0;
    const circles = Array.from({ length: total });

    return (
      <div className="calm-card fade-in full">
        <div className="grounding">
          <div className="dots">
            {groundingSteps.map((_, i) => (
              <span key={i} className={`dot ${i === groundStep ? 'dot-active' : i < groundStep ? 'dot-done' : ''}`} />
            ))}
          </div>
          <div className="grounding-prompt">{step?.prompt}</div>
          <div className="circle-row">
            {circles.map((_, i) => (
              <button
                key={i}
                className={`tap-circle ${i < groundFilled ? 'filled' : ''}`}
                onClick={handleGroundTap}
              >
                {i < groundFilled ? '✓' : ''}
              </button>
            ))}
          </div>
          <button className="soft-btn" onClick={() => setGroundStep((s) => Math.max(0, Math.min(s + 1, groundingSteps.length)))}>
            Skip ahead gently
          </button>
        </div>
      </div>
    );
  };

  const tools = [
    { id: 'breathing', title: 'Breathing', blurb: 'Guided inhales and exhales with a soft circle.' },
    { id: 'meditation', title: 'Meditation', blurb: 'A warm countdown that never rushes.' },
    { id: 'walking', title: 'Walking', blurb: 'A calm count-up for unhurried steps.' },
    { id: 'grounding', title: '5-4-3-2-1', blurb: 'One sense at a time, at my pace.' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 260, padding: 0 }}>
        <div className="calm-shell">
          <style>{`
            .calm-shell {
              min-height: 100vh;
              background: radial-gradient(circle at 20% 20%, rgba(255, 200, 170, 0.35), transparent 45%),
                          radial-gradient(circle at 80% 10%, rgba(189, 224, 214, 0.35), transparent 40%),
                          radial-gradient(circle at 50% 80%, rgba(196, 210, 255, 0.3), transparent 40%),
                          #f7f4ee;
              color: #2f2a28;
              font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
              padding: 32px 24px 48px;
            }
            .calm-header { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
            .calm-header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.3px; color: #3b352e; }
            .calm-header p { color: #5b524a; max-width: 680px; }
            .tool-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 16px 0 28px; }
            .tool-card { padding: 14px 16px; border-radius: 16px; border: 1px solid rgba(70, 60, 52, 0.08); background: rgba(255,255,255,0.75); box-shadow: 0 10px 30px rgba(57,45,37,0.08); transition: 0.3s ease; cursor: pointer; text-align: left; }
            .tool-card:hover { box-shadow: 0 12px 36px rgba(57,45,37,0.12); transform: translateY(-2px); }
            .tool-card.active { background: linear-gradient(140deg, rgba(255, 221, 200, 0.9), rgba(210, 229, 219, 0.9)); border-color: rgba(70, 60, 52, 0.12); box-shadow: 0 16px 40px rgba(57,45,37,0.15); }
            .tool-card h3 { font-size: 16px; margin-bottom: 6px; color: #3b352e; }
            .tool-card p { font-size: 14px; color: #5b524a; }
            .calm-card { background: rgba(255,255,255,0.9); border-radius: 22px; padding: 20px; border: 1px solid rgba(70, 60, 52, 0.08); box-shadow: 0 18px 45px rgba(57,45,37,0.12); position: relative; overflow: hidden; }
            .calm-card.full { min-height: 480px; display: flex; align-items: center; justify-content: center; }
            .card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
            .eyebrow { text-transform: uppercase; letter-spacing: 1px; font-size: 12px; color: #7b736b; }
            .card-head h2 { font-size: 22px; color: #3b352e; margin: 4px 0; }
            .sub { color: #665c53; }
            .pill { background: rgba(103, 163, 146, 0.18); color: #315b4b; padding: 8px 12px; border-radius: 999px; font-size: 13px; white-space: nowrap; }
            .pattern-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px; }
            .pattern { border: 1px solid rgba(70,60,52,0.08); border-radius: 14px; background: rgba(255,255,255,0.8); padding: 12px; text-align: left; cursor: pointer; transition: 0.25s ease; color: #3b352e; }
            .pattern-active { background: linear-gradient(120deg, rgba(255, 221, 200, 0.85), rgba(201, 223, 214, 0.9)); border-color: rgba(70,60,52,0.14); box-shadow: 0 10px 28px rgba(57,45,37,0.12); }
            .pattern-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
            .pattern-desc { font-size: 13px; color: #6b625a; }
            .breath-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; align-items: center; }
            .breath-visual { background: linear-gradient(160deg, rgba(255,227,212,0.8), rgba(210,229,219,0.9)); border-radius: 20px; height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; }
            .pulse { width: 190px; height: 190px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(208,220,210,0.6)); box-shadow: 0 0 0 18px rgba(208, 220, 210, 0.25), 0 0 40px rgba(140, 167, 159, 0.25); transition: transform 0.8s ease; }
            .breath-time { position: absolute; top: 22px; font-size: 16px; color: #4a433d; }
            .breath-phase { position: absolute; bottom: 22px; font-weight: 700; letter-spacing: 0.4px; color: #3b352e; }
            .breath-controls { background: rgba(255,255,255,0.85); border-radius: 16px; padding: 16px; border: 1px solid rgba(70,60,52,0.08); }
            .input-label { font-size: 13px; color: #6b625a; margin-bottom: 6px; }
            input[type="range"] { width: 100%; accent-color: #90b4a0; }
            .range-value { font-size: 13px; color: #4a433d; margin-top: 4px; }
            .controls-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
            .soft-btn { padding: 12px 18px; border-radius: 14px; border: 1px solid rgba(70,60,52,0.1); background: rgba(245,239,232,0.85); color: #3b352e; cursor: pointer; transition: 0.25s ease; font-weight: 700; min-width: 120px; }
            .soft-btn:hover { box-shadow: 0 10px 26px rgba(57,45,37,0.12); transform: translateY(-1px); }
            .soft-btn.primary { background: linear-gradient(120deg, #ffd8b8, #cde3d6); border-color: transparent; }
            .progress-wrap { margin-top: 12px; }
            .progress-bar { width: 100%; height: 8px; background: rgba(70,60,52,0.08); border-radius: 999px; overflow: hidden; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #9cc6b3, #d7bfa0); border-radius: 999px; transition: width 0.3s ease; }
            .progress-label { font-size: 13px; color: #4a433d; margin-top: 6px; }
            .completion { margin-top: 10px; padding: 12px; border-radius: 12px; background: rgba(201, 223, 214, 0.35); color: #2f5143; font-weight: 600; }
            .timer-shell { position: relative; background: linear-gradient(150deg, rgba(255, 227, 212, 0.85), rgba(208, 220, 210, 0.9)); border-radius: 18px; padding: 40px 16px; text-align: center; overflow: hidden; margin-bottom: 16px; }
            .glow-circle { position: absolute; inset: 12px; border-radius: 18px; border: 1px solid rgba(70,60,52,0.08); box-shadow: 0 0 0 12px rgba(208, 220, 210, 0.25); animation: pulse 6s ease-in-out infinite; }
            .glow-circle.slow { animation-duration: 9s; }
            .timer-time { position: relative; font-size: 46px; font-weight: 800; color: #3b352e; letter-spacing: 1px; }
            .timer-phrase { position: relative; color: #524a43; margin-top: 10px; font-size: 15px; }
            .slider-row { margin: 12px 0; }
            .toggle { display: inline-flex; align-items: center; gap: 8px; color: #4a433d; font-size: 14px; }
            .toggle input { accent-color: #90b4a0; width: 18px; height: 18px; }
            .gentle-note { background: rgba(255, 227, 212, 0.55); border: 1px solid rgba(70,60,52,0.1); padding: 12px; border-radius: 12px; color: #4a433d; margin-bottom: 10px; }
            .grounding { width: 100%; text-align: center; padding: 10px; display: flex; flex-direction: column; gap: 18px; }
            .grounding-prompt { font-size: 18px; color: #3b352e; line-height: 1.5; max-width: 720px; margin: 0 auto; }
            .circle-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
            .tap-circle { width: 70px; height: 70px; border-radius: 50%; border: 1px dashed rgba(70,60,52,0.25); background: rgba(255,255,255,0.85); font-size: 20px; color: #3b352e; cursor: pointer; transition: 0.25s ease; }
            .tap-circle.filled { background: linear-gradient(130deg, #dbece3, #ffe7d5); border-style: solid; box-shadow: 0 10px 24px rgba(57,45,37,0.14); }
            .dots { display: flex; justify-content: center; gap: 6px; }
            .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(70,60,52,0.15); }
            .dot-active { background: #90b4a0; box-shadow: 0 0 0 6px rgba(144, 180, 160, 0.22); }
            .dot-done { background: #d7bfa0; }
            .grounding-final { text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; max-width: 520px; }
            .fade-in { animation: fadeIn 0.35s ease; }
            @media (max-width: 960px) { .card-head { flex-direction: column; } }
            @media (max-width: 720px) { .calm-shell { padding: 24px 16px 32px; } .breath-visual { height: 280px; } .pulse { width: 160px; height: 160px; box-shadow: 0 0 0 14px rgba(208,220,210,0.25); } }
          `}</style>

          <div className="calm-header">
            <h1>Calm space toolkit</h1>
            <p>I move between these tools at my own pace. Everything is soft, steady, and here when I need it.</p>
          </div>

          <div className="tool-grid">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`tool-card ${selectedTool === tool.id ? 'active' : ''}`}
                onClick={() => setSelectedTool(tool.id)}
              >
                <h3>{tool.title}</h3>
                <p>{tool.blurb}</p>
              </div>
            ))}
          </div>

          {selectedTool === 'breathing' && renderBreathing()}
          {selectedTool === 'meditation' && renderMeditation()}
          {selectedTool === 'walking' && renderWalking()}
          {selectedTool === 'grounding' && renderGrounding()}
        </div>
      </main>
    </div>
  );
}
