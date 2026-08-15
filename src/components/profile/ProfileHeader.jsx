import React from 'react';
import { useLocation } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { ResumeDocIcon, LockIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { PROFILE_DATA } from '../../data/profileData';
import './ProfileHeader.css';

export default function ProfileHeader({
  profile = PROFILE_DATA,
}) {
  const { isLoggedIn, openLoginModal } = useAuth();
  const location = useLocation();

  // Check if current route is /admin_nathaniel (via pathname or hash)
  const normalizedPath = (location.pathname || '').replace(/\/+$/, '');
  const normalizedHash = (location.hash || '').replace(/^#\/?/, '/').replace(/\/+$/, '');
  const isAdminRoute = normalizedPath === '/admin_nathaniel' || normalizedHash === '/admin_nathaniel';

  return (
    <div className="profile-card">
      <div className="banner">
        <img
          src={profile.bannerUrl}
          alt="Header Cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="profile-info">
        <div className="avatar-wrapper">
          <Avatar
            src={profile.avatarUrl}
            alt={profile.name}
            className="avatar"
          />
        </div>
        <div className="details">
          <div className="name-row">
            <div className="name-col">
              <h1 className="name">
                {profile.name} <span className="nickname">{profile.nickname}</span>
                <span className="wave">{profile.waveEmoji}</span>
              </h1>
              <p className="bio">
                Aspiring Junior software developer based in Pandi, Bulacan, specializing in{' '}
                <span className="bio-highlight">React</span>,{' '}
                <span className="bio-highlight">Node.js</span>, and{' '}
                <span className="bio-highlight">REST API</span> development. Builds clean,
                responsive applications with a focus on automation, and performance.
              </p>
            </div>
          </div>

          <div className="profile-actions-wrapper flex items-center justify-start gap-2 w-full sm:w-auto mt-3">
            <Button
              href={profile.resumeUrl}
              className="resume-btn flex items-center justify-center w-full sm:w-auto px-6 py-2.5 rounded-lg"
              target="_blank"
            >
              <ResumeDocIcon size={16} />
              <span>Resume</span>
            </Button>

            {/* Render Lock Button ONLY on /admin_nathaniel AND when NOT logged in */}
            {isAdminRoute && !isLoggedIn && (
              <button
                type="button"
                className="admin-login-trigger"
                onClick={openLoginModal}
                title="Admin Login (Ctrl+Shift+L)"
                aria-label="Admin Login"
              >
                <LockIcon size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
