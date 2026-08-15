import React from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { OrgGlobeIcon, ExternalLinkIcon, EditIcon, TrashIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import './OrganizationCard.css';

export default function OrganizationCard({ org, onEdit, onDelete }) {
  const { isLoggedIn } = useAuth();

  if (!org) {
    return null;
  }

  const displayName = org.name || org.login;
  const repoCount = org.repos_count ?? org.public_repos ?? 0;
  const logoUrl =
    org.logo_url ||
    org.avatar_url ||
    'https://avatars.githubusercontent.com/u/9919?s=200&v=4';
  const visitUrl = org.visit_url || org.html_url || `https://github.com/${org.login || ''}`;
  const visibility = org.visibility_type || 'Public';

  return (
    <div className="group-card">
      <div className="group-card-main">
        <Avatar
          src={logoUrl}
          alt={displayName}
          className="group-thumb"
        />
        <div className="group-info">
          <p className="group-name" title={displayName}>
            {displayName}
          </p>
          <div className="group-meta">
            <OrgGlobeIcon size={14} />
            <span>
              {visibility} · {repoCount} repos
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isLoggedIn && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => onEdit && onEdit(org)}
              title="Edit Organization"
              style={{
                background: '#f0f2f5',
                border: '1px solid #ced0d4',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                color: '#1877f2',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <EditIcon size={12} />
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(org)}
              title="Delete Organization"
              style={{
                background: '#ffebe8',
                border: '1px solid #f2ab99',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                color: '#c92a2a',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <TrashIcon size={12} />
            </button>
          </div>
        )}

        <Button
          href={visitUrl}
          className="org-visit-btn"
          target="_blank"
        >
          <ExternalLinkIcon size={14} />
          Visit
        </Button>
      </div>
    </div>
  );
}
