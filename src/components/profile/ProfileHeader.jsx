import React from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { ResumeDocIcon } from '../common/Icons';
import { PROFILE_DATA } from '../../data/profileData';
import './ProfileHeader.css';

export default function ProfileHeader({
  profile = PROFILE_DATA,
}) {
  return (
    <div className="profile-card">
      <div className="banner">
        <img src={profile.bannerUrl} alt="Header Cover" />
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
            <Button
              href={profile.resumeUrl}
              className="resume-btn"
              target="_blank"
            >
              <ResumeDocIcon size={16} />
              <span>Resume</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
