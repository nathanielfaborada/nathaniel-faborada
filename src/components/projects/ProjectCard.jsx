import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProjectImageCarousel from './ProjectImageCarousel';
import { useAuth } from '../../context/AuthContext';
import {
  InfoBadgeIcon,
  CheckBadgeIcon,
  SourceCodeIcon,
  ExternalLinkIcon,
  EditIcon,
  TrashIcon,
} from '../common/Icons';
import './ProjectCard.css';

const TRUNCATE_LENGTH = 180;

export default function ProjectCard({ project, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isLoggedIn } = useAuth();

  if (!project) return null;

  const rawDescription = project.description || '';
  const hasContributions = project.contributions && project.contributions.length > 0;
  const hasNotice = Boolean(project.notice);
  const isLongDescription = rawDescription.length > TRUNCATE_LENGTH;
  const hasExpandableContent = isLongDescription || hasContributions || hasNotice;

  // Truncated preview text
  const previewText = isLongDescription
    ? `${rawDescription.slice(0, TRUNCATE_LENGTH).trim()}...`
    : rawDescription;

  const authorName = project.author?.name || 'Nathaniel Faborada';
  const authorAvatar =
    project.author?.avatar ||
    'https://res.cloudinary.com/diwwqfwjb/image/upload/v1776094289/542451323_122191510964372800_7390414124574237799_n_kg4uvt.jpg';

  const isCertificate =
    project.category === 'certificates' || project.category === 'certificate';

  // Normalize links
  let links = project.links || [];
  if (!links.length) {
    if (project.source_code_url) {
      links.push({ type: 'source', url: project.source_code_url, label: 'Source' });
    }
    if (project.live_demo_url) {
      links.push({
        type: 'visit',
        url: project.live_demo_url,
        label: isCertificate ? 'Verify Credential' : 'Visit',
      });
    }
  }

  // Normalize screenshots / images array
  let screenshots = [];
  if (Array.isArray(project.screenshots) && project.screenshots.length > 0) {
    screenshots = [...project.screenshots];
  } else if (typeof project.screenshots === 'string' && project.screenshots.trim()) {
    try {
      const parsed = JSON.parse(project.screenshots);
      if (Array.isArray(parsed)) screenshots = parsed;
      else screenshots = [project.screenshots];
    } catch {
      screenshots = project.screenshots.includes(',')
        ? project.screenshots.split(',').map((s) => s.trim()).filter(Boolean)
        : [project.screenshots.trim()];
    }
  }

  if (project.image_url && !screenshots.includes(project.image_url)) {
    screenshots.unshift(project.image_url);
  }

  // Format Project Date Badge
  const formattedDate = React.useMemo(() => {
    if (project.project_date && project.project_date.trim()) {
      return project.project_date.trim();
    }
    if (project.created_at) {
      try {
        const d = new Date(project.created_at);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
      } catch {
        // ignore
      }
    }
    return null;
  }, [project.project_date, project.created_at]);

  return (
    <div className="project-card" data-category={project.category}>
      {/* Author Section & Admin Actions */}
      <div className="project-author">
        <div className="project-author-left">
          <Avatar
            src={authorAvatar}
            alt={authorName}
            className="project-avatar"
          />
          <span className="project-author-name">{authorName}</span>
          <span className="badge-icon">
            <InfoBadgeIcon size={15} />
          </span>
          <span className="badge-icon">
            <CheckBadgeIcon size={15} />
          </span>
        </div>

        {/* Admin Action Buttons */}
        {isLoggedIn && (
          <div className="card-admin-actions" style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="admin-edit-btn"
              onClick={() => onEdit && onEdit(project)}
              title="Edit project"
              style={{
                background: '#f0f2f5',
                border: '1px solid #ced0d4',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1877f2',
              }}
            >
              <EditIcon size={12} />
              Edit
            </button>
            <button
              type="button"
              className="admin-delete-btn"
              onClick={() => onDelete && onDelete(project)}
              title="Delete project"
              style={{
                background: '#ffebe8',
                border: '1px solid #f2ab99',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#c92a2a',
              }}
            >
              <TrashIcon size={12} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Primary Headline & Secondary Category Meta + Date Badge */}
      <div className="project-headline-row">
        <p className="project-headline">
          <span className="pin">{isCertificate ? '📜' : '📌'}</span>
          <strong>{project.headline || project.title}</strong>
          {project.categoryLabel ? (
            <span className="project-category"> · {project.categoryLabel}</span>
          ) : isCertificate ? (
            <span className="project-category"> · Certificate</span>
          ) : null}
        </p>
        {formattedDate && (
          <span className="project-date-badge">
            📅 {formattedDate}
          </span>
        )}
      </div>

      {/* Body Description with See More / See Less Toggle */}
      {rawDescription && (
        <p className="project-desc">
          <span className="monitor">{isCertificate ? '🎓' : '💻'}</span>
          {isExpanded || !hasExpandableContent ? rawDescription : previewText}
          {!isExpanded && hasExpandableContent && (
            <button
              type="button"
              className="see-more-btn"
              onClick={() => setIsExpanded(true)}
            >
              See more
            </button>
          )}
        </p>
      )}

      {/* Expanded Content: Notice & Contributions */}
      {isExpanded && (
        <>
          {project.notice && (
            <p className="project-desc project-notice">
              <span className="email">📧</span>
              {project.notice}
            </p>
          )}

          {hasContributions && (
            <div className="project-contributions">
              <ul className="project-bullet-list">
                {project.contributions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            className="see-more-btn see-less-btn"
            onClick={() => setIsExpanded(false)}
          >
            See less
          </button>
        </>
      )}

      {/* Tech Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="project-tags">
          {project.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* Interactive Image Carousel */}
      {screenshots.length > 0 && (
        <ProjectImageCarousel
          images={screenshots}
          title={project.headline || project.title || 'Project'}
        />
      )}

      {/* Footer */}
      {(project.stars || (links && links.length > 0)) && (
        <div className="project-footer">
          <span className="project-stars">{project.stars || ''}</span>
          <div className="project-links">
            {links &&
              links.map((link) => {
                const isPrimary = link.type === 'visit';
                const IconComponent =
                  link.type === 'source' ? SourceCodeIcon : ExternalLinkIcon;
                return (
                  <Button
                    key={link.label}
                    href={link.url}
                    className={`project-btn ${
                      isPrimary ? 'project-btn-primary' : 'project-btn-secondary'
                    }`}
                    target="_blank"
                  >
                    <IconComponent size={14} />
                    {link.label}
                  </Button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
