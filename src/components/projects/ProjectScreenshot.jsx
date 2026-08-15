import React, { useState } from 'react';
import './ProjectScreenshot.css';

export default function ProjectScreenshot({
  src,
  alt = 'Project Screenshot',
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="project-screenshot">
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          style={{ display: 'block' }}
        />
      ) : null}
      {hasError && (
        <div className="screenshot-placeholder" style={{ display: 'flex' }}>
          Project Screenshot
        </div>
      )}
    </div>
  );
}
