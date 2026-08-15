import React from 'react';
import './Skeleton.css';

export default function SkeletonCard() {
  return (
    <div className="collab-card collab-skeleton">
      <div className="skeleton-avatar" />
      <div className="collab-info">
        <div className="skeleton-line" style={{ width: '70%' }} />
        <div className="skeleton-line" style={{ width: '50%' }} />
        <div className="skeleton-line" style={{ width: '50%' }} />
      </div>
    </div>
  );
}
