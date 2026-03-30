import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageCircle, MapPin, BarChart3, Shield,
  BookOpen, TrendingUp, Activity, Heart, Globe, PlayCircle
} from 'lucide-react';

const navItems = [
  { section: 'Overview' },
  { path: '/dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
  { section: 'Age Groups' },
  { path: '/dashboard/children', label: 'Children (6-12)', icon: Heart },
  { path: '/dashboard/teens', label: 'Teens (13-19)', icon: Activity },
  { section: 'Tools' },
  { path: '/milo', label: 'Chat with Milo', icon: MessageCircle, badge: 'Companion' },
  { path: '/communities', label: 'Communities', icon: Globe },
  { path: '/activities', label: 'Fun Activities', icon: PlayCircle },
  { path: '/early-detection', label: 'Wellbeing Journey', icon: Shield },
  { section: 'Volunteer & Operations (Admin)' },
  { path: '/volunteer', label: 'Volunteer Portal', icon: Users },
  { path: '/programs', label: 'Programs', icon: BookOpen },
  { section: 'Analytics' },
  { path: '/geographic', label: 'Geographic Insights', icon: MapPin },
  { path: '/impact', label: 'Impact Report', icon: TrendingUp },
];

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/dashboard/children': 'Children Dashboard (6-12)',
  '/dashboard/teens': 'Teens Dashboard (13-19)',
  '/milo': 'Milo Companion',
  '/communities': 'Connect with Communities',
  '/activities': 'Fun Activities & Self-Time',
  '/volunteer': 'Volunteer Portal',
  '/programs': 'Program Analytics',
  '/geographic': 'Geographic Insights',
  '/impact': 'Impact Report',
  '/early-detection': 'Wellbeing Journey',
};

export default function Layout() {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💚</div>
          <div>
            <h2>YuvaPulse</h2>
            <span>Youth Wellbeing Intelligence</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) =>
            item.section ? (
              <div key={idx} className="sidebar-section-title">{item.section}</div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className="sidebar-link-icon" size={18} />
                {item.label}
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </NavLink>
            )
          )}
        </nav>
      </aside>

      {/* Header */}
      <header className="header">
        <h1 className="header-title">{currentTitle}</h1>
        <div className="header-right">
          <button className="header-btn">
            <BarChart3 size={16} />
            Export
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
