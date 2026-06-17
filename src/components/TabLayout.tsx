import { Outlet, NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', icon: '🏠', label: 'Home', end: true },
  { to: '/alerts', icon: '🔔', label: 'Alerts', end: false },
  { to: '/insights', icon: '🧠', label: 'Insights', end: false },
  { to: '/settings', icon: '⚙️', label: 'Settings', end: false },
];

export default function TabLayout() {
  return (
    <div className="tab-layout">
      <div className="tab-content">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-item-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
