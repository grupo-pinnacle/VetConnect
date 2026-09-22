import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'success',
        'warning',
        'danger',
        'info',
        'neutral',
        'online',
        'offline',
        'verde',
        'amarillo',
        'rojo',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const TriageVerde: Story = {
  args: {
    variant: 'verde',
    children: 'Prioridad Baja (Verde)',
  },
};

export const TriageAmarillo: Story = {
  args: {
    variant: 'amarillo',
    children: 'Prioridad Media (Amarillo)',
  },
};

export const TriageRojo: Story = {
  args: {
    variant: 'rojo',
    children: 'Urgencia Crítica (Rojo)',
  },
};

export const Online: Story = {
  args: {
    variant: 'online',
    children: 'En Guardia Online',
  },
};

export const Offline: Story = {
  args: {
    variant: 'offline',
    children: 'Desconectado',
  },
};
