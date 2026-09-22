import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    helperText: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Nombre de la Mascota',
    placeholder: 'Ej. Milo',
    helperText: 'Ingrese el nombre tal como figura en la libreta sanitaria',
  },
};

export const WithError: Story = {
  args: {
    label: 'Número de Microchip (ISO 11784)',
    placeholder: '981098123456789',
    defaultValue: '12345',
    error: 'El microchip debe tener exactamente 15 dígitos numéricos',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Matrícula Profesional SENASA',
    defaultValue: 'MP-84920',
    disabled: true,
    helperText: 'Matrícula validada y bloqueada para edición',
  },
};
