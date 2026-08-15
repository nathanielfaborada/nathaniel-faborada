import React from 'react';
import CollaboratorCard from './CollaboratorCard';
import OrganizationCard from './OrganizationCard';
import SkeletonCard from '../common/SkeletonCard';
import SkeletonOrgCard from '../common/SkeletonOrgCard';
import { GITHUB_GROUPS, GITHUB_ORGANIZATIONS } from '../../data/collaboratorsData';
import './Collaborators.css';

export default function CollaboratorsFullView({
  profileMap = {},
  isUsersLoading = false,
  organizations = [],
  isOrgsLoading = false,
}) {
  return (
    <div id="view-collaborators" className="collaborators-full-view">
      {/* Collaborators Section */}
      <div className="collab-full-header">
        <h2 className="collab-full-title">Collaborators</h2>

        <div id="collaborators-grid-full" className="collaborators-grid-full">
          {GITHUB_GROUPS.map((group) => (
            <div className="collab-group" key={group.label}>
              <h3 className="collab-group-label">— {group.label}</h3>
              <div className="collab-group-grid">
                {isUsersLoading
                  ? group.users.map((_, idx) => (
                      <SkeletonCard key={idx} />
                    ))
                  : group.users.map((username) => (
                      <CollaboratorCard
                        key={username}
                        user={profileMap[username]}
                      />
                    ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organization Section */}
      <div className="collab-full-header" style={{ marginTop: '16px' }}>
        <h2 className="collab-full-title">Organization</h2>

        <div id="organization-grid-full">
          {isOrgsLoading ? (
            Array.from({ length: GITHUB_ORGANIZATIONS.length }).map(
              (_, idx) => <SkeletonOrgCard key={idx} />
            )
          ) : organizations.length > 0 ? (
            organizations.map((org) => (
              <OrganizationCard
                key={org.id || org.login}
                org={org}
              />
            ))
          ) : (
            <p
              style={{
                color: 'var(--color-text-secondary, #666)',
                fontSize: '14px',
                padding: '12px 0',
              }}
            >
              No organizations found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
