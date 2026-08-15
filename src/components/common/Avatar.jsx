import React, { useState } from 'react';

export default function Avatar({
  src,
  alt = 'Avatar',
  className = 'avatar',
  fallbackSrc,
  loading = 'eager',
  fetchPriority = 'high',
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
      className={`w-full h-full object-cover ${className}`.trim()}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      onError={handleImageError}
      style={style}
      {...props}
    />
  );
}
