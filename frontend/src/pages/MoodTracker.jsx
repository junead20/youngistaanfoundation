import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const MOODS = [
  { label: 'Good', emoji: '😊', score: 2 },
  { label: 'Okay', emoji: '😐', score: 4 },
  { label: 'Neutral', emoji: '😶', score: 5 },
  { label: 'Not Great', emoji: '😕', score: 7 },
  { label: 'Bad', emoji: '😢', score: 9 },
];

const CHIPS = ['Stress', 'Overthinking', 'Tired', 'Lonely'];

const QUESTIONS = [
  { id: 'sleep', text: 'How well did you sleep last night?', options: [{label:'Great', val:1}, {label:'Okay', val:3}, {label:'Poorly', val:5}] },
  { id: 'energy', text: 'How is your energy level right now?', options: [{label:'High', val:1}, {label:'Medium', val:3}, {label:'Low', val:5}] },
  { id: 'anxiety', text: 'Have you felt anxious or on edge lately?', options: [{label:'Not really', val:1}, {label:'Sometimes', val:3}, {label:'Yes, a lot', val:5}] }
];

export default function MoodTracker() {
  const navigate = useNavigate();
  const { saveMood } = useApp();
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedChips, setSelectedChips] = useState([]);
  const [answers, setAnswers] = useState({});

  const toggleChip = (chip) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleFinish = () => {
    const moodObj = MOODS.find(m => m.label === selectedMood);
    
    // Calculate an aggregate stress score across the new questions if needed
    const qScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    // Base stress from mood (2 to 9) + a little bump if questionnaire was bad
    let finalStress = moodObj.score + (qScore >= 12 ? 2 : qScore >= 9 ? 1 : 0);
    if (finalStress > 10) finalStress = 10;

    // Save complex session context
    saveMood({
      label: selectedMood,
      emoji: moodObj.emoji,
      stressLevel: finalStress,
      causes: selectedChips,
      questionnaire: answers
    });
    
    navigate('/chat');
  };

  return (
    <div className="page" style={{ paddingTop: '10vh' }}>
      <div className="animate-fade-up" style={{ textAlign: 'center', width: '100%', maxWidth: 600 }}>

        {step === 1 && (
          <>
            <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
              How am I feeling today?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40 }}>
              I just pick what feels closest
            </p>

            <div className="glass" style={{ padding: '40px 24px', borderRadius: 24, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                {MOODS.slice(0, 4).map(mood => (
                  <button
                    key={mood.label}
                    className={`emotion-card ${selectedMood === mood.label ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(mood.label)}
                    style={{ width: 100, padding: '24px 0' }}
                  >
                    <span className="emoji">{mood.emoji}</span>
                    <span className="label" style={{ color: selectedMood === mood.label ? 'var(--purple-primary)' : 'var(--text-secondary)' }}>
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                {MOODS.slice(4).map(mood => (
                  <button
                    key={mood.label}
                    className={`emotion-card ${selectedMood === mood.label ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(mood.label)}
                    style={{ width: 100, padding: '24px 0' }}
                  >
                    <span className="emoji">{mood.emoji}</span>
                    <span className="label" style={{ color: selectedMood === mood.label ? 'var(--purple-primary)' : 'var(--text-secondary)' }}>
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Anything specific? (optional)</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                {CHIPS.map(chip => (
                  <button
                    key={chip}
                    className={`chip ${selectedChips.includes(chip) ? 'selected' : ''}`}
                    onClick={() => toggleChip(chip)}
                    style={{ padding: '10px 24px', fontSize: 14, borderRadius: 100, background: '#FFFFFF' }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', maxWidth: 400, opacity: selectedMood ? 1 : 0.5, padding: '16px 0', fontSize: 18, borderRadius: 100, background: 'linear-gradient(135deg, #ffd8b8, #cde3d6)', color: '#2f2a28', boxShadow: 'none' }}
                disabled={!selectedMood}
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
              Just a few more details
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 40 }}>
              This helps us understand you better.
            </p>

            <div className="glass" style={{ padding: '32px 24px', borderRadius: 24, marginBottom: 32, textAlign: 'left' }}>
              {QUESTIONS.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: idx === QUESTIONS.length - 1 ? 0 : 32 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>{idx + 1}. {q.text}</p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {q.options.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                        className="chip"
                        style={{
                          padding: '10px 20px', 
                          borderRadius: 100, 
                          border: answers[q.id] === opt.val ? '2px solid #10B981' : '1px solid var(--border)',
                          background: answers[q.id] === opt.val ? 'rgba(16,185,129,0.1)' : '#FFFFFF',
                          color: answers[q.id] === opt.val ? '#10B981' : 'var(--text-secondary)',
                          fontWeight: answers[q.id] === opt.val ? 700 : 500
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                className="btn-outline"
                style={{ width: '100%', maxWidth: 180, padding: '16px 0', fontSize: 16, borderRadius: 100 }}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                style={{ width: '100%', maxWidth: 220, opacity: Object.keys(answers).length === 3 ? 1 : 0.5, padding: '16px 0', fontSize: 16, borderRadius: 100, background: 'linear-gradient(135deg, #ffd8b8, #cde3d6)', color: '#2f2a28', boxShadow: 'none' }}
                disabled={Object.keys(answers).length < 3}
                onClick={handleFinish}
              >
                Start Chatting
              </button>
            </div>
            
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.5 }}>
              No login required<br />
              My response is anonymous
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
