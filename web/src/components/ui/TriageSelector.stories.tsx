import type { Meta, StoryObj } from '@storybook/react';
import { TriageSelector } from './TriageSelector';

const meta: Meta<typeof TriageSelector> = {
  title: 'UI/TriageSelector',
  component: TriageSelector,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'select',
      options: ['VERDE', 'AMARILLO', 'ROJO'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TriageSelector>;

export const PrioridadVerde: Story = {
  args: {
    value: 'VERDE',
    onChange: (val) => console.log('Triage priority:', val),
  },
};

export const PrioridadAmarilla: Story = {
  args: {
    value: 'AMARILLO',
    onChange: (val) => console.log('Triage priority:', val),
  },
};

export const PrioridadRoja: Story = {
  args: {
    value: 'ROJO',
    onChange: (val) => console.log('Triage priority:', val),
  },
};

export const Disabled: Story = {
  args: {
    value: 'AMARILLO',
    disabled: true,
    onChange: () => {},
  },
};
