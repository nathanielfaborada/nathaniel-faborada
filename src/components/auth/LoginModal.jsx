import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LockIcon, MailIcon } from '../common/Icons';
import { api } from '../../services/api';
import './LoginModal.css';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState(null);
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isLoginModalOpen) {
      setError(null);
      setResetSuccessMessage(null);
      setUsername('');
      setPassword('');
      setResetEmail('');
      setMode('login');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isLoginModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape' && isLoginModalOpen) {
        closeLoginModal();
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await login(username.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Login failed. Please check credentials.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResetSuccessMessage(null);

    try {
      const response = await api.auth.forgotPassword(resetEmail.trim());
      setIsSubmitting(false);
      setResetSuccessMessage(
        response.message || `Password reset link sent to ${resetEmail}. Check your inbox!`
      );
    } catch (err) {
      setIsSubmitting(false);
      setError(err.data?.message || err.message || 'Failed to send password reset link.');
    }
  };

  return (
    <div
      className="login-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      <div className="login-modal-card">
        {/* Header */}
        <div className="login-modal-header">
          <div className="login-modal-title-row">
            <div className="login-modal-icon">
              {mode === 'login' ? <LockIcon size={18} /> : <MailIcon size={18} />}
            </div>
            <h2 className="login-modal-title">
              {mode === 'login' ? 'Admin Sign In' : 'Reset Password'}
            </h2>
          </div>
          <button
            type="button"
            className="login-modal-close-btn"
            onClick={closeLoginModal}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Mode: Login Form */}
        {mode === 'login' ? (
          <form className="login-modal-form" onSubmit={handleLoginSubmit}>
            {error && <div className="login-error-alert">{error}</div>}

            <div className="login-form-group">
              <label className="login-form-label" htmlFor="admin-username">
                Username or Email
              </label>
              <input
                id="admin-username"
                ref={inputRef}
                type="text"
                className="login-form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                autoComplete="username"
                required
              />
            </div>

            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-form-label" htmlFor="admin-password">
                  Password
                </label>
                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setResetSuccessMessage(null);
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="admin-password"
                type="password"
                className="login-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>

            <p className="login-hint-text">
              Shortcut: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>
            </p>
          </form>
        ) : (
          /* Mode: Forgot Password Form */
          <form className="login-modal-form" onSubmit={handleForgotSubmit}>
            {error && <div className="login-error-alert">{error}</div>}
            
            {resetSuccessMessage && (
              <div className="login-success-alert">
                <div className="login-success-icon">✓</div>
                <div>{resetSuccessMessage}</div>
              </div>
            )}

            <p className="login-instruction-text">
              Enter your registered email address. We will send you a secure link to reset your password via Brevo.
            </p>

            <div className="login-form-group">
              <label className="login-form-label" htmlFor="reset-email">
                Registered Email
              </label>
              <input
                id="reset-email"
                type="email"
                className="login-form-input"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="e.g. faboradanathaniel@gmail.com"
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="login-back-wrapper">
              <button
                type="button"
                className="login-back-btn"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setResetSuccessMessage(null);
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
