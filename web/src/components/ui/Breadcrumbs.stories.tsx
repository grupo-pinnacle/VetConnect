import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'UI/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Componente de migas de pan para navegación jerárquica con soporte WCAG 2.1 AA, navegación por teclado y desplazamiento horizontal en pantallas móviles.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Inicio', path: '/' },
      { label: 'Mascotas', path: '/pets' },
      { label: 'Milo' },
    ],
  },
};

export const DeepPath: Story = {
  args: {
    items: [
      { label: 'Inicio', path: '/' },
      { label: 'Mascotas', path: '/pets' },
      { label: 'Milo', path: '/pets/pet-001' },
      { label: 'Triage' },
    ],
  },
};

export const CompactMobile: Story = {
  render: (args) => (
    <div className="max-w-xs border border-slate-200 p-3 rounded-xl bg-slate-50 shadow-inner">
      <p className="text-[11px] font-medium text-slate-400 mb-1">Vista Móvil (Contenedor 320px):</p>
      <Breadcrumbs {...args} />
    </div>
  ),
  args: {
    items: [
      { label: 'Inicio', path: '/' },
      { label: 'Guardia 24/7', path: '/guardia' },
      { label: 'Paciente #9842', path: '/guardia/9842' },
      { label: 'Historial Clínico' },
    ],
  },
};
