import React from 'react';
import './SectionCard.css';

export default function SectionCard({
  title,
  headerAction,
  className = '',
  children,
  ...props
}) {
  return (
    <div className={`section-card ${className}`.trim()} {...props}>
      {title && !headerAction && (
        <h2 className="section-title">{title}</h2>
      )}
      {title && headerAction && (
        <div className="collaborators-header">
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            {title}
          </h2>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}
