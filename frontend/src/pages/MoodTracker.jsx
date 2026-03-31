import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const MOODS = [
  { label: 'Good', emoji: '😊' },
  { label: 'Okay', emoji: '😐' },
  { label: 'Neutral', emoji: '😶' },
  { label: 'Not Great', emoji: '😕' },
  { label: 'Bad', emoji: '😢' },
];

const CHIPS = ['Stress', 'Overthinking', 'Tired', 'Lonely'];

export default function MoodTracker() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedChips, setSelectedChips] = useState([]);

  const toggleChip = (chip) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleContinue = () => {
    navigate('/chat');
  };

  return (
    <div className="page" style={{ paddingTop: '10vh' }}>
      <div className="animate-fade-up" style={{ textAlign: 'center', width: '100%', maxWidth: 600 }}>

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
            onClick={handleContinue}
          >
            Continue
          </button>

          <button
            className="btn btn-outline btn-lg"
            style={{ width: '100%', maxWidth: 400, padding: '14px 0', fontSize: 16, borderRadius: 100, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={18} /> Back to Dashboard
          </button>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            No login required<br />
            My response is anonymous
          </div>
        </div>

      </div>
    </div>
  );
}
