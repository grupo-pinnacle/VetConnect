import React from 'react';
import { PawPrint } from 'lucide-react';

export const DogIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .18 1.6 1.6 2 2.5 2 .5 0 1-.2 1.5-.5" />
    <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.18 1.6-1.6 2-2.5 2-.5 0-1-.2-1.5-.5" />
    <path d="M8 14v.5" />
    <path d="M16 14v.5" />
    <path d="M11.25 16.25h1.5" />
    <path d="M5.42 9C6.4 5.5 8.9 5 12 5s5.6.5 6.58 4c.6 2.13.42 5.5-1.58 7.5-1.5 1.5-3 1.5-5 1.5s-3.5 0-5-1.5C5 14.5 4.82 11.13 5.42 9z" />
  </svg>
);

export const CatIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 5c-4 0-7.5 2.5-7.5 6.5 0 2.5 1.5 4.5 3.5 5.5.5 1 2 2 4 2s3.5-1 4-2c2-1 3.5-3 3.5-5.5C19.5 7.5 16 5 12 5z" />
    <path d="M5.5 8.5L3 3l5.5 2.5" />
    <path d="M18.5 8.5L21 3l-5.5 2.5" />
    <circle cx="9.5" cy="11.5" r=".75" fill="currentColor" />
    <circle cx="14.5" cy="11.5" r=".75" fill="currentColor" />
    <path d="M11.25 14h1.5" />
    <path d="M8 13.5l-3-.5" />
    <path d="M16 13.5l3-.5" />
  </svg>
);

export const RabbitIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 3c-1.5 0-2.5 3-2.5 6.5 0 2 .5 3.5 1.5 4.5" />
    <path d="M16 3c1.5 0 2.5 3 2.5 6.5 0 2-.5 3.5-1.5 4.5" />
    <path d="M12 9c-3.5 0-5.5 2.5-5.5 6 0 3 2.5 5 5.5 5s5.5-2 5.5-5c0-3.5-2-6-5.5-6z" />
    <circle cx="10" cy="14" r=".75" fill="currentColor" />
    <circle cx="14" cy="14" r=".75" fill="currentColor" />
    <path d="M11.5 16.5h1" />
  </svg>
);

export const SpeciesIcon: React.FC<{ species?: string; className?: string }> = ({
  species = '',
  className = 'w-5 h-5',
}) => {
  const norm = species.toLowerCase().trim();
  if (norm.includes('canin') || norm.includes('perr') || norm.includes('dog')) {
    return <DogIcon className={className} />;
  }
  if (norm.includes('felin') || norm.includes('gat') || norm.includes('cat')) {
    return <CatIcon className={className} />;
  }
  if (norm.includes('cone') || norm.includes('rabbit') || norm.includes('exot')) {
    return <RabbitIcon className={className} />;
  }
  return <PawPrint className={className} />;
};
