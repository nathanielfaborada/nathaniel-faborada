import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LockIcon } from '../common/Icons';
import { api } from '../../services/api';
import './ResetPasswordModal.css';

export default function ResetPasswordModal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();

  // Helper to extract token from query parameters or hash
  const getTokenFromLocation = () => {
    const fromRouter = searchParams.get('token');
    if (fromRouter) return fromRouter;

    if (typeof window !== 'undefined' && window.location.search) {
      const fromSearch = new URLSearchParams(window.location.search).get('token');
      if (fromSearch) return fromSearch;
    }

    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('token=')) {
      const queryIdx = window.location.hash.indexOf('?');
      if (queryIdx !== -1) {
        const fromHash = new URLSearchParams(window.location.hash.substring(queryIdx)).get('token');
        if (fromHash) return fromHash;
      }
    }

    return '';
  };

  const [token, setToken] = useState(getTokenFromLocation);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const currentToken = getTokenFromLocation();
    setToken(currentToken);

    if (!currentToken) {
      setIsValidating(false);
      setIsTokenValid(false);
      setError('Missing or invalid password reset token. Please check the link from your email.');
      return;
    }

    let isMounted = true;
    setIsValidating(true);
    setError(null);

    api.auth
      .verifyResetToken(currentToken)
      .then((res) => {
        if (isMounted) {
          if (res.success) {
            setIsTokenValid(true);
            setError(null);
          } else {
            setIsTokenValid(false);
            setError(res.message || 'This password reset link has expired or is invalid.');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          const isNetworkError =
            err.message?.includes('Failed to fetch') ||
            err.message?.includes('NetworkError');

          if (isNetworkError) {
            // If server check couldn't be reached due to network, allow user to try submitting
            setIsTokenValid(true);
            setError(null);
          } else {
            setIsTokenValid(false);
            setError(
              err.data?.message ||
                err.message ||
                'This password reset link has expired. Please request a new one.'
            );
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsValidating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const currentToken = token || getTokenFromLocation();
    if (!currentToken) {
      setError('Password reset token is missing.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.auth.resetPassword({ token: currentToken, newPassword });
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.data?.message || err.message || 'Failed to reset password. The link may have expired.'
      );
    }
  };

  const handleGoToLogin = () => {
    navigate('/admin_nathaniel');
    setTimeout(() => {
      openLoginModal();
    }, 100);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="reset-modal-overlay">
      <div className="reset-modal-card">
        {/* Header */}
        <div className="reset-modal-header">
          <div className="reset-modal-icon">
            <LockIcon size={20} />
          </div>
          <h2 className="reset-modal-title">Reset Admin Password</h2>
          <p className="reset-modal-subtitle">
            Create a secure new password for your administrator account.
          </p>
        </div>

        {/* Loading State during validation */}
        {isValidating ? (
          <div className="reset-loading-container">
            <div className="reset-spinner" />
            <div className="reset-loading-text">Verifying reset link...</div>
          </div>
        ) : isSuccess ? (
          /* Success State */
          <div className="reset-success-container">
            <div className="reset-success-badge">✓</div>
            <h3 className="reset-success-title">Password Reset Complete!</h3>
            <p className="reset-success-text">
              Your password has been successfully updated. You can now sign in using your new password.
            </p>
            <button
              type="button"
              className="reset-primary-btn"
              onClick={handleGoToLogin}
            >
              Sign In to Admin
            </button>
          </div>
        ) : !isTokenValid && error ? (
          /* Invalid / Expired Token Error Screen */
          <div className="reset-modal-form">
            <div className="reset-error-alert">
              <span>⚠️ {error}</span>
            </div>
            <p className="reset-instruction-text" style={{ textAlign: 'center', fontSize: '0.9rem', color: '#65676b' }}>
              Password reset links expire for security reasons. Please return to the login screen and click "Forgot password" to generate a fresh link.
            </p>
            <button
              type="button"
              className="reset-primary-btn"
              onClick={handleGoToLogin}
            >
              Request New Reset Link
            </button>
            <div className="reset-secondary-actions">
              <button
                type="button"
                className="reset-text-btn"
                onClick={handleGoHome}
              >
                Cancel & Return Home
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form className="reset-modal-form" onSubmit={handleSubmit}>
            {error && (
              <div className="reset-error-alert">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="reset-form-group">
              <label className="reset-form-label" htmlFor="new-password">
                New Password
              </label>
              <div className="reset-input-wrapper">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  className="reset-form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  disabled={!token || isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="reset-form-group">
              <label className="reset-form-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className="reset-input-wrapper">
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="reset-form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  disabled={!token || isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="reset-show-password-row">
              <label className="reset-checkbox-label">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <span>Show passwords</span>
              </label>
            </div>

            <button
              type="submit"
              className="reset-primary-btn"
              disabled={!token || isSubmitting}
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </button>

            <div className="reset-secondary-actions">
              <button
                type="button"
                className="reset-text-btn"
                onClick={handleGoHome}
              >
                Cancel & Return Home
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
