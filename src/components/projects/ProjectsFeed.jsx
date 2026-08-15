import React from 'react';
import ProjectCard from './ProjectCard';
import ProjectFilter from './ProjectFilter';
import { useProjectFilter } from '../../hooks/useProjectFilter';
import { PROJECTS_DATA } from '../../data/projectsData';
import './ProjectsFeed.css';

export default function ProjectsFeed({ projects = PROJECTS_DATA }) {
  const {
    selectedFilter,
    setSelectedFilter,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    filteredProjects,
  } = useProjectFilter(projects);

  return (
    <main className="main-content">
      {/* Creations Header & Filter */}
      <div className="creations-header">
        <h2 className="creations-title">My Creations</h2>
        <ProjectFilter
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          isOpen={isDropdownOpen}
          onToggleDropdown={toggleDropdown}
          onCloseDropdown={closeDropdown}
        />
      </div>

      {/* Filtered Project Cards List */}
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))
      ) : (
        <div className="section-card" style={{ textAlign: 'center', padding: '30px' }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            No projects found in this category.
          </p>
        </div>
      )}
    </main>
  );
}
