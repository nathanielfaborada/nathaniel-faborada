import React from 'react';
import SectionCard from '../common/SectionCard';
import { EducationIcon } from '../common/Icons';
import { PROFILE_DATA } from '../../data/profileData';

export default function EducationCard({
  education = PROFILE_DATA.education,
}) {
  return (
    <SectionCard title="Education">
      <div className="work-item">
        <div className="work-icon">
          <EducationIcon size={18} />
        </div>
        <div className="work-details">
          <span className="work-company">{education.institution}</span>
          <div className="work-roles">
            <span className="work-period">{education.degree}</span>
            <span className="work-period">{education.period}</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
