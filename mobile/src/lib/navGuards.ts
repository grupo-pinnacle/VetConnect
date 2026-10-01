import { User } from '../types';

export type AccessStatus = 'ALLOWED' | 'BLOCKED_SENASA' | 'UNAUTHENTICATED';

export function checkVetAccess(user: User | null): AccessStatus {
  if (!user) return 'UNAUTHENTICATED';
  if (user.role === 'VET' && user.vetStatus !== 'APPROVED') {
    return 'BLOCKED_SENASA';
  }
  return 'ALLOWED';
}

export interface NavTabsConfig {
  homeTitle: string;
  consultationHref: 'consultation/new' | null;
  petsHref: 'pets/new' | null;
}

export function resolveUserNavTabs(user: User | null): NavTabsConfig {
  const isClient = user?.role === 'CLIENT';
  return {
    homeTitle: isClient ? 'Inicio' : 'Guardia',
    consultationHref: isClient ? 'consultation/new' : null,
    petsHref: isClient ? 'pets/new' : null,
  };
}
