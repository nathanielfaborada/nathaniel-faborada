import React, { useState, useEffect, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import ProjectFilter from './ProjectFilter';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PlusIcon } from '../common/Icons';
import { PROJECTS_DATA } from '../../data/projectsData';
import './ProjectsFeed.css';

export default function ProjectsFeed({ onOpenCreateModal, onEditProject, onDeleteProject, refreshTrigger }) {
  const { isLoggedIn } = useAuth();
  const [projects, setProjects] = useState(PROJECTS_DATA);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch creations from API
  const fetchCreations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.creations.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(PROJECTS_DATA);
      }
    } catch (err) {
      console.warn('Using static projects data fallback:', err.message);
      setProjects(PROJECTS_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreations();
  }, [fetchCreations, refreshTrigger]);

  // Filter projects by category
  const filteredProjects = projects.filter((project) => {
    if (selectedFilter === 'all') return true;
    return project.category === selectedFilter;
  });

  return (
    <main className="main-content">
      {/* Creations Header & Controls */}
      <div className="creations-header">
        <h2 className="creations-title">My Creations</h2>

        <div className="creations-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ProjectFilter
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            isOpen={isDropdownOpen}
            onToggleDropdown={() => setIsDropdownOpen((prev) => !prev)}
            onCloseDropdown={() => setIsDropdownOpen(false)}
          />

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => onOpenCreateModal && onOpenCreateModal('creation')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                height: '34px',
                background: '#1877f2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
            >
              <PlusIcon size={13} />
              Add Project
            </button>
          )}
        </div>
      </div>

      {/* Filtered Project Cards List */}
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project) => (
          <ProjectCard
            key={project.id || project.title}
            project={project}
            onEdit={onEditProject}
            onDelete={onDeleteProject}
          />
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
