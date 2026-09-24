/** Design tokens — single source for StyleSheet values (docs/mobile/04_*). */

export const colors = {
  primary: '#0284C7',
  primaryDark: '#0369A1',
  ink: '#0F172A',
  body: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  canvas: '#F8FAFC',
  card: '#FFFFFF',
  line: '#E2E8F0',
  lineDark: '#CBD5E1',
  danger: '#EF4444',
  amber: '#F59E0B',
  ok: '#10B981',
  unreadBg: '#F0F9FF',
  unreadLine: '#BAE6FD',
  indicationsBg: '#FEF3C7',
  indicationsInk: '#78350F',
} as const;

export const triageColors: Record<'ROJO' | 'AMARILLO' | 'VERDE', string> = {
  ROJO: '#EF4444',
  AMARILLO: '#F59E0B',
  VERDE: '#10B981',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;
export const radius = { sm: 6, md: 8, lg: 12, xl: 16 } as const;
