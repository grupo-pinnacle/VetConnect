/** Design tokens - "Clinical Calm" design system (single source for StyleSheet values). */

export const colors = {
  primary: '#0284C7',
  primaryDark: '#0369A1',
  primaryTint: '#E0F2FE',
  passport: '#0F172A',
  passportAlt: '#1E293B',
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  canvas: '#F8FAFC',
  card: '#FFFFFF',
  line: '#E2E8F0',
  lineDark: '#CBD5E1',
  danger: '#DC2626',
  dangerDark: '#991B1B',
  dangerTint: '#FEF2F2',
  amber: '#D97706',
  ok: '#059669',
  okLight: '#10B981',
  unreadBg: '#F0F9FF',
  unreadLine: '#BAE6FD',
  indicationsBg: '#FEF3C7',
  indicationsInk: '#78350F',
} as const;

export const triageColors: Record<'ROJO' | 'AMARILLO' | 'VERDE', string> = {
  ROJO: '#DC2626',
  AMARILLO: '#D97706',
  VERDE: '#059669',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;
export const radius = { sm: 6, md: 8, lg: 12, xl: 16, pass: 24, full: 999 } as const;
