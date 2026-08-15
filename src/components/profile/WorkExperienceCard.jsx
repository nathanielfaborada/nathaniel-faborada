import React from 'react';
import SectionCard from '../common/SectionCard';
import { BriefcaseIcon } from '../common/Icons';
import { PROFILE_DATA } from '../../data/profileData';
import './WorkExperienceCard.css';

export default function WorkExperienceCard({
  experiences = PROFILE_DATA.workExperience,
}) {
  return (
    <SectionCard title="Work Experience">
      {experiences.map((exp, idx) => (
        <div className="work-experience-item" key={idx}>
          <div className="work-company-icon">
            <BriefcaseIcon size={22} />
          </div>
          <div className="work-company-content">
            <h3 className="work-company-title">{exp.company}</h3>
            <div className="work-timeline">
              {exp.roles.map((role, roleIdx) => (
                <div className="timeline-role-item" key={roleIdx}>
                  <div className="timeline-marker" />
                  <div className="timeline-role-content">
                    <span className="timeline-role-title">{role.title}</span>
                    <span className="timeline-role-period">{role.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </SectionCard>
  );
}
