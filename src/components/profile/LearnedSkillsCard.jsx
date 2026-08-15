import React from 'react';
import SectionCard from '../common/SectionCard';
import Badge from '../common/Badge';
import { PROFILE_DATA } from '../../data/profileData';

export default function LearnedSkillsCard({
  skills = PROFILE_DATA.learnedSkills,
}) {
  return (
    <SectionCard title="Learned Skills">
      <p className="skills-desc">{skills.description}</p>

      {skills.groups.map((group, groupIdx) => (
        <React.Fragment key={groupIdx}>
          <div className="skill-group">
            <div className="skill-scroll">
              {group.map((tag) => (
                <Badge key={tag} label={tag} />
              ))}
            </div>
          </div>
          {groupIdx < skills.groups.length - 1 && (
            <div className="skill-divider" />
          )}
        </React.Fragment>
      ))}
    </SectionCard>
  );
}
