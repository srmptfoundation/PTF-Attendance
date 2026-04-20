import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/api';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card stat-card">
    <div className="stat-header">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
        <Icon size={24} />
      </div>
    </div>
    <div className="stat-body">
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

const InchargeDashboard = () => {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => DashboardService.getSummary().then(res => res.data),
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div className="dashboard-loading">
      <div className="loader-ring"></div>
      <p>Synchronizing Data...</p>
    </div>
  );

  if (error) return (
    <div className="dashboard-error glass-card">
      <XCircle size={48} color="var(--danger)" />
      <h3>Connection Error</h3>
      <p>Unable to reach the intelligence core. Please check your backend connection.</p>
      <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm">Retry Connection</button>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="session-label">
        {summary?.activeSession === 'morning' ? 'Morning Session' : 'Afternoon Session'}
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={summary?.totalStudents || 0}
          icon={Users}
          color="#38bdf8"
        />
        <StatCard
          title="Present Today"
          value={summary?.presentToday || 0}
          icon={CheckCircle2}
          color="#4ade80"
        />
        <StatCard
          title="Absent Today"
          value={summary?.absentToday || 0}
          icon={XCircle}
          color="#f87171"
        />
        <StatCard
          title="Permission"
          value={summary?.permissionToday || 0}
          icon={Clock}
          color="#fbbf24"
        />
      </div>

      <div className="dashboard-content-grid">
        <div className="glass-card chart-container">
          <div className="card-header">
            <h3>Attendance Overview</h3>
            <button className="btn-ghost btn-sm">This Week</button>
          </div>
          <div className="placeholder-chart">
            <TrendingUp size={48} className="chart-icon" />
            <p>Data visualization will appear after more attendance records are collected.</p>
          </div>
        </div>

        <div className="glass-card activity-container">
          <div className="card-header">
            <h3>System Status</h3>
          </div>
          <div className="activity-list">
            {summary?.recentActivity?.length > 0 ? (
              summary.recentActivity.map((activity, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${activity.status}`}></div>
                  <div className="activity-info">
                    <p className="activity-text">
                      <strong>{activity.students?.full_name}</strong> was marked
                      <span className={`status-text ${activity.status}`}> {activity.status}</span>
                      <span className="activity-session"> · {activity.session}</span>
                    </p>
                    <p className="activity-time">{format(new Date(activity.date), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-activity">
                <Clock size={32} opacity={0.2} />
                <p>No recent activity recorded today.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .session-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--primary-color);
          margin-bottom: -0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-color);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-title {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .placeholder-chart {
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .chart-icon {
          opacity: 0.2;
        }

        .activity-list {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }

        .status-text.present { color: var(--success); }
        .status-text.absent { color: var(--danger); }
        .status-text.permission { color: var(--warning); }

        .activity-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;
        }

        .activity-dot.present { background: var(--success); box-shadow: 0 0 10px var(--success); }
        .activity-dot.absent { background: var(--danger); box-shadow: 0 0 10px var(--danger); }
        .activity-dot.permission { background: var(--warning); box-shadow: 0 0 10px var(--warning); }

        .empty-activity {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .activity-info p {
          font-size: 0.9rem;
        }

        .activity-time {
          color: var(--text-secondary);
          font-size: 0.75rem !important;
          margin-top: 0.25rem;
        }

        .activity-session {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .dashboard-loading, .dashboard-error {
          height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          text-align: center;
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .stat-value {
            font-size: 1.4rem;
          }
          .stat-card {
            padding: 1rem;
          }
        }
      `}} />
    </div>
  );
};

export default InchargeDashboard;
