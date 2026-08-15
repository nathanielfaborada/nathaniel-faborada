import React from 'react';
import SectionCard from '../common/SectionCard';
import CollaboratorCard from './CollaboratorCard';
import SkeletonCard from '../common/SkeletonCard';
import { GITHUB_USERS } from '../../data/collaboratorsData';
import './Collaborators.css';

export default function CollaboratorsSidebarWidget({
  profileMap = {},
  isLoading = false,
  onSeeAll,
}) {
  const topUsers = GITHUB_USERS.slice(0, 3);

  const headerAction = (
    <a
      className="see-all-link"
      href="#collaborators"
      id="see-all-collabs"
      onClick={(e) => {
        e.preventDefault();
        if (onSeeAll) onSeeAll();
      }}
    >
      See all collaborators
    </a>
  );

  return (
    <SectionCard title="Collaborators" headerAction={headerAction}>
      <div id="collaborators-grid" className="collaborators-grid">
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))
          : topUsers.map((username) => (
              <CollaboratorCard
                key={username}
                user={profileMap[username]}
              />
            ))}
      </div>
    </SectionCard>
  );
}
