import React from 'react';
import SectionCard from '../common/SectionCard';
import {
  LocationIcon,
  MailIcon,
  GlobeIcon,
  LanguageIcon,
} from '../common/Icons';
import { PROFILE_DATA } from '../../data/profileData';

const iconMap = {
  location: LocationIcon,
  email: MailIcon,
  country: GlobeIcon,
  languages: LanguageIcon,
};

export default function PersonalDetailsCard({
  details = PROFILE_DATA.personalDetails,
}) {
  return (
    <SectionCard title="Personal details">
      <ul className="detail-list">
        {details.map((item) => {
          const IconComponent = iconMap[item.iconType] || GlobeIcon;
          return (
            <li key={item.id}>
              <IconComponent />
              <span>{item.text}</span>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
