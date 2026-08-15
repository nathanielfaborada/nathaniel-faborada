import React from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { OrgGlobeIcon, ExternalLinkIcon } from '../common/Icons';
import './OrganizationCard.css';

export default function OrganizationCard({ org }) {
  if (!org || !org.avatar_url) {
    return null;
  }

  const displayName = org.name || org.login;
  const repoCount = org.public_repos ?? 0;

  return (
    <div className="group-card">
      <div className="group-card-main">
        <Avatar
          src={org.avatar_url}
          alt={displayName}
          className="group-thumb"
        />
        <div className="group-info">
          <p className="group-name" title={displayName}>
            {displayName}
          </p>
          <div className="group-meta">
            <OrgGlobeIcon size={14} />
            <span>Public · {repoCount} repos</span>
          </div>
        </div>
      </div>
      <Button
        href={org.html_url}
        className="org-visit-btn"
        target="_blank"
      >
        <ExternalLinkIcon size={14} />
        Visit
      </Button>
    </div>
  );
}
