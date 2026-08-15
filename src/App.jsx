import React, { useState } from 'react';
import ProfileHeader from './components/profile/ProfileHeader';
import ProfileNav from './components/profile/ProfileNav';
import Sidebar from './components/profile/Sidebar';
import ProjectsFeed from './components/projects/ProjectsFeed';
import CollaboratorsFullView from './components/collaborators/CollaboratorsFullView';
import { useGithubUsers } from './hooks/useGithubUsers';
import { useGithubOrganizations } from './hooks/useGithubOrganizations';
import { useWindowSize } from './hooks/useWindowSize';
import { GITHUB_USERS, GITHUB_ORGANIZATIONS } from './data/collaboratorsData';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const { isMobile } = useWindowSize();

  // GitHub Collaborators and Organizations Hooks
  const {
    profileMap,
    isLoading: isUsersLoading,
  } = useGithubUsers(GITHUB_USERS);

  const {
    organizations,
    isLoading: isOrgsLoading,
  } = useGithubOrganizations(GITHUB_ORGANIZATIONS);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeeAllCollaborators = () => {
    handleTabSelect('collaborators');
  };

  // Determine layout visibility
  const isCollaboratorsView = activeTab === 'collaborators';
  const showSidebar = !isMobile || activeTab === 'about';
  const showFeed = !isMobile || activeTab === 'all';

  return (
    <div className="app-container">
      {/* Profile Header Banner & Info */}
      <ProfileHeader />

      {/* Sticky Navigation Tabs */}
      <ProfileNav activeTab={activeTab} onSelectTab={handleTabSelect} />

      {/* Default View: Two-Column Layout */}
      {!isCollaboratorsView && (
        <div id="view-default" className="page-layout">
          {/* Left Sidebar */}
          <Sidebar
            profileMap={profileMap}
            isCollaboratorsLoading={isUsersLoading}
            onSeeAllCollaborators={handleSeeAllCollaborators}
            style={{
              display: showSidebar ? (isMobile ? 'flex' : '') : 'none',
            }}
          />

          {/* Right: Projects Feed */}
          {showFeed && <ProjectsFeed />}
        </div>
      )}

      {/* Full Collaborators & Organizations View */}
      {isCollaboratorsView && (
        <CollaboratorsFullView
          profileMap={profileMap}
          isUsersLoading={isUsersLoading}
          organizations={organizations}
          isOrgsLoading={isOrgsLoading}
        />
      )}
    </div>
  );
}
