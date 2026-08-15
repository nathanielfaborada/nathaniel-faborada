import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogoutIcon } from '../common/Icons';
import './AdminBar.css';

export default function AdminBar() {
  const { user, isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <aside className="admin-bar" aria-label="Admin Control Bar">
      <div className="admin-bar-left">
        <span className="admin-badge">Admin Mode</span>
        <span className="admin-user-info">
          Logged in as <strong className="admin-user-name">{user?.username || 'Admin'}</strong>
        </span>
      </div>

      <div className="admin-bar-actions">
        <button
          type="button"
          className="admin-logout-btn"
          onClick={logout}
          title="Sign out of Admin Mode"
        >
          <LogoutIcon size={13} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
