import { useState, useMemo, useCallback } from 'react';
import { PROJECTS_DATA } from '../data/projectsData';

export function useProjectFilter(initialProjects = PROJECTS_DATA, defaultFilter = 'all') {
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const openDropdown = useCallback(() => {
    setIsDropdownOpen(true);
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedFilter === 'all') {
      return initialProjects;
    }
    return initialProjects.filter((project) => project.category === selectedFilter);
  }, [initialProjects, selectedFilter]);

  return {
    selectedFilter,
    setSelectedFilter,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    openDropdown,
    filteredProjects,
  };
}
