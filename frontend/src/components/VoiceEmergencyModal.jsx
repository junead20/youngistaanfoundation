import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, PhoneCall, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const RISK_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'die', 'harm', 'hurt', 
  'emergency', 'crisis', 'help me', 'pain', 'killing', 'dead',
  'suffering', 'cant go on', 'goodbye', 'hurting',
  // Hindi Keywords
  'bachao', 'marna hai', 'khatra', 'chot', 'dard', 'khudkushi',
  'jaan de dunga', 'marne ja raha', 'zindagi khatam'
];

export default function VoiceEmergencyModal({ isOpen, onClose }) {
  const { emergencyGuestLogin } = useApp();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [riskDetected, setRiskDetected] = useState(false);
  const [error, setError] = useState('');
  const [connectionTimer, setConnectionTimer] = useState(30);
  const [showAutoEscalation, setShowAutoEscalation] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    let interval;
    if (riskDetected && connectionTimer > 0) {
      interval = setInterval(() => {
        setConnectionTimer(prev => prev - 1);
      }, 1000);
    } else if (connectionTimer === 0) {
      setShowAutoEscalation(true);
    }
    return () => clearInterval(interval);
  }, [riskDetected, connectionTimer]);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable it in your browser settings.');
        } else {
          setError('An error occurred during voice analysis.');
        }
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript.toLowerCase());
        
        // Real-time risk detection
        const hasRisk = RISK_KEYWORDS.some(keyword => 
          currentTranscript.toLowerCase().includes(keyword)
        );
        if (hasRisk) {
          setRiskDetected(true);
          // Don't stop listening immediately, let them finish
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      setError('Could not start voice analysis.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (riskDetected) {
      speakCalmingMessage();
    }
  }, [riskDetected]);

  const speakCalmingMessage = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = "I hear you. You are not alone. I am connecting you to a mentor now for immediate support. Please stay with me.";
      msg.rate = 0.9;
      msg.pitch = 1.1;
      window.speechSynthesis.speak(msg);
    }
  };

  const handleConnectToMentor = () => {
    stopListening();
    emergencyGuestLogin(transcript);
    navigate('/mentor-chat');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(21, 18, 16, 0.85)', backdropFilter: 'blur(8px)',
      padding: 20
    }}>
      <div className={`glass animate-bounce-in ${riskDetected ? 'animate-shake' : ''}`} style={{
        width: '100%', maxWidth: 460, padding: 32, borderRadius: 32,
        position: 'relative', overflow: 'hidden',
        border: riskDetected ? '2.5px solid #EF4444' : '1px solid var(--border)',
        boxShadow: riskDetected ? '0 0 40px rgba(239, 68, 68, 0.25)' : 'var(--shadow-card)'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: 24, top: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {riskDetected ? (
            <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', marginBottom: 20 }} className="animate-pulse">
              <ShieldAlert size={40} color="#EF4444" />
            </div>
          ) : (
            <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: isListening ? 'rgba(156, 198, 179, 0.1)' : 'rgba(0,0,0,0.05)', marginBottom: 20 }}>
              {isListening ? (
                <div className="voice-wave" style={{ height: 40 }}>
                   <div className="voice-bar" />
                   <div className="voice-bar" />
                   <div className="voice-bar" />
                   <div className="voice-bar" />
                   <div className="voice-bar" />
                </div>
              ) : <MicOff size={40} color="var(--text-muted)" />}
            </div>
          )}
          
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: riskDetected ? '#EF4444' : 'var(--text-primary)' }}>
            {riskDetected ? "EMERGENCY DETECTED" : "Listening for you..."}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
            {riskDetected 
              ? "We've detected high-risk indicators in your voice. Your safety is our priority. Please connect with a mentor immediately."
              : "Speak naturally. I'm here to listen and help if you're in a crisis."}
          </p>
        </div>

        {error ? (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#FCA5A5', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>
            <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {error}
          </div>
        ) : (
          <div style={{ 
            height: 100, background: 'rgba(0,0,0,0.1)', borderRadius: 16, 
            padding: 16, marginBottom: 24, overflowY: 'auto',
            border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-secondary)',
            fontStyle: 'italic', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {transcript || (isListening ? "(Waiting for speech...)" : "Ready to listen")}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {riskDetected ? (
            <>
              <button 
                className="btn btn-primary" 
                style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)', color: 'white', padding: '16px 0', fontSize: 16 }}
                onClick={handleConnectToMentor}
              >
                <PhoneCall size={18} /> Connect to Mentor Now
              </button>
              
              <div style={{ marginTop: 8, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', textAlign: 'center' }}>
                  {showAutoEscalation ? "⚠️ IMMEDIATE PROFESSIONAL BACKUP" : `Professional Helplines (ETA: ${connectionTimer}s)`}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a href="tel:9999666555" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', background: showAutoEscalation ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 10, border: showAutoEscalation ? '1px solid #EF4444' : '1px solid transparent' }} className={showAutoEscalation ? 'animate-pulse' : ''}>
                    <span>Vandrevala Foundation</span>
                    <span style={{ color: '#EF4444', fontWeight: 700 }}>9999 666 555</span>
                  </a>
                  <a href="tel:9820466726" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13, padding: '8px 12px', background: showAutoEscalation ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 10, border: showAutoEscalation ? '1px solid #EF4444' : '1px solid transparent' }} className={showAutoEscalation ? 'animate-pulse' : ''}>
                    <span>AASRA</span>
                    <span style={{ color: '#EF4444', fontWeight: 700 }}>9820 466 726</span>
                  </a>
                </div>
                {showAutoEscalation && (
                  <p style={{ fontSize: 11, color: '#FCA5A5', marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>
                    Mentors are currently busy. Please call a helpline for immediate care.
                  </p>
                )}
              </div>
            </>
          ) : (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '14px 0' }}
              onClick={isListening ? stopListening : startListening}
            >
              {isListening ? "Stop Listening" : "Try Again"}
            </button>
          )}
          
          <button 
            className="btn btn-secondary" 
            style={{ padding: '14px 0', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 13 }}
            onClick={onClose}
          >
            I'm okay, just looking around
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
           <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
           <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>LOCAL PRIVACY PROTECTED — NO DATA RECORDED</span>
        </div>
      </div>
    </div>
  );
}
