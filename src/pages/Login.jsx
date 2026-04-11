import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { LogIn, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { signInWithGoogle, authError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayError = authError || error;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background Elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="login-card glass-card"
      >
        <div className="login-header">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="logo-container"
          >
            <img src="/logo/logo2.1.png" alt="PTF-Attendance" className="login-logo" />
          </motion.div>
          <h2 className="gradient-text">PTF-Attendance</h2>
          <p>Seamless Student Management & Attendance Tracking</p>
        </div>

        <div className="login-body">
          <button 
            onClick={handleGoogleLogin} 
            className="btn google-login-btn" 
            disabled={loading}
          >
            {loading ? (
              <div className="loader-sm"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {displayError && <p className="error-msg">{displayError}</p>}
        </div>

        <div className="login-footer">
          <div className="footer-line"></div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-color);
          position: relative;
          overflow: hidden;
        }

        /* Animated Blobs */
        .bg-blob {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.15;
          animation: blobMovement 20s infinite alternate;
        }

        .blob-1 { background: var(--primary-color); top: -100px; left: -100px; }
        .blob-2 { background: var(--secondary-color); bottom: -100px; right: -100px; animation-delay: -5s; }
        .blob-3 { background: var(--accent-color); top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; }

        @keyframes blobMovement {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, 50px) scale(1.1); }
          100% { transform: translate(-50px, 100px) scale(0.9); }
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 3.5rem 2.5rem;
          text-align: center;
          z-index: 10;
          position: relative;
        }

        .login-header {
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .login-logo {
          width: 180px;
          height: auto;
          margin-bottom: 0.5rem;
          filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.2));
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, var(--primary-color) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .login-body {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          opacity: 0.8;
          line-height: 1.6;
        }

        .google-login-btn {
          width: 100%;
          height: 54px;
          background: white;
          color: #1f2937;
          border: none;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-weight: 600;
          font-size: 1rem;
          transition: var(--transition);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .google-login-btn:hover {
          background: #f9fafb;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .google-login-btn img {
          width: 20px;
          height: 20px;
        }

        .loader-sm {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .footer-line {
          width: 40px;
          height: 2px;
          background: var(--glass-border);
          border-radius: 1px;
        }

        .trusted-by {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          opacity: 0.6;
        }

        .error-msg {
          color: var(--danger);
          font-size: 0.85rem;
          margin-top: -1rem;
        }
      `}} />
    </div>
  );
};

export default Login;
