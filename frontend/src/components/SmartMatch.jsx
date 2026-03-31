import React, { useState } from 'react';
import { 
  Heart, ArrowRight, Phone, Globe, ExternalLink, 
  X, ChevronLeft, Sparkles, MessageCircle, AlertCircle,
  Clock, ShieldCheck
} from 'lucide-react';

const RECOMMENDATIONS = [
  { name: 'AASRA', description: 'Crisis intervention for people in emotional distress', phone: '9820466627', website: 'http://www.aasra.info', tags: ['Suicide Prevention', 'Crisis'], isHelpline: true, available24x7: true },
  { name: 'Vandrevala Foundation', description: 'Mental health support and counseling service', phone: '1860-2662-345', website: 'https://vandrevalafoundation.com', tags: ['Counseling', 'Crisis'], isHelpline: true, available24x7: true },
  { name: 'iCall (TISS)', description: 'Psychosocial helpline for people in distress', phone: '9152987821', website: 'https://icallhelpline.org', tags: ['Psychological', 'Counseling'], isHelpline: true, available24x7: false },
  { name: 'Fortis Helpline', description: 'National helpline for mental health', phone: '8376804102', website: 'https://fortishealthcare.com', tags: ['General'], isHelpline: true, available24x7: true },
  { name: 'Sumaitri', description: 'Voluntary organization for suicide prevention', phone: '011-23389090', website: 'http://sumaitri.net', tags: ['Crisis Help'], isHelpline: true, available24x7: false },
];

export default function SmartMatch() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ feeling: '', urgency: '', type: '' });
  const [result, setResult] = useState(null);

  const reset = () => {
    setStep(1);
    setAnswers({ feeling: '', urgency: '', type: '' });
    setResult(null);
  };

  const handleNext = (field, value) => {
    const updatedAnswers = { ...answers, [field]: value };
    setAnswers(updatedAnswers);
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      calculateMatch(updatedAnswers);
      setStep(4);
    }
  };

  const calculateMatch = (finalAnswers) => {
    let bestMatch = null;
    let others = [];
    let reason = "Based on your current feelings and need for support.";

    if (finalAnswers.feeling === 'Crisis' || finalAnswers.urgency === 'Urgent help') {
      bestMatch = RECOMMENDATIONS.find(n => n.name === 'AASRA');
      others = RECOMMENDATIONS.filter(n => n.name === 'Vandrevala Foundation' || n.name === 'Sumaitri');
      reason = "We've matched you with AASRA for immediate crisis intervention.";
    } else if (finalAnswers.feeling === 'Stress') {
      bestMatch = RECOMMENDATIONS.find(n => n.name === 'iCall (TISS)');
      others = RECOMMENDATIONS.filter(n => n.name === 'Fortis Helpline' || n.name === 'Vandrevala Foundation');
      reason = "iCall (TISS) is specialized in psychosocial support for stress relief.";
    } else if (finalAnswers.feeling === 'Loneliness') {
      bestMatch = RECOMMENDATIONS.find(n => n.name === 'Vandrevala Foundation');
      others = RECOMMENDATIONS.filter(n => n.name === 'iCall (TISS)' || n.name === 'Sumaitri');
      reason = "They provide extensive counseling for emotional loneliness.";
    } else {
      bestMatch = RECOMMENDATIONS.find(n => n.name === 'Fortis Helpline');
      others = RECOMMENDATIONS.filter(n => n.name === 'iCall (TISS)' || n.name === 'AASRA');
    }

    setResult({ best: bestMatch, others, reason });
  };

  return (
    <>
      {/* Trigger Section */}
      <div className="glass" style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#3B82F6" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Not sure who to reach out to?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Let us match you with the right support organization.</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
          Get Help Recommendation <ArrowRight size={16} />
        </button>
      </div>

      {/* Modal Flow */}
      {isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 24, position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            {step <= 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                   {step > 1 && <button onClick={() => setStep(step-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><ChevronLeft size={16} /> Back</button>}
                   <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                     <div style={{ width: `${(step/3)*100}%`, height: '100%', background: 'var(--purple-primary)', borderRadius: 2, transition: 'width 0.3s' }} />
                   </div>
                   <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Step {step} of 3</span>
                </div>

                {step === 1 && (
                  <div className="animate-fade-up">
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>How are you feeling?</h2>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {['Stress', 'Anxiety', 'Loneliness', 'Crisis'].map(f => (
                        <button key={f} onClick={() => handleNext('feeling', f)} className="btn-chip" style={{ justifyContent: 'flex-start', padding: '16px 20px' }}>{f}</button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-up">
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>How urgent is it?</h2>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {['Just exploring', 'Need someone to talk', 'Urgent help'].map(u => (
                        <button key={u} onClick={() => handleNext('urgency', u)} className="btn-chip" style={{ justifyContent: 'flex-start', padding: '16px 20px' }}>{u}</button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-up">
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Preferred support type?</h2>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {['Call', 'Chat', 'Any'].map(t => (
                        <button key={t} onClick={() => handleNext('type', t)} className="btn-chip" style={{ justifyContent: 'flex-start', padding: '16px 20px' }}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && result && (
              <div className="animate-fade-up" style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={32} color="#22C55E" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Best match for you</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{result.reason}</p>

                {/* Match Card */}
                <div className="glass" style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px solid var(--purple-primary)', padding: 24, textAlign: 'left', marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={18} color="#EF4444" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{result.best.name}</h3>
                      <div className="badge badge-green" style={{ fontSize: 10 }}>24/7 Available</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>{result.best.description}</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a href={`tel:${result.best.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, textDecoration: 'none' }}>Call Now</a>
                    <a href={result.best.website} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>Visit Site</a>
                  </div>
                </div>

                {/* Alternatives */}
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Other options</h4>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {result.others.map((alt, i) => (
                      <div key={i} className="glass" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Building2 size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: 13, fontWeight: 700 }}>{alt.name}</div>
                        </div>
                        <a href={alt.website} target="_blank" rel="noreferrer" style={{ color: 'var(--purple-primary)' }}><ExternalLink size={16} /></a>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={reset} className="btn btn-link" style={{ marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>Start again</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Helper for the icon in alternative
function Building2({ size }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  );
}
