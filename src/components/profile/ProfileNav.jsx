import React from 'react';
import './ProfileNav.css';

export default function ProfileNav({
  activeTab = 'all',
  onSelectTab,
}) {
  const handleTabClick = (e, tab) => {
    e.preventDefault();
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  return (
    <nav className="profile-nav" aria-label="Profile navigation">
      <ul>
        <li
          className={activeTab === 'all' ? 'active' : ''}
          data-tab="all"
        >
          <a
            href="#all"
            className={activeTab === 'all' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'all')}
          >
            All
          </a>
        </li>
        <li
          className={`mobile-only ${activeTab === 'about' ? 'active' : ''}`}
          data-tab="about"
        >
          <a
            href="#about"
            className={activeTab === 'about' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'about')}
          >
            About
          </a>
        </li>
        <li
          className={activeTab === 'collaborators' ? 'active' : ''}
          data-tab="collaborators"
        >
          <a
            href="#collaborators"
            className={activeTab === 'collaborators' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'collaborators')}
          >
            Collaborators
          </a>
        </li>
        <li
          className={activeTab === 'certificates' ? 'active' : ''}
          data-tab="certificates"
        >
          <a
            href="#certificates"
            className={activeTab === 'certificates' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'certificates')}
          >
            Certificates
          </a>
        </li>
      </ul>
    </nav>
  );
}
