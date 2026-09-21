import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Iniciar Videoconsulta',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Guardia Médica 24/7',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Ver Historial Clínico',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Cancelar Triaje',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Conectando con LiveKit...',
  },
};
