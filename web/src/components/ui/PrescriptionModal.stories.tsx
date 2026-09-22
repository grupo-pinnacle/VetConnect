import type { Meta, StoryObj } from '@storybook/react';
import { PrescriptionModal } from './PrescriptionModal';

const meta: Meta<typeof PrescriptionModal> = {
  title: 'UI/PrescriptionModal',
  component: PrescriptionModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Diálogo modal accesible para redacción y emisión de recetas digitales veterinarias SENASA con validación de dosis, duración e indicaciones.',
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    consultationId: { control: 'text' },
    onClose: { action: 'closed' },
    onSuccess: { action: 'success' },
  },
};

export default meta;
type Story = StoryObj<typeof PrescriptionModal>;

export const Open: Story = {
  args: {
    isOpen: true,
    consultationId: 'cons-cl-1001',
    onClose: () => {},
    onSuccess: () => {},
  },
};

export const Submitting: Story = {
  args: {
    isOpen: true,
    consultationId: 'cons-cl-1002',
    isLoading: true,
    initialValues: {
      medication: 'Amoxicilina + Ácido Clavulánico 500mg',
      dosage: '1 comprimido',
      frequency: 'Cada 12 horas',
      durationDays: 10,
      indications: 'Administrar con el alimento para prevenir intolerancia digestiva.',
    },
    onClose: () => {},
    onSuccess: () => {},
  },
};

export const PrefilledWithHistory: Story = {
  args: {
    isOpen: true,
    consultationId: 'cons-cl-1003',
    initialValues: {
      medication: 'Cefalexina 500mg comprimidos palatables',
      dosage: '1 comprimido (30mg/kg)',
      frequency: 'Cada 12 horas',
      durationDays: 14,
      indications:
        'Tratamiento de piodermia bacteriana canina superficial. Mantener la dosis sin interrupciones durante las 2 semanas indicadas.',
    },
    onClose: () => {},
    onSuccess: () => {},
  },
};
