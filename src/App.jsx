import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/useAuthStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

// Components
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { session, isLoading } = useAuthStore();
  
  if (isLoading) return (
    <div className="loading-screen">
      <div className="loader-container">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-text">Initialize Intelligence...</div>
      </div>
    </div>
  );
  if (!session) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    const unsubPromise = initialize();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, [initialize]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute><Students /></ProtectedRoute>
          } />
          
          <Route path="/attendance" element={
            <ProtectedRoute><Attendance /></ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute><Reports /></ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

      <style dangerouslySetInnerHTML={{ __html: `
        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-color);
          position: relative;
          overflow: hidden;
        }

        .loader-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .loader-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 2px solid transparent;
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }

        .loader-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          border-top-color: var(--secondary-color);
          animation: spin 1s linear reverse infinite;
          margin-top: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loader-text {
          margin-top: 100px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
