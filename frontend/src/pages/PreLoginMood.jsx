import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import EmergencySOS from '../components/EmergencySOS';

/**
 * High-Performance Scroll-based Image Sequence Background
 * Implements Lerp (Linear Interpolation) for fluid, video-like transitions.
 */
const ScrollEmotionBackground = () => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameCount = 75; 
  
  // Ref for mutable values to prevent React re-renders on every scroll/animation tick
  const stateRef = useRef({
    targetFrame: 1,
    currentFrame: 1,
    lastRenderedIndex: -1,
    isInitialLoaded: false
  });

  useEffect(() => {
    // 1. Preload 75 frames (ezgif-frame-001.png to ezgif-frame-075.png)
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `/frames/ezgif-frame-${paddedIndex}.png`;
        imagesRef.current.push(img);
    }

    const draw = (index) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const img = imagesRef.current[index - 1];
      
      // Ensure image is actually available for drawing
      if (!img || !img.complete) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);

      // Centered background-cover calculation
      const hRatio = window.innerWidth / img.width;
      const vRatio = window.innerHeight / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (window.innerWidth - img.width * ratio) / 2;
      const centerShift_y = (window.innerHeight - img.height * ratio) / 2;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
      
      stateRef.current.lastRenderedIndex = index;
    };

    const update = () => {
      const state = stateRef.current;
      
      // Smoothing (Lerp): Move current frame towards target frame (0.1 = 10% movement per tick)
      const diff = state.targetFrame - state.currentFrame;
      state.currentFrame += diff * 0.12; 

      const indexToDraw = Math.round(state.currentFrame);
      
      // Only re-draw if the rounded frame index actually changed to save performance
      if (indexToDraw !== state.lastRenderedIndex) {
        draw(indexToDraw);
      }

      requestAnimationFrame(update);
    };

    const handleScroll = () => {
      const html = document.documentElement;
      const maxScroll = html.scrollHeight - html.clientHeight;
      if (maxScroll <= 0) return;
      
      const scrollFraction = html.scrollTop / maxScroll;
      
      // Update the "Target" where the animation should head
      stateRef.current.targetFrame = Math.min(
        frameCount,
        Math.max(1, Math.floor(scrollFraction * (frameCount - 1)) + 1)
      );
    };

    const loop = requestAnimationFrame(update);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Quick starter draw
    const initCheck = setTimeout(() => handleScroll(), 500);

    return () => {
      cancelAnimationFrame(loop);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(initCheck);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'var(--bg-primary)'
      }}
    />
  );
};


export default function PreLoginMood() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ 
      justifyContent: 'flex-start', paddingTop: 0, position: 'relative', 
      overflowX: 'hidden', minHeight: '230vh' 
    }}>
      {/* High-Fluidity Background Sequence */}
      <ScrollEmotionBackground />

      <nav className="landing-nav animate-fade-up" style={{ position: 'relative', zIndex: 10 }}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary-pulse), var(--secondary-pulse))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,255,255,0.4)' }}>
            <Heart size={18} color="white" />
          </div>
          <span style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>Manobhandhu AI</span>
        </div>
        <div className="links" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
          <a href="#about">About</a>
          <a href="#support">Support</a>
          <button className="btn-outline" onClick={() => navigate('/volunteer-login')} style={{ cursor: 'pointer', borderRadius: '100px' }}>
            Volunteer Login
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '16vh', maxWidth: 800, position: 'relative', zIndex: 1 }} className="animate-fade-up delay-100">
        <h1 style={{ 
          fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, marginBottom: 24, 
          letterSpacing: '-1px', lineHeight: 1.1, color: 'var(--text-primary)', 
          fontFamily: 'Plus Jakarta Sans',
          textShadow: '0 0 40px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <span style={{ color: 'var(--primary-pulse)', filter: 'brightness(0.85)' }}>A safe space to express</span><br />
          <span style={{ color: 'var(--text-primary)' }}>how I feel</span>
        </h1>

        <p style={{ 
          color: 'var(--text-secondary)', fontSize: 'clamp(17px, 2vw, 22px)', 
          marginBottom: 56, fontWeight: 600, maxWidth: 640,
          textShadow: '0 0 20px rgba(255,255,255,1), 0 1px 2px rgba(0,0,0,0.1)',
          lineHeight: 1.5
        }}>
          No judgment. No pressure. Just start.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ padding: '16px 48px', fontSize: 18, borderRadius: 100, transition: 'all 0.3s', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Begin Anonymously
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ fontSize: 14 }}>🔒</span> No registration or email required
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }} className="animate-fade-up delay-200">
          <button
            className="chip"
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/mood')}
          >
            <span style={{ fontSize: 18 }}>🧠</span> Check how I feel
          </button>

          <button
            className="chip"
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/chat')}
          >
            <span style={{ fontSize: 18 }}>💬</span> Just talk
          </button>

          <button
            className="chip"
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/stress-relief')}
          >
            <span style={{ fontSize: 18 }}>🌿</span> Try a small activity
          </button>
        </div>
      </div>

      <div style={{ marginTop: 160, textAlign: 'center', width: '100%', maxWidth: 1000, position: 'relative', zIndex: 1 }} className="animate-fade-up delay-300">
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: 13, color: 'var(--primary-pulse)', marginBottom: 12, fontWeight: 800, textShadow: '0 0 15px rgba(255,255,255,1)' }}>How it works</h4>
        <h2 style={{ fontSize: 32, color: 'var(--text-primary)', marginBottom: 48, fontWeight: 800, textShadow: '0 0 20px rgba(255,255,255,0.8)' }}>3 Simple Steps</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, padding: '0 20px' }}>
          <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🥺</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Express it</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Share what is on my mind. Someone listens.</p>
          </div>
          <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Talk freely</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chat anonymously at my pace.</p>
          </div>
          <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Feel lighter</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Try small activities and keep what helps.</p>
          </div>
        </div>
      </div>

      <section id="about" style={{ marginTop: 160, textAlign: 'left', width: '100%', maxWidth: 800, margin: '160px auto 0', position: 'relative', zIndex: 1 }} className="animate-fade-up">
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: 12, color: 'var(--primary-pulse)', marginBottom: 8, fontWeight: 800 }}>Our Vision</h4>
        <h2 style={{ fontSize: 32, color: 'var(--text-primary)', marginBottom: 24, fontWeight: 800 }}>About Manobhandhu AI</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6, marginBottom: 32 }}>
          Manobhandhu AI is more than just a platform; it is a safe sanctuary. We believe that everyone deserves a bridge between silent struggle and supportive listening. Our AI-augmented sanctuary ensures that you are never truly alone, providing a judgment-free space to express, heal, and move forward at your own pace.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
            <h4 style={{ color: 'var(--primary-pulse)', marginBottom: 8, fontWeight: 700 }}>Privacy First</h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Full anonymity by default. We don't track your identity, only your progress toward well-being.</p>
          </div>
          <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
            <h4 style={{ color: 'var(--primary-pulse)', marginBottom: 8, fontWeight: 700 }}>Human-in-the-Loop</h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>AI provides the immediate listening, but verified human volunteers are always there for a real connection.</p>
          </div>
        </div>
      </section>

      <section id="support" style={{ marginTop: 160, textAlign: 'center', width: '100%', maxWidth: 1000, margin: '160px auto 0', padding: '0 20px', position: 'relative', zIndex: 1 }} className="animate-fade-up">
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: 12, color: 'var(--primary-pulse)', marginBottom: 8, fontWeight: 800 }}>Get Assistance</h4>
        <h2 style={{ fontSize: 32, color: 'var(--text-primary)', marginBottom: 40, fontWeight: 800 }}>Help & Support</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📧</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Write to Us</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>Have questions or specialized needs? Our team is here.</p>
            <a href="mailto:support@manobhandhu.ai" style={{ color: 'var(--primary-pulse)', fontWeight: 700, textDecoration: 'none' }}>support@manobhandhu.ai</a>
          </div>
          <div className="glass" style={{ padding: 32, borderRadius: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🛡️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Safety Center</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>Learn about our reporting tools and community guidelines.</p>
            <button className="btn-outline" style={{ border: '1px solid var(--primary-pulse)', padding: '8px 20px', borderRadius: 100 }}>View Guidelines</button>
          </div>
          <div className="glass" style={{ padding: 32, borderRadius: 24, border: '1px solid rgba(255, 107, 107, 0.2)' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🚨</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#FF6B6B' }}>Emergency</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>If you are in immediate danger, please use our SOS tool.</p>
            <button className="btn" style={{ background: '#FF6B6B', color: 'white', padding: '8px 20px', borderRadius: 100 }}>Get Help Now</button>
          </div>
        </div>
      </section>

      {/* Spacing to provide enough scroll depth for the sequence */}
      <div style={{ height: '40vh' }} /> 
      
      <EmergencySOS />
    </div>
  );
}
