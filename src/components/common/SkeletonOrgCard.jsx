import React from 'react';
import './Skeleton.css';

export default function SkeletonOrgCard() {
  return (
    <div className="group-card collab-skeleton">
      <div className="group-card-main">
        <div
          className="skeleton-avatar"
          style={{ width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0 }}
        />
        <div className="group-info" style={{ flex: 1 }}>
          <div className="skeleton-line" style={{ width: '60%', height: '16px' }} />
          <div className="skeleton-line" style={{ width: '40%', height: '12px', marginTop: '6px' }} />
        </div>
      </div>
      <div
        className="skeleton-line"
        style={{ width: '76px', height: '34px', borderRadius: '8px', flexShrink: 0 }}
      />
    </div>
  );
}
