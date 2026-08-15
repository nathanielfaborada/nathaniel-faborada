import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ProjectImageCarousel.css';

export default function ProjectImageCarousel({
  images = [],
  title = 'Project Screenshot',
}) {
  // Normalize images to array of valid strings
  const imagesList = React.useMemo(() => {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    }
    if (typeof images === 'string' && images.trim().length > 0) {
      if (images.includes(',')) {
        return images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [images.trim()];
    }
    return [];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const touchStartXRef = useRef(null);

  // Keep index within bounds if images change
  useEffect(() => {
    if (currentIndex >= imagesList.length) {
      setCurrentIndex(0);
    }
  }, [imagesList.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (imagesList.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % imagesList.length);
  }, [imagesList.length]);

  const handlePrev = useCallback(() => {
    if (imagesList.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  }, [imagesList.length]);

  // Auto-play timer: 4 seconds when not hovered
  useEffect(() => {
    if (imagesList.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [imagesList.length, isHovered, handleNext]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation when focused
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  if (imagesList.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-fallback">
          <span className="carousel-fallback-icon">🖼️</span>
          <span className="carousel-fallback-text">{title}</span>
        </div>
      </div>
    );
  }

  const hasMultiple = imagesList.length > 1;

  return (
    <div
      className="carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={`${title} image gallery`}
    >
      {/* Slides Viewport */}
      <div className="carousel-slides-wrapper">
        {imagesList.map((url, index) => {
          const isActive = index === currentIndex;
          const isError = failedImages[index];

          return (
            <div
              key={`${url}-${index}`}
              className={`carousel-slide ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
            >
              {!isError ? (
                <img
                  src={url}
                  alt={`${title} screenshot ${index + 1}`}
                  className="carousel-image w-full h-full object-cover"
                  loading="eager"
                  fetchPriority={index === 0 || isActive ? 'high' : 'auto'}
                  decoding="async"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="carousel-fallback">
                  <span className="carousel-fallback-icon">🖼️</span>
                  <span className="carousel-fallback-text">
                    {title} — Slide {index + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (rendered if multiple images) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            className="carousel-nav-btn carousel-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous image"
            title="Previous"
          >
            ❮
          </button>

          <button
            type="button"
            className="carousel-nav-btn carousel-nav-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
            title="Next"
          >
            ❯
          </button>
        </>
      )}

      {/* Counter Badge in Corner */}
      {hasMultiple && (
        <div className="carousel-counter">
          {currentIndex + 1} / {imagesList.length}
        </div>
      )}

      {/* Pagination Dots */}
      {hasMultiple && (
        <div className="carousel-pagination">
          {imagesList.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
