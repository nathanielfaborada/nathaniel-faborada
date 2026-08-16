import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import ProjectFilter from './ProjectFilter';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PlusIcon } from '../common/Icons';
import { PROJECTS_DATA } from '../../data/projectsData';
import './ProjectsFeed.css';

export default function ProjectsFeed({
  activeTab = 'all',
  onOpenCreateModal,
  onEditProject,
  onDeleteProject,
  refreshTrigger,
}) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState(PROJECTS_DATA);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // STRICT ROUTE CHECK: Render button ONLY if the path explicitly includes /admin_nathaniel
  const currentPathname = typeof window !== 'undefined' ? window.location.pathname : location.pathname || '';
  const currentHash = typeof window !== 'undefined' ? window.location.hash : location.hash || '';
  const isAdminRoute = currentPathname.includes('/admin_nathaniel') || currentHash.includes('/admin_nathaniel');

  const [certificates, setCertificates] = useState([]);

  // Fetch creations & certificates from API
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [creationsData, certsData] = await Promise.all([
        api.creations.getAll().catch(() => PROJECTS_DATA),
        api.certificates.getAll().catch(() => []),
      ]);

      if (Array.isArray(creationsData) && creationsData.length > 0) {
        setProjects(creationsData);
      } else {
        setProjects(PROJECTS_DATA);
      }

      if (Array.isArray(certsData)) {
        const normalizedCerts = certsData.map((c) => ({
          ...c,
          category: 'Certificate',
          categoryLabel: 'Certificate',
          headline: c.title,
          description: c.issuer ? `Issued by ${c.issuer}` : 'Certificate of Completion',
          live_demo_url: c.credential_url,
          source_code_url: c.display_type === 'iframe' ? 'iframe' : '',
          notice: c.display_type === 'iframe' ? 'iframe' : (c.issuer ? `Issuer: ${c.issuer}` : ''),
          image_url: c.image_url,
          screenshots: c.image_url ? [c.image_url] : (c.credential_url ? [c.credential_url] : []),
          tags: [c.display_type === 'iframe' ? '#iframe' : '#image', '#certificate'],
          created_at: c.created_at,
          stars: '🏆',
          is_certificate_model: true,
        }));
        setCertificates(normalizedCerts);
      }
    } catch (err) {
      console.warn('Using static projects data fallback:', err.message);
      setProjects(PROJECTS_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, refreshTrigger]);

  const isCertificatesTab = activeTab === 'certificates';

  // Filter projects by category or return certificates
  const filteredProjects = isCertificatesTab
    ? (certificates.length > 0
        ? certificates
        : projects.filter((p) => {
            const cat = (p.category || '').toLowerCase();
            return cat === 'certificate' || cat === 'certificates';
          }))
    : projects.filter((project) => {
        const cat = (project.category || '').toLowerCase();
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'certificates') {
          return cat === 'certificate' || cat === 'certificates';
        }
        return cat === selectedFilter.toLowerCase();
      });

  return (
    <main className="main-content">
      {/* Creations Header & Controls */}
      <div className="creations-header">
        <h2 className="creations-title">
          {isCertificatesTab || selectedFilter === 'certificates'
            ? 'Certificates'
            : 'My Creations'}
        </h2>

        <div className="creations-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Show filter dropdown only on All view */}
          {!isCertificatesTab && (
            <ProjectFilter
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              isOpen={isDropdownOpen}
              onToggleDropdown={() => setIsDropdownOpen((prev) => !prev)}
              onCloseDropdown={() => setIsDropdownOpen(false)}
            />
          )}

          {/* Dedicated Add Certificate button: appears ONLY on /admin_nathaniel route (and when Certificates tab is active) */}
          {isAdminRoute && isCertificatesTab && (
            <button
              type="button"
              id="add-certificate-btn"
              onClick={() => onOpenCreateModal && onOpenCreateModal('certificate')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                height: '36px',
                background: '#1877f2',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              }}
            >
              <PlusIcon size={14} />
              + Add Certificate
            </button>
          )}

          {/* Regular Add Project button: shown on other project categories on admin route (NOT on Certificates tab) */}
          {isAdminRoute && !isCertificatesTab && selectedFilter !== 'certificates' && (
            <button
              type="button"
              id="add-project-btn"
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
            {isCertificatesTab || selectedFilter === 'certificates'
              ? 'No certificates added yet.'
              : 'No projects found in this category.'}
          </p>
        </div>
      )}
    </main>
  );
}
