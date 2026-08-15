import React from 'react';
import './Badge.css';

export default function Badge({
  label,
  children,
  className = 'tag',
  ...props
}) {
  return (
    <span className={className} {...props}>
      {children || label}
    </span>
  );
}
