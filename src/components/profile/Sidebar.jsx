import React from 'react';
import PersonalDetailsCard from './PersonalDetailsCard';
import WorkExperienceCard from './WorkExperienceCard';
import LearnedSkillsCard from './LearnedSkillsCard';
import EducationCard from './EducationCard';
import SocialLinksCard from './SocialLinksCard';
import CollaboratorsSidebarWidget from '../collaborators/CollaboratorsSidebarWidget';
import './Sidebar.css';

export default function Sidebar({
  style,
  className = 'sidebar',
  profileMap = {},
  isCollaboratorsLoading = false,
  onSeeAllCollaborators,
  workExperiences,
  refreshTrigger,
  onOpenCreateModal,
  onEditExperience,
  onDeleteExperience,
  children,
}) {
  return (
    <aside className={className} id="sidebar" style={style}>
      <PersonalDetailsCard />
      <WorkExperienceCard
        experiences={workExperiences}
        refreshTrigger={refreshTrigger}
        onOpenCreateModal={onOpenCreateModal}
        onEditExperience={onEditExperience}
        onDeleteExperience={onDeleteExperience}
      />
      <LearnedSkillsCard />
      <EducationCard />
      <SocialLinksCard />
      <CollaboratorsSidebarWidget
        profileMap={profileMap}
        isLoading={isCollaboratorsLoading}
        onSeeAll={onSeeAllCollaborators}
      />
      {children}
    </aside>
  );
}
