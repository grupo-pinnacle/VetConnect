import { checkVetAccess, resolveUserNavTabs } from '../lib/navGuards';
import { User } from '../types';

describe('App Navigation and SENASA Role Guards', () => {
  describe('checkVetAccess', () => {
    it('returns UNAUTHENTICATED when user is null', () => {
      expect(checkVetAccess(null)).toBe('UNAUTHENTICATED');
    });

    it('returns ALLOWED for standard clients regardless of vetStatus', () => {
      const clientUser: User = {
        id: 'u-1',
        email: 'tutor@example.com',
        firstName: 'Carlos',
        lastName: 'Ruiz',
        role: 'CLIENT',
        ratingAvg: 0,
        ratingCount: 0,
        isOnline: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      expect(checkVetAccess(clientUser)).toBe('ALLOWED');
    });

    it('returns BLOCKED_SENASA for vets with PENDING status', () => {
      const pendingVet: User = {
        id: 'v-1',
        email: 'vet@example.com',
        firstName: 'Dra. Maria',
        lastName: 'Lopez',
        role: 'VET',
        vetStatus: 'PENDING',
        ratingAvg: 0,
        ratingCount: 0,
        isOnline: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      expect(checkVetAccess(pendingVet)).toBe('BLOCKED_SENASA');
    });

    it('returns BLOCKED_SENASA for vets with REJECTED status', () => {
      const rejectedVet: User = {
        id: 'v-2',
        email: 'rejected@example.com',
        firstName: 'Dr. Lucas',
        lastName: 'Diaz',
        role: 'VET',
        vetStatus: 'REJECTED',
        ratingAvg: 0,
        ratingCount: 0,
        isOnline: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      expect(checkVetAccess(rejectedVet)).toBe('BLOCKED_SENASA');
    });

    it('returns ALLOWED for vets with APPROVED status', () => {
      const approvedVet: User = {
        id: 'v-3',
        email: 'approved@example.com',
        firstName: 'Dr. Martin',
        lastName: 'Gomez',
        role: 'VET',
        vetStatus: 'APPROVED',
        ratingAvg: 4.8,
        ratingCount: 12,
        isOnline: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      expect(checkVetAccess(approvedVet)).toBe('ALLOWED');
    });
  });

  describe('resolveUserNavTabs', () => {
    it('configures client tabs with Inicio, consultation/new, and pets/new', () => {
      const clientUser: User = {
        id: 'u-1',
        email: 'tutor@example.com',
        firstName: 'Carlos',
        lastName: 'Ruiz',
        role: 'CLIENT',
        ratingAvg: 0,
        ratingCount: 0,
        isOnline: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const tabs = resolveUserNavTabs(clientUser);
      expect(tabs.homeTitle).toBe('Inicio');
      expect(tabs.consultationHref).toBe('consultation/new');
      expect(tabs.petsHref).toBe('pets/new');
    });

    it('configures vet tabs with Guardia and hides client actions from tab bar', () => {
      const vetUser: User = {
        id: 'v-1',
        email: 'vet@example.com',
        firstName: 'Dr. Martin',
        lastName: 'Gomez',
        role: 'VET',
        vetStatus: 'APPROVED',
        ratingAvg: 4.8,
        ratingCount: 12,
        isOnline: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const tabs = resolveUserNavTabs(vetUser);
      expect(tabs.homeTitle).toBe('Guardia');
      expect(tabs.consultationHref).toBeNull();
      expect(tabs.petsHref).toBeNull();
    });
  });
});
