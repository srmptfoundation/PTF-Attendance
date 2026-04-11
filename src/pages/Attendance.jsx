import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { StudentService, AttendanceService } from '../services/api';
import { 
  Calendar, ChevronLeft, ChevronRight, Save, Check, X, Clock
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Attendance = () => {
  const { role } = useAuthStore();
  const isAdmin = role === 'admin';
  const [date, setDate] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = format(date, 'yyyy-MM-dd');

  // Fetch students
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => StudentService.getAll().then(res => {
      const yearOrder = { '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4 };
      return res.data.sort((a, b) => {
        const yearA = yearOrder[a.year] || 99;
        const yearB = yearOrder[b.year] || 99;
        if (yearA !== yearB) return yearA - yearB;
        return a.full_name.localeCompare(b.full_name);
      });
    })
  });

  // Fetch existing attendance for this date
  const { data: existingAttendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', formattedDate],
    queryFn: () => AttendanceService.getByDate(formattedDate).then(res => res.data),
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
    mutationFn: (data) => AttendanceService.mark(data),
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
      status: attendanceMap[s.id] || 'absent' // Default to absent if not marked
    }));
    mutation.mutate(attendanceData);
  };

  const markAll = (status) => {
    const map = {};
    students.forEach(s => map[s.id] = status);
    setAttendanceMap(map);
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div className="date-selector glass">
          <button onClick={() => setDate(subDays(date, 1))} className="btn-icon"><ChevronLeft size={20} /></button>
          <div className="current-date">
            <Calendar size={18} />
            <span>{format(date, 'MMMM dd, yyyy')}</span>
          </div>
          <button onClick={() => setDate(addDays(date, 1))} className="btn-icon"><ChevronRight size={20} /></button>
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
                    <span>Initializing Attendance Sheet...</span>
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
                  <p>No students available to mark attendance.</p>
                  <Link to="/students" className="btn btn-primary btn-sm">Add Students First</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .attendance-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .attendance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
        }

        .date-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
        }

        .current-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--primary-color);
          min-width: 180px;
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
      `}} />
    </div>
  );
};

export default Attendance;
