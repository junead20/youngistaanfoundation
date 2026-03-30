import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, MessageCircle, Users, MapPin,
  TrendingUp, Shield, ArrowRight, Sparkles,
  Heart, Brain, BarChart3, Globe
} from 'lucide-react';

const features = [
  {
    icon: <LayoutDashboard size={24} />,
    title: 'Age-Segmented Dashboards',
    desc: 'Separate wellbeing dashboards for Children (6-12) and Teens (13-19) with tailored metrics.'
  },
  {
    icon: <MessageCircle size={24} />,
    title: 'Milo Companion',
    desc: 'Friendly, non-judgmental companion that listens first and offers 1 small thing to try.'
  },
  {
    icon: <Shield size={24} />,
    title: 'Wellbeing Journey',
    desc: 'Understand how youth are doing over time through anonymous check-ins.'
  },
  {
    icon: <Users size={24} />,
    title: 'Volunteer Intelligence',
    desc: 'Convert volunteer observations into structured behavioral risk indicators instantly.'
  },
  {
    icon: <Brain size={24} />,
    title: 'Smart Insights Engine',
    desc: 'AI-powered insights correlating mood with learning engagement across programs.'
  },
  {
    icon: <MapPin size={24} />,
    title: 'Geographic Analytics',
    desc: 'Compare wellbeing data across Hyderabad, Bangalore, Delhi, Mumbai, and Chennai.'
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Impact Measurement',
    desc: 'Before vs after workshop metrics proving measurable impact for donors.'
  },
  {
    icon: <Heart size={24} />,
    title: 'Communities & Activities',
    desc: 'Connect teens with shared interests and provide quick, engaging self-care activities.'
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Offline Session Sync',
    desc: 'Volunteers seamlessly transition offline session activities into digital insights.'
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' }
  })
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="landing-nav-logo-icon">💚</div>
          <h3>YuvaPulse</h3>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/milo')}>
            <MessageCircle size={14} /> Talk to Milo
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={14} /> Admin / Volunteer View
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <motion.div
          className="landing-hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="landing-badge">
            <Sparkles size={14} />
            Designed for Youngistaan Foundation
          </div>
          <h1>Youth Wellbeing Intelligence Dashboard</h1>
          <p>
            A mental health intelligence platform that converts volunteer observations
            and youth interactions into real-time, actionable insights across all
            Youngistaan programs.
          </p>
          <div className="landing-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Open Dashboard <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/milo')}>
              <MessageCircle size={18} /> Meet Milo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="landing-stats-grid">
          {[
            { value: '50K+', label: 'Volunteers' },
            { value: '3', label: 'Programs' },
            { value: '5', label: 'Cities' },
            { value: '24/7', label: 'Monitoring' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2>Powerful Features for Youth Wellbeing</h2>
        <p>Everything you need to track, analyze, and improve youth mental health across programs</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flow diagram */}
      <section className="landing-stats" style={{ background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>How It Works</h2>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 40, fontSize: 16 }}>
            From data collection to actionable insights in real-time
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, flexWrap: 'wrap'
          }}>
            {[
              { icon: <Users size={24} />, label: 'Volunteers Observe' },
              { icon: <ArrowRight size={20} />, label: '' },
              { icon: <Globe size={24} />, label: 'Data Collected' },
              { icon: <ArrowRight size={20} />, label: '' },
              { icon: <Brain size={24} />, label: 'AI Analysis' },
              { icon: <ArrowRight size={20} />, label: '' },
              { icon: <BarChart3 size={24} />, label: 'NGO Action' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  ...(step.label ? {
                    padding: '20px 24px', background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                    minWidth: 130
                  } : { color: 'var(--text-tertiary)' })
                }}
              >
                {step.icon}
                {step.label && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{step.label}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2>Ready to Transform Youth Wellbeing?</h2>
        <p>Start tracking, analyzing, and improving outcomes today.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
          Get Started <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
