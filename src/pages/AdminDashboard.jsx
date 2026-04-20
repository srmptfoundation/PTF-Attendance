import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { StudentService, AttendanceService } from '../services/api';
import { 
  Calendar, ChevronLeft, ChevronRight, Save, Check, X, Clock,
  Users, CheckCircle2, XCircle
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

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

const Dashboard = () => {
  const { role } = useAuthStore();
  const isAdmin = role === 'admin';
  const [date, setDate] = useState(new Date());
  const [session, setSession] = useState('morning');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = format(date, 'yyyy-MM-dd');

  // Fetch students
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => StudentService.getAll().then(res => res.data)
  });

  // Fetch existing attendance for this date + session
  const { data: existingAttendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', formattedDate, session],
    queryFn: () => AttendanceService.getByDate(formattedDate, session).then(res => res.data),
    enabled: !!students
  });

  // Sync attendance map when data arrives
  useEffect(() => {
    if (existingAttendance) {
      const map = {};
      existingAttendance.forEach(record => {
        map[record.student_id] = record.status;
      });
      setAttendanceMap(map);
    } else {
      setAttendanceMap({});
    }
  }, [existingAttendance]);

  const mutation = useMutation({
    mutationFn: ({ attendanceData, session }) => AttendanceService.mark(attendanceData, session),
    onSuccess: () => {
      setIsSaving(false);
      alert('Attendance saved successfully!');
    },
    onError: (err) => {
      setIsSaving(false);
      alert('Error saving attendance: ' + err.message);
    }
  });

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const attendanceData = students.map(s => ({
      student_id: s.id,
      date: formattedDate,
      status: attendanceMap[s.id] || 'absent'
    }));
    mutation.mutate({ attendanceData, session });
  };

  const markAll = (status) => {
    const map = {};
    students.forEach(s => map[s.id] = status);
    setAttendanceMap(map);
  };

  // Compute dynamic stats
  const stats = useMemo(() => {
    const total = students?.length || 0;
    const values = Object.values(attendanceMap);
    const present = values.filter(v => v === 'present').length;
    const absent = values.filter(v => v === 'absent').length;
    const permission = values.filter(v => v === 'permission').length;
    return { total, present, absent, permission };
  }, [students, attendanceMap]);

  return (
    <div className="dashboard-page">
      <div className="attendance-header">
        <div className="date-selector glass">
          <button onClick={() => setDate(subDays(date, 1))} className="btn-icon"><ChevronLeft size={20} /></button>
          <div className="current-date">
            <Calendar size={18} />
            <span>{format(date, 'MMMM dd, yyyy')}</span>
          </div>
          <button onClick={() => setDate(addDays(date, 1))} className="btn-icon"><ChevronRight size={20} /></button>
        </div>

        <div className="session-toggle glass">
          <button
            className={`session-btn ${session === 'morning' ? 'active' : ''}`}
            onClick={() => setSession('morning')}
          >
            Morning
          </button>
          <button
            className={`session-btn ${session === 'afternoon' ? 'active' : ''}`}
            onClick={() => setSession('afternoon')}
          >
            Afternoon
          </button>
        </div>

        <div className="header-actions">
          {!isAdmin && (
            <>
              <div className="bulk-actions">
                <span>Mark All:</span>
                <button onClick={() => markAll('present')} className="btn-ghost btn-sm text-success">Present</button>
                <button onClick={() => markAll('absent')} className="btn-ghost btn-sm text-danger">Absent</button>
              </div>
              <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Attendance'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Students" value={stats.total} icon={Users} color="#38bdf8" />
        <StatCard title="Present Today" value={stats.present} icon={CheckCircle2} color="#4ade80" />
        <StatCard title="Absent Today" value={stats.absent} icon={XCircle} color="#f87171" />
        <StatCard title="Permission" value={stats.permission} icon={Clock} color="#fbbf24" />
      </div>

      <div className="glass-card attendance-grid-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Year</th>
              <th>Department</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {(loadingStudents || loadingAttendance) ? (
              <tr>
                <td colSpan="4" className="text-center">
                  <div className="table-loader">
                    <div className="loader-sm"></div>
                    <span>Initializing Module...</span>
                  </div>
                </td>
              </tr>
            ) : students?.length > 0 ? (
              students.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-sm">{student.full_name ? student.full_name[0] : '?'}</div>
                      <span>{student.full_name}</span>
                    </div>
                  </td>
                  <td><span className="badge glass">{student.year || '-'}</span></td>
                  <td><span className="badge glass">{student.department || '-'}</span></td>
                  <td>
                    <div className="status-toggle-group">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`status-btn p-btn ${attendanceMap[student.id] === 'present' ? 'active' : ''}`}
                        disabled={isAdmin}
                      >
                        <Check size={16} /> Present
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`status-btn a-btn ${attendanceMap[student.id] === 'absent' ? 'active' : ''}`}
                        disabled={isAdmin}
                      >
                        <X size={16} /> Absent
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'permission')}
                        className={`status-btn l-btn ${attendanceMap[student.id] === 'permission' ? 'active' : ''}`}
                        disabled={isAdmin}
                      >
                        <Clock size={16} /> Permission
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center empty-attendance-state">
                  <Calendar size={48} opacity={0.2} />
                  <p>No students available in the system.</p>
                  <Link to="/students" className="btn btn-primary btn-sm">Manage Students</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
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

        .attendance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .session-toggle {
          display: flex;
          padding: 0.25rem;
          gap: 0.25rem;
          border-radius: var(--radius-md);
        }

        .session-btn {
          padding: 0.5rem 1.25rem;
          border-radius: calc(var(--radius-md) - 2px);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition);
          font-family: 'Outfit', sans-serif;
        }

        .session-btn.active {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
        }

        .session-btn:not(.active):hover {
          background: var(--glass-bg);
          color: var(--text-primary);
        }

        .date-selector {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
        }

        .current-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--primary-color);
          justify-content: center;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .attendance-grid-container {
          overflow-x: auto;
        }

        .attendance-table {
          width: 100%;
          border-collapse: collapse;
        }

        .attendance-table th {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          text-align: left;
          color: var(--text-secondary);
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .attendance-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .status-toggle-group {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .status-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
          transition: var(--transition);
        }

        .status-btn:not(:disabled):hover {
          background: var(--glass-bg);
          color: white;
        }

        .status-btn:disabled {
          cursor: default;
          opacity: 0.4;
        }

        .status-btn.active:disabled {
          opacity: 1;
        }

        .status-btn.active.p-btn { background: rgba(74, 222, 128, 0.1); color: var(--success); border-color: var(--success); }
        .status-btn.active.a-btn { background: rgba(248, 113, 113, 0.1); color: var(--danger); border-color: var(--danger); }
        .status-btn.active.l-btn { background: rgba(251, 191, 36, 0.1); color: var(--warning); border-color: var(--warning); }

        .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
        .text-center { text-align: center !important; }

        .table-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem;
        }

        .empty-attendance-state {
          padding: 5rem !important;
          color: var(--text-secondary);
        }

        .empty-attendance-state p {
          margin: 1rem 0 1.5rem;
        }

        .avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          flex-shrink: 0;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
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

        @media (max-width: 768px) {
          .attendance-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .date-selector, .session-toggle {
            width: 100%;
          }
          .session-btn {
            flex: 1;
            text-align: center;
          }
          .header-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .bulk-actions {
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .attendance-table thead {
            display: none;
          }

          .attendance-table tr {
            display: flex;
            flex-direction: column;
            padding: 1.25rem 1rem;
            gap: 1rem;
            border-bottom: 1px solid var(--glass-border);
          }

          .attendance-table td {
            padding: 0;
            border: none;
            width: 100%;
          }

          .attendance-table th:nth-child(2),
          .attendance-table th:nth-child(3),
          .attendance-table td:nth-child(2),
          .attendance-table td:nth-child(3) {
            display: none;
          }

          .status-toggle-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.75rem;
          }

          .status-btn {
            padding: 0.75rem 0;
            font-size: 0;
            min-height: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .status-btn svg {
            width: 22px;
            height: 22px;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};

export default Dashboard;
