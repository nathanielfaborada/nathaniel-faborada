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

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing or invalid password reset token in the URL. Please request a new link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
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
      await api.auth.resetPassword({ token, newPassword });
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

        {/* Success State */}
        {isSuccess ? (
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
