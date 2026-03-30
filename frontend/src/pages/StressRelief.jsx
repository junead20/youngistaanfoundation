import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Wind, Play, Pause, RotateCcw, Info } from 'lucide-react';

const STAGES = [
  { name: 'Inhale', duration: 4, color: '#dadaff' },
  { name: 'Hold', duration: 4, color: '#d1f2ff' },
  { name: 'Exhale', duration: 4, color: '#ffc6e9' },
  { name: 'Hold', duration: 4, color: '#ffe5a0' },
];

export default function StressRelief() {
  const [isActive, setIsActive] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STAGES[0].duration);
  const [totalCycles, setTotalCycles] = useState(0);

  useEffect(() => {
    let timer;
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const nextIndex = (stageIndex + 1) % STAGES.length;
            if (nextIndex === 0) setTotalCycles(c => c + 1);
            setStageIndex(nextIndex);
            return STAGES[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, stageIndex]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setStageIndex(0);
    setTimeLeft(STAGES[0].duration);
    setTotalCycles(0);
  };

  const progress = ((STAGES[stageIndex].duration - timeLeft) / STAGES[stageIndex].duration) * 100;
  const currentStage = STAGES[stageIndex];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: 40 }}>
          <h1 className="section-title">
            <Wind size={22} style={{ display: 'inline', marginRight: 10, color: 'var(--teal-primary)' }} />
            Stress Relief Tools
          </h1>
          <p className="section-subtitle">Interactive exercises to calm your mind and body.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: 500, padding: 40, textAlign: 'center', borderRadius: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Box Breathing</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 40 }}>
              The 4-4-4-4 technique used by elite professionals to stay calm under pressure.
            </p>

            {/* Breathing Ring */}
            <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="260" height="260">
                <circle
                  cx="130" cy="130" r="110"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="12"
                />
                <circle
                  cx="130" cy="130" r="110"
                  fill="transparent"
                  stroke={currentStage.color}
                  strokeWidth="12"
                  strokeDasharray="691"
                  strokeDashoffset={691 - (691 * progress) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
                />
              </svg>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: currentStage.color, transition: 'color 0.3s' }}>
                  {currentStage.name}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
              <button className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`} style={{ width: 140 }} onClick={toggleTimer}>
                {isActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
              </button>
              <button className="btn btn-secondary" onClick={resetTimer}>
                <RotateCcw size={18} />
              </button>
            </div>

            <div style={{ padding: '12px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cycles Completed:</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal-light)' }}>{totalCycles}</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="glass" style={{ marginTop: 40, padding: 32, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
           <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(209,242,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Info size={22} color="var(--teal-light)" />
           </div>
           <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>How it works</h3>
              <ul style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 16 }}>
                 <li><strong>Inhale</strong> slowly for 4 seconds through your nose.</li>
                 <li><strong>Hold</strong> your breath for 4 seconds, feeling the air in your lungs.</li>
                 <li><strong>Exhale</strong> completely for 4 seconds, releasing all tension.</li>
                 <li><strong>Hold</strong> your lungs empty for 4 seconds before the next breath.</li>
                 <li>Repeat for 3-5 cycles to significantly reduce cortisol and calm the nervous system.</li>
              </ul>
           </div>
        </div>
      </main>
    </div>
  );
}
