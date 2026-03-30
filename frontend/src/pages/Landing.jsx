import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, ShieldCheck, HelpCircle, Info, Umbrella, Users, Star, Sparkles } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const infoRef = useRef(null);

  const scrollToInfo = () => {
    infoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container" style={{ position: 'relative', overflowX: 'hidden' }}>
      <nav className="nav-v2">
        <div className="nav-logo">
          <Heart size={32} fill="var(--primary)" color="var(--primary)" />
          <span>YuvaPulse</span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={scrollToInfo}>About</button>
          <button className="nav-link" onClick={() => navigate('/activities')}>Fun Activities</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/volunteer/login')}>
            Volunteer Portal
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-v2">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
        >
          <div className="hero-badge">
            <ShieldCheck size={14} />
            <span>100% Anonymous First-Touch</span>
          </div>
          
          <h1 className="hero-headline">
            A Safe Space to Express <br /> How You Feel
          </h1>
          
          <p className="hero-subtext" style={{ maxWidth: 700, margin: '0 auto 48px' }}>
            A mental wellbeing companion for children and teens. No judgment. No pressure. 
            Just a space to be you, starting with how you feel today.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/mood-check')}>
              Start with how you feel <ArrowRight size={20} style={{ marginLeft: 12 }} />
            </button>
            <button className="btn btn-secondary btn-lg" style={{ border: 'none' }} onClick={scrollToInfo}>
              <HelpCircle size={18} style={{ marginRight: 8 }} /> Learn more
            </button>
          </div>

          <div style={{ marginTop: 40 }}>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/activities')}>
              <Sparkles size={18} style={{ marginRight: 8 }} /> Explore Fun Activities
            </button>
          </div>

          <div style={{ marginTop: 48, opacity: 0.6, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> No login required</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Umbrella size={14} /> Private session</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> 14K+ Volunteers</span>
          </div>
        </motion.div>
      </section>

      {/* INFO SECTIONS */}
      <div ref={infoRef} className="landing-content" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="volunteer-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            <motion.div 
               className="card"
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
            >
              <h3 className="card-title" style={{ marginBottom: 20 }}>
                <Info size={24} style={{ marginRight: 12, verticalAlign: 'middle' }} /> About Youngistaan
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Youngistaan Foundation is a 14,000+ volunteer-led NGO in India, committed to creating 
                sustainable change. YuvaPulse is our dedicated safe-space platform, bringing mental 
                health support and wellbeing intelligence directly to those who need it most.
              </p>
            </motion.div>

            <motion.div 
               className="card"
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
            >
              <h3 className="card-title" style={{ marginBottom: 20 }}>
                <Star size={24} style={{ marginRight: 12, verticalAlign: 'middle' }} /> Wellbeing Journey
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Mental health isn't a destination; it's a process. At YuvaPulse, we replace clinical 
                jargon like "therapy" with "feeling low?" or "need to talk?". We believe that teens 
                don't reject help—they reject how help is delivered.
              </p>
            </motion.div>
          </div>

          <motion.div 
             className="card" 
             style={{ marginTop: 40, textAlign: 'center', background: 'var(--bg-glass)', border: '1px solid var(--border-active)' }}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
          >
             <h2 style={{ marginBottom: 16 }}>How It Works</h2>
             <p style={{ maxWidth: 800, margin: '0 auto', color: 'var(--text-secondary)' }}>
                Start anonymously with a quick mood check-in. Explore fun activities anytime. 
                When you're ready, create an account to chat with Milo (our AI companion), 
                join communities with others who share your interests, and connect with real volunteers.
             </p>
          </motion.div>
        </div>
      </div>

      <footer className="footer-v2">
        <div style={{ opacity: 0.5 }}>© 2026 Youngistaan Foundation. Empowering 14K+ Volunteers.</div>
        <div className="footer-links" style={{ fontSize: 14 }}>
          <span className="nav-link" style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span className="nav-link" style={{ cursor: 'pointer' }}>Contact Us</span>
        </div>
      </footer>
    </div>
  );
}
