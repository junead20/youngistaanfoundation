import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, MessageSquare, Users, Activity, LogOut, ShieldCheck, User, Gamepad2 } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('name') || 'Friend';
  const userRole = localStorage.getItem('role') || 'user';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = userRole === 'volunteer' 
    ? [
        { path: '/dashboard/volunteer', label: 'Priority List', icon: <ShieldCheck size={20} /> },
      ]
    : [
        { path: '/dashboard/user', label: 'Home', icon: <Home size={20} /> },
        { path: '/milo', label: 'Chat with Milo', icon: <MessageSquare size={20} /> },
        { path: '/activities', label: 'Fun Activities', icon: <Activity size={20} /> },
        { path: '/communities', label: 'Safe Circles', icon: <Users size={20} /> },
      ];

  return (
    <div className="layout-v2">
      <aside className="sidebar-v2">
        <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
           <Heart size={28} fill="var(--primary)" color="var(--primary)" />
           <h3>YuvaPulse</h3>
        </div>

        <nav className="sidebar-nav">
           {navItems.map((item) => (
              <button 
                 key={item.path}
                 className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
                 onClick={() => navigate(item.path)}
              >
                 {item.icon}
                 <span>{item.label}</span>
              </button>
           ))}
        </nav>

        <div className="sidebar-footer">
           <div style={{ 
             display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
             background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' 
           }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: '50%', 
                background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <User size={18} color="var(--primary)" />
              </div>
              <div>
                 <div style={{ fontWeight: 600, fontSize: 14 }}>{userName}</div>
                 <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{userRole}</div>
              </div>
           </div>
           <button className="nav-btn" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
              <LogOut size={20} />
              <span>Log Out</span>
           </button>
        </div>
      </aside>

      <main className="main-content-v2">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
