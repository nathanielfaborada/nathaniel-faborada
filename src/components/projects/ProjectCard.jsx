import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProjectScreenshot from './ProjectScreenshot';
import {
  InfoBadgeIcon,
  CheckBadgeIcon,
  SourceCodeIcon,
  ExternalLinkIcon,
} from '../common/Icons';
import './ProjectCard.css';

const TRUNCATE_LENGTH = 180;

export default function ProjectCard({ project }) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="project-card" data-category={project.category}>
      {/* Author Section */}
      <div className="project-author">
        <Avatar
          src={project.author.avatar}
          alt={project.author.name}
          className="project-avatar"
        />
        <span className="project-author-name">{project.author.name}</span>
        <span className="badge-icon">
          <InfoBadgeIcon size={15} />
        </span>
        <span className="badge-icon">
          <CheckBadgeIcon size={15} />
        </span>
      </div>

      {/* Primary Headline & Secondary Category Meta */}
      <p className="project-headline">
        <span className="pin">📌</span>
        <strong>{project.headline}</strong>
        {project.categoryLabel && (
          <span className="project-category"> · {project.categoryLabel}</span>
        )}
      </p>

      {/* Body Description with See More / See Less Toggle */}
      {rawDescription && (
        <p className="project-desc">
          <span className="monitor">💻</span>
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

      {/* Screenshots */}
      {project.screenshots &&
        project.screenshots.map((src, index) => (
          <ProjectScreenshot
            key={index}
            src={src}
            alt={`${project.headline} screenshot ${index + 1}`}
          />
        ))}

      {/* Footer */}
      {(project.stars || (project.links && project.links.length > 0)) && (
        <div className="project-footer">
          <span className="project-stars">{project.stars || ''}</span>
          <div className="project-links">
            {project.links &&
              project.links.map((link) => {
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
