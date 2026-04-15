import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  CheckSquare,
  FileText, 
  LogOut, 
  User, 
  Settings 
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
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

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside className="sidebar glass">
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
          />
          {role !== 'admin' && (
            <SidebarLink 
              to="/attendance" 
              icon={CheckSquare} 
              label="Attendance" 
              active={location.pathname === '/attendance'} 
            />
          )}
          <SidebarLink 
            to="/students" 
            icon={Users} 
            label="Students" 
            active={location.pathname === '/students'} 
          />
          <SidebarLink 
            to="/reports" 
            icon={FileText} 
            label="Reports" 
            active={location.pathname === '/reports'} 
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
          <h1>{getPageTitle(location.pathname)}</h1>
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
          z-index: 100;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-bottom: none;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
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
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
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
        }

        .icon-only {
          padding: 0.5rem;
          border-radius: 50%;
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
