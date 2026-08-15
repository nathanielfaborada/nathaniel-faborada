import React from 'react';
import SectionCard from '../common/SectionCard';
import Button from '../common/Button';
import { GithubIcon, LinkedinIcon } from '../common/Icons';
import { PROFILE_DATA } from '../../data/profileData';

const socialIconMap = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

export default function SocialLinksCard({
  links = PROFILE_DATA.socialLinks,
}) {
  return (
    <SectionCard title="Social Links">
      <ul className="social-list">
        {links.map((social) => {
          const IconComponent = socialIconMap[social.platform] || GithubIcon;
          return (
            <li key={social.platform}>
              <Button
                href={social.url}
                className="social-link"
                target="_blank"
              >
                <IconComponent size={20} />
                {social.label}
              </Button>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
