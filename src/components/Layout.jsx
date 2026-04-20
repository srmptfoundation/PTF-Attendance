import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  CheckSquare,
  FileText,
  LogOut,
  Settings,
  Menu
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const SidebarLink = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`sidebar-link ${active ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const Layout = ({ children }) => {
  const { user, signOut, role } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const closeSidebar = () => setMobileOpen(false);

  return (
    <div className="app-container">
      {mobileOpen && <div className="mobile-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar glass ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="PTF" className="sidebar-logo" />
          <h2>PTF Attendance</h2>
        </div>

        <nav className="sidebar-nav">
          <SidebarLink
            to="/"
            icon={BarChart3}
            label="Dashboard"
            active={location.pathname === '/'}
            onClick={closeSidebar}
          />
          {role !== 'admin' && (
            <SidebarLink
              to="/attendance"
              icon={CheckSquare}
              label="Attendance"
              active={location.pathname === '/attendance'}
              onClick={closeSidebar}
            />
          )}
          <SidebarLink
            to="/students"
            icon={Users}
            label="Students"
            active={location.pathname === '/students'}
            onClick={closeSidebar}
          />
          <SidebarLink
            to="/reports"
            icon={FileText}
            label="Reports"
            active={location.pathname === '/reports'}
            onClick={closeSidebar}
          />
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar btn-primary">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.email?.split('@')[0]}</p>
              <p className="user-role">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content animate-fade-in">
        <header className="content-top">
          <div className="content-top-left">
            <button className="menu-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
              <Menu size={22} />
            </button>
            <h1>{getPageTitle(location.pathname)}</h1>
          </div>
          <div className="top-actions">
            <button className="btn-ghost icon-only"><Settings size={20} /></button>
          </div>
        </header>
        {children}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          z-index: 200;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-bottom: none;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
          min-width: 44px;
          min-height: 44px;
          border-radius: var(--radius-md);
          transition: var(--transition);
          flex-shrink: 0;
        }

        .menu-toggle:hover {
          background: var(--glass-bg);
        }

        .content-top-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .content-top-left h1 {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
            box-shadow: 4px 0 30px rgba(0, 0, 0, 0.4);
          }

          .menu-toggle {
            display: flex;
          }
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          z-index: 150;
        }

        .sidebar-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 3.5rem;
        }

        .sidebar-header h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .sidebar-logo {
          width: 120px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.1));
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition);
          min-height: 48px;
        }

        .sidebar-link:hover, .sidebar-link.active {
          background: var(--glass-bg);
          color: var(--primary-color);
        }

        .sidebar-link.active {
          background: rgba(56, 189, 248, 0.1);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--glass-border);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: transparent;
          border: none;
          color: var(--danger);
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.5rem;
          min-height: 44px;
          transition: var(--transition);
        }

        .btn-logout:hover {
          opacity: 0.8;
          transform: translateX(5px);
        }

        .content-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        @media (max-width: 480px) {
          .content-top h1 {
            font-size: 1.2rem;
          }
        }

        .icon-only {
          padding: 0.5rem;
          border-radius: 50%;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}} />
    </div>
  );
};

const getPageTitle = (path) => {
  switch (path) {
    case '/': return 'Dashboard';
    case '/attendance': return 'Mark Attendance';
    case '/students': return 'Student Management';
    case '/reports': return 'Reports & Analytics';
    default: return 'PTF-Attendance';
  }
};

export default Layout;
