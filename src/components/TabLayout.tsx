import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Bell, TrendingUp, Settings, Plus, LogOut, HeartHandshake } from 'lucide-react';

const TABS = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/alerts', icon: <Bell size={18} />, label: 'Alerts', end: false },
  { to: '/insights', icon: <TrendingUp size={18} />, label: 'Insights', end: false },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings', end: false },
];

export default function TabLayout() {
  const { caregiver, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    if (window.confirm('Sign out of CareLink?')) {
      await logout();
      navigate('/login');
    }
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <HeartHandshake size={22} />
          </div>
          <div>
            <div className="sidebar-brand-name">CareLink</div>
            <div className="sidebar-brand-sub">AI Elderly Care</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {TABS.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-link-icon">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: 8 }}>Quick Actions</div>
          <NavLink to="/elder/add" className="nav-link">
            <span className="nav-link-icon"><Plus size={18} /></span>
            Add Elder
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{caregiver?.name?.[0] || 'C'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {caregiver?.name}
              </div>
              <div className="sidebar-user-role">Caregiver</div>
            </div>
            <button
              title="Sign out"
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                flexShrink: 0,
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <div className="page-area">
          <Outlet />
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `mob-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="mob-nav-icon">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
