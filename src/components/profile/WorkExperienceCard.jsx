import React, { useState, useEffect, useCallback } from 'react';
import SectionCard from '../common/SectionCard';
import { BriefcaseIcon, PlusIcon, EditIcon, TrashIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PROFILE_DATA } from '../../data/profileData';
import './WorkExperienceCard.css';

export default function WorkExperienceCard({
  experiences: initialExperiences,
  refreshTrigger,
  onOpenCreateModal,
  onEditExperience,
  onDeleteExperience,
}) {
  const { isLoggedIn } = useAuth();
  const [experiences, setExperiences] = useState(
    initialExperiences || PROFILE_DATA.workExperience || []
  );

  // Fetch Work Experiences from API
  const fetchWorkExperiences = useCallback(async () => {
    try {
      const data = await api.workExperiences.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setExperiences(data);
      } else {
        setExperiences(initialExperiences || PROFILE_DATA.workExperience || []);
      }
    } catch (err) {
      console.error('Failed to fetch work experiences:', err);
      setExperiences(initialExperiences || PROFILE_DATA.workExperience || []);
    }
  }, [initialExperiences]);

  // Re-fetch on mount and when refreshTrigger updates
  useEffect(() => {
    fetchWorkExperiences();
  }, [fetchWorkExperiences, refreshTrigger]);

  // Update when prop changes
  useEffect(() => {
    if (initialExperiences && Array.isArray(initialExperiences)) {
      setExperiences(initialExperiences);
    }
  }, [initialExperiences]);

  // Group experiences by company_name
  const groupedExperiences = experiences.reduce((acc, item) => {
    const rawCompanyName = item.company_name || item.company || 'Company';
    const key = rawCompanyName.trim();
    const lowerKey = key.toLowerCase();

    if (!acc[lowerKey]) {
      acc[lowerKey] = {
        company_name: key,
        company_logo_url: item.company_logo_url || item.companyLogo || null,
        roles: [],
      };
    }

    if (Array.isArray(item.roles) && item.roles.length > 0) {
      item.roles.forEach((r, rIdx) => {
        acc[lowerKey].roles.push({
          id: item.id ? `${item.id}-${rIdx}` : `${lowerKey}-${rIdx}`,
          rawItem: item,
          title: r.title || 'Developer',
          period: r.period || '',
          description: r.description || item.description || '',
        });
      });
    } else {
      let formattedPeriod = '';
      if (item.period) {
        formattedPeriod = item.period;
      } else {
        const start = item.start_date ? item.start_date.substring(0, 7) : '';
        const end = item.end_date ? item.end_date.substring(0, 7) : 'Present';
        formattedPeriod = start ? `${start} - ${end}` : end;
      }

      acc[lowerKey].roles.push({
        id: item.id || `${lowerKey}-${acc[lowerKey].roles.length}`,
        rawItem: item,
        title: item.role_title || item.title || 'Developer',
        period: formattedPeriod,
        description: item.description || '',
      });
    }

    if (!acc[lowerKey].company_logo_url && (item.company_logo_url || item.companyLogo)) {
      acc[lowerKey].company_logo_url = item.company_logo_url || item.companyLogo;
    }

    return acc;
  }, {});

  const companyList = Object.values(groupedExperiences);

  const headerAction = isLoggedIn ? (
    <button
      type="button"
      onClick={() => onOpenCreateModal && onOpenCreateModal('workExperience')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        background: '#1877f2',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.78rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <PlusIcon size={12} />
      Add Experience
    </button>
  ) : null;

  return (
    <SectionCard title="Work Experience" headerAction={headerAction}>
      {companyList.map((companyGroup) => {
        return (
          <div className="work-experience-item" key={companyGroup.company_name}>
            <div className="work-company-icon">
              {companyGroup.company_logo_url ? (
                <img
                  src={companyGroup.company_logo_url}
                  alt={companyGroup.company_name}
                  className="work-company-img w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <BriefcaseIcon size={22} />
              )}
            </div>
            <div className="work-company-content">
              <h3 className="work-company-title">{companyGroup.company_name}</h3>

              <div className="work-timeline">
                {companyGroup.roles.map((role) => (
                  <div className="timeline-role-item" key={role.id}>
                    <div className="timeline-marker" />
                    <div className="timeline-role-content">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <span className="timeline-role-title">{role.title}</span>
                        {isLoggedIn && (
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => onEditExperience && onEditExperience(role.rawItem)}
                              title="Edit Experience Role"
                              className="experience-action-btn edit-btn"
                            >
                              <EditIcon size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteExperience && onDeleteExperience(role.rawItem)
                              }
                              title="Delete Experience Role"
                              className="experience-action-btn delete-btn"
                            >
                              <TrashIcon size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="timeline-role-period">{role.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </SectionCard>
  );
}
