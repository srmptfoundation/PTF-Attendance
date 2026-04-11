import React, { useState } from 'react';
import { ReportService } from '../services/api';
import { 
  Download, 
  FileSpreadsheet,  
  Calendar as CalendarIcon,
  X
} from 'lucide-react';

const Reports = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  
  const [isFetchingLowAttendance, setIsFetchingLowAttendance] = useState(false);
  const [lowAttendanceData, setLowAttendanceData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const response = await ReportService.downloadMonthly(month, year);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_${year}_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLowAttendance = async () => {
    setIsFetchingLowAttendance(true);
    try {
      const response = await ReportService.getLowAttendance(month, year);
      setLowAttendanceData(response.data);
      setShowModal(true);
    } catch (err) {
      alert('Failed to retrieve data: ' + err.message);
    } finally {
      setIsFetchingLowAttendance(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="reports-page">
      <div className="reports-hero glass-card">
        <div className="hero-content">
          <h2>Generate Monthly Intelligence Reports</h2>
          <p>Download comprehensive attendance data or view targeted metrics.</p>
          
          <div className="report-config">
            <div className="config-item">
              <label>Select Month</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {months.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="config-item">
              <label>Select Year</label>
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>
            <button 
              className="btn btn-primary export-btn" 
              onClick={handleDownload}
              disabled={isExporting}
            >
              <Download size={18} /> {isExporting ? 'Generating...' : 'Export to CSV'}
            </button>
          </div>
        </div>
        <div className="hero-illustration">
          <FileSpreadsheet size={120} className="floating-icon" />
        </div>
      </div>

      <div className="reports-options-grid">
        <div className="glass-card report-card" style={{ maxWidth: '400px' }}>
          <div className="card-icon" style={{background: 'rgba(248, 113, 113, 0.2)', color: 'var(--danger)'}}>
            <CalendarIcon size={24} />
          </div>
          <h3>Low Attendance Report</h3>
          <p>Identify students with attendance strictly below 75% for the selected month.</p>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleLowAttendance}
            disabled={isFetchingLowAttendance}
          >
            {isFetchingLowAttendance ? 'Processing...' : 'View Report'}
          </button>
        </div>
      </div>

      {showModal && lowAttendanceData && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Low Attendance (&lt; 75%)</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {lowAttendanceData.length > 0 ? (
                <table className="attendance-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Class/Dept</th>
                      <th style={{ padding: '1rem' }}>Present</th>
                      <th style={{ padding: '1rem' }}>Absent</th>
                      <th style={{ padding: '1rem' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowAttendanceData.map(student => (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '1rem' }}><strong>{student.name}</strong></td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                          {student.class} {student.department ? `- ${student.department}` : ''}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--success)' }}>{student.present}</td>
                        <td style={{ padding: '1rem', color: 'var(--danger)' }}>{student.absent}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '20px', 
                            background: 'rgba(248, 113, 113, 0.1)', 
                            color: 'var(--danger)',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}>
                            {student.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <CalendarIcon size={48} opacity={0.2} style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <p>Incredible! All students maintained acceptable attendance for {months[month-1]} {year}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .reports-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .reports-hero {
          padding: 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
        }

        .hero-content {
          max-width: 500px;
        }

        .hero-content h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .hero-content p {
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
        }

        .report-config {
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
        }

        .config-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .config-item label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .config-item select {
          padding: 0.75rem 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: white;
          outline: none;
          min-width: 140px;
        }

        .export-btn {
          height: 48px;
        }

        .hero-illustration {
          opacity: 0.1;
          transform: rotate(15deg);
        }

        .floating-icon {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .reports-options-grid {
          display: flex;
          gap: 1.5rem;
        }

        .report-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
          transition: var(--transition);
          flex: 1;
        }

        .report-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-color);
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .report-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: slide-up 0.3s ease-out;
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .modal-header h2 {
          font-size: 1.25rem;
        }
      `}} />
    </div>
  );
};

export default Reports;
