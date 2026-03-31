import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, Mic, MicOff, ShieldAlert, X, 
  AlertTriangle, LifeBuoy, Volume2, 
  HelpCircle, ChevronRight, PhoneCall
} from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { name: 'AASRA (24/7)', phone: '9820466627', specialty: 'Suicide Prevention & Crisis' },
  { name: 'Vandrevala (24/7)', phone: '18602662345', specialty: 'General Mental Health' },
  { name: 'iCall (TISS)', phone: '9152987821', specialty: 'Psychosocial Support' },
];

const DISTRESS_KEYWORDS = ['help', 'crisis', 'emergency', 'suicide', 'hurt', 'danger', 'sos', 'scared', 'pain', 'die'];

export default function EmergencySOS() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setTranscript(text);
        const matched = DISTRESS_KEYWORDS.some(kw => text.includes(kw));
        if (matched) {
          setIsMatch(true);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsMatch(false);
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="animate-bounce"
        style={{ 
          position: 'fixed', bottom: 32, right: 32, zIndex: 2000,
          width: 64, height: 64, borderRadius: '50%', background: '#EF4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)', border: 'none', cursor: 'pointer'
        }}
      >
        <ShieldAlert size={32} color="white" />
      </button>
    );
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 32 }}>
      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: 380, padding: 24, borderRadius: 24, background: 'rgba(255,255,255,0.95)', border: '2px solid #FCA5A5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#EF4444" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#2f2a28' }}>Emergency SOS</h2>
              <p style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Immediate help available 24/7</p>
            </div>
          </div>
          <button onClick={() => { setIsOpen(false); setIsMatch(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Voice Feature */}
        <div className="glass" style={{ padding: 20, textAlign: 'center', background: isMatch ? 'rgba(34,197,94,0.05)' : 'rgba(0,0,0,0.02)', border: isMatch ? '2px solid #22C55E' : '1px solid var(--border)', marginBottom: 24, transition: 'all 0.3s' }}>
          {isMatch ? (
            <div className="animate-fade-up">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#166534', marginBottom: 8 }}>
                <Volume2 size={20} />
                <strong style={{ fontSize: 14 }}>Distress Detected</strong>
              </div>
              <p style={{ fontSize: 12, color: '#15803d' }}>Matched: "{transcript}"</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{speechSupported ? 'Tap microphone and say "Help" or "Crisis"' : 'Voice not supported in this browser'}</p>
              {speechSupported && (
                <button 
                  onClick={toggleListening}
                  style={{ 
                    width: 56, height: 56, borderRadius: '50%', 
                    background: isListening ? '#EF4444' : 'var(--purple-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer', margin: '0 auto',
                    transition: 'all 0.2s',
                    boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none'
                  }}
                >
                  {isListening ? <MicOff size={24} color="white" /> : <Mic size={24} color="#2f2a28" />}
                </button>
              )}
            </>
          )}
        </div>

        {/* Contact List */}
        <div style={{ display: 'grid', gap: 12 }}>
          {EMERGENCY_CONTACTS.map((contact, i) => (
            <div 
              key={i} 
              className="glass" 
              style={{ 
                padding: 16, display: 'flex', alignItems: 'center', gap: 14,
                border: (isMatch && contact.name.includes('AASRA')) ? '1.5px solid #EF4444' : '1px solid var(--border)',
                background: (isMatch && contact.name.includes('AASRA')) ? 'rgba(239,68,68,0.03)' : 'var(--bg-card)'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {contact.name}
                  {isMatch && contact.name.includes('AASRA') && <LifeBuoy size={12} color="#EF4444" className="animate-pulse" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{contact.specialty}</div>
              </div>
              <a 
                href={`tel:${contact.phone}`} 
                style={{ 
                  width: 36, height: 36, borderRadius: 10, background: '#EF4444', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none', color: 'white'
                }}
              >
                <PhoneCall size={18} />
              </a>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 20 }}>
          Your safety is our priority. These helplines are anonymous and free.
        </p>
      </div>
    </div>
  );
}
