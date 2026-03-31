import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wind } from 'lucide-react';

export default function BreatheZone() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [timer, setTimer] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            setCycles(c => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const circleScale = phase === 'Inhale' ? 1.8 : phase === 'Hold' ? 1.8 : 1;
  const circleColor = phase === 'Inhale' ? 'var(--palette-mint)' : phase === 'Hold' ? 'var(--palette-lavender)' : 'var(--palette-sky)';

  return (
    <div className="flex-center h-screen" style={{ background: '#0a0a0a', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background ambient gradient that shifts */}
      <motion.div 
         animate={{ background: `radial-gradient(circle at 50% 50%, ${circleColor}33 0%, transparent 60%)` }}
         transition={{ duration: 2 }}
         style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      <button className="btn-back" style={{ position: 'absolute', top: 32, left: 32, color: '#fff', zIndex: 10 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Leave Zone
      </button>

      <div style={{ zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <h1 style={{ fontSize: 32, fontWeight: 300, marginBottom: 80, letterSpacing: 2 }}>{phase}</h1>
         
         <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
               animate={{ scale: circleScale, backgroundColor: circleColor }}
               transition={{ duration: phase === 'Inhale' ? 4 : phase === 'Exhale' ? 8 : 0.5, ease: 'easeInOut' }}
               style={{ 
                  width: 150, height: 150, borderRadius: '50%', 
                  position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 60px ${circleColor}`
               }}
            />
            <div style={{ fontSize: 48, fontWeight: 700, zIndex: 2, mixBlendMode: 'overlay', color: '#000' }}>
               {timer}
            </div>
         </div>

         <div style={{ marginTop: 100, fontSize: 14, opacity: 0.6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wind size={18} /> {cycles > 0 ? `Completed ${cycles} full cycles.` : "4-7-8 Breathing Technique"}
         </div>
      </div>
    </div>
  );
}
