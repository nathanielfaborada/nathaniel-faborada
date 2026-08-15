import React, { useState } from 'react';

export default function Avatar({
  src,
  alt = 'Avatar',
  className = 'avatar',
  fallbackSrc,
  style = {},
  ...props
}) {
  const [error, setError] = useState(false);

  const handleImageError = () => {
    if (!error && fallbackSrc) {
      setError(true);
    }
  };

  const imageSrc = error && fallbackSrc ? fallbackSrc : src;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      style={style}
      {...props}
    />
  );
}
