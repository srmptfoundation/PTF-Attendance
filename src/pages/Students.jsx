import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentService } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  MoreVertical,
  X,
  Users
} from 'lucide-react';

const StudentModal = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState(student || {
    full_name: '',
    class: '',
    year: '',
    department: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content animate-fade-in">
        <div className="modal-header">
          <h3>{student ? 'Edit Student' : 'Add New Student'}</h3>
          <button onClick={onClose} className="btn-ghost icon-only"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="input-field">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="input-field">
              <label>Year</label>
              <input 
                type="text" 
                placeholder="e.g. 1st Year"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
              />
            </div>
            <div className="input-field">
              <label>Department</label>
              <input 
                type="text" 
                placeholder="e.g. B.Com"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div className="input-field">
              <label>Phone</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="input-field">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="input-field full-width">
              <label>Address</label>
              <textarea 
                rows="3"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => StudentService.getAll().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => StudentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      setShowModal(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => StudentService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      setShowModal(false);
      setEditingStudent(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => StudentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
    }
  });

  const filteredStudents = students?.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.year?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleSave = (data) => {
    if (editingStudent) {
      updateMutation.mutate({ ...data, id: editingStudent.id });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="students-page">
      <div className="action-bar">
        <div className="search-box glass">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bar-actions">
          <button className="btn btn-ghost"><Filter size={18} /> Filters</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      <div className="glass-card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Year</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <div className="table-loader">
                    <div className="loader-sm"></div>
                    <span>Synchronizing students...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents?.length > 0 ? (
              filteredStudents.map(student => (
              <tr key={student.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar-sm">{student.full_name ? student.full_name[0] : '?'}</div>
                    <span>{student.full_name}</span>
                  </div>
                </td>
                <td><span className="badge glass">{student.year || '-'}</span></td>
                <td><span className="badge glass">{student.department || '-'}</span></td>
                <td>{student.phone || '-'}</td>
                <td><span className="status-dot active"></span> Active</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(student)} className="btn-icon"><Edit2 size={16} /></button>
                    <button onClick={() => deleteMutation.mutate(student.id)} className="btn-icon text-danger"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center empty-table-state">
                  <Users size={48} opacity={0.2} />
                  <p>No students found in the database.</p>
                  <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">Add First Student</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <StudentModal 
          student={editingStudent} 
          onClose={() => { setShowModal(false); setEditingStudent(null); }} 
          onSave={handleSave}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .action-bar {
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1rem;
          flex: 1;
          max-width: 400px;
          border-radius: var(--radius-md);
        }

        .search-box input {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 0;
          width: 100%;
          outline: none;
        }

        .bar-actions {
          display: flex;
          gap: 1rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .data-table th {
          padding: 1.25rem 1.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--glass-border);
        }

        .data-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          font-size: 0.95rem;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .status-dot.active { background: var(--success); box-shadow: 0 0 10px var(--success); }

        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: var(--transition);
        }

        .btn-icon:hover {
          background: var(--glass-bg);
          color: var(--primary-color);
        }

        .table-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
        }

        .empty-table-state {
          padding: 4rem !important;
          color: var(--text-secondary);
        }

        .empty-table-state p {
          margin: 1rem 0 1.5rem;
        }

        .text-danger:hover { color: var(--danger); }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          width: 100%;
          max-width: 600px;
          padding: 0;
          overflow: hidden;
        }

        .modal-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
        }

        .modal-form {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-field.full-width { grid-column: span 2; }

        .input-field label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .input-field input, .input-field textarea {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          color: white;
          outline: none;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}} />
    </div>
  );
};

export default Students;
