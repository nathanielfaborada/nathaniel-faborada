import React, { useRef, useEffect } from 'react';
import { FilterIcon } from '../common/Icons';
import { CATEGORY_FILTERS } from '../../data/projectsData';
import './ProjectFilter.css';

export default function ProjectFilter({
  selectedFilter = 'all',
  onSelectFilter,
  isOpen = false,
  onToggleDropdown,
  onCloseDropdown,
}) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (onCloseDropdown) {
          onCloseDropdown();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onCloseDropdown]);

  return (
    <div className="filter-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="filter-btn"
        id="filter-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleDropdown) onToggleDropdown();
        }}
      >
        <FilterIcon size={15} />
        Filter
      </button>

      <div
        className={`filter-dropdown ${isOpen ? 'open' : ''}`.trim()}
        id="filter-dropdown"
      >
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`filter-option ${
              selectedFilter === filter.key ? 'active' : ''
            }`.trim()}
            onClick={() => {
              if (onSelectFilter) onSelectFilter(filter.key);
              if (onCloseDropdown) onCloseDropdown();
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
