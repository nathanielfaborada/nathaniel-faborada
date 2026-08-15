import React from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { ExternalLinkIcon } from '../common/Icons';
import './CollaboratorCard.css';

export default function CollaboratorCard({ user }) {
  if (!user || !user.avatar_url) {
    return <div className="collab-card collab-error">Failed to load</div>;
  }

  const displayName = user.name || user.login;
  const followersCount =
    typeof user.followers === 'number'
      ? `${user.followers.toLocaleString()} Followers`
      : '0 Followers';
  const followingCount =
    typeof user.following === 'number'
      ? `${user.following.toLocaleString()} Following`
      : '0 Following';

  return (
    <div className="collab-card">
      <Avatar
        src={user.avatar_url}
        alt={displayName}
        className="collab-avatar"
      />
      <div className="collab-info">
        <span className="collab-name" title={displayName}>
          {displayName}
        </span>
        <span className="collab-stat">{followersCount}</span>
        <span className="collab-stat">{followingCount}</span>
      </div>
      <Button
        href={user.html_url}
        className="collab-visit"
        target="_blank"
      >
        <ExternalLinkIcon size={13} />
        Visit
      </Button>
    </div>
  );
}
