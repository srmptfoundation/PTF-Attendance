import React from 'react';
import useAuthStore from '../store/useAuthStore';
import AdminDashboard from './AdminDashboard';
import InchargeDashboard from './InchargeDashboard';

const Dashboard = () => {
  const { role } = useAuthStore();
  return role === 'admin' ? <AdminDashboard /> : <InchargeDashboard />;
};

export default Dashboard;
