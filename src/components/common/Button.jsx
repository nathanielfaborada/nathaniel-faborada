import React from 'react';
import './Button.css';

export default function Button({
  href,
  onClick,
  target,
  rel,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  if (href) {
    const isExternal = target === '_blank' || href.startsWith('http');
    return (
      <a
        href={href}
        className={className}
        target={target || (isExternal ? '_blank' : undefined)}
        rel={rel || (isExternal ? 'noopener noreferrer' : undefined)}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
