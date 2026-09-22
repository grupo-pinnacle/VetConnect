import type { Meta, StoryObj } from '@storybook/react';
import { ReviewModal } from './ReviewModal';

const meta: Meta<typeof ReviewModal> = {
  title: 'UI/ReviewModal',
  component: ReviewModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Modal de valoración médica posterior a la teleconsulta (ADR-023) con selector interactivo de 1 a 5 estrellas, navegación por teclado y feedback cualitativo.',
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    consultationId: { control: 'text' },
    initialRating: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    initialComment: { control: 'text' },
    isLoading: { control: 'boolean' },
    onClose: { action: 'closed' },
    onSuccess: { action: 'success' },
  },
};

export default meta;
type Story = StoryObj<typeof ReviewModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    consultationId: 'cons-cl-8891',
    initialRating: 0,
    initialComment: '',
    onClose: () => {},
    onSuccess: () => {},
  },
};

export const FiveStarsSelected: Story = {
  args: {
    isOpen: true,
    consultationId: 'cons-cl-8892',
    initialRating: 5,
    initialComment:
      'La Dra. Valenzuela atendió a Milo con una calidez excepcional. Nos explicó cada indicación del tratamiento para su gastroenteritis y evacuó todas nuestras dudas con suma paciencia.',
    onClose: () => {},
    onSuccess: () => {},
  },
};

export const Submitting: Story = {
  args: {
    isOpen: true,
    consultationId: 'cons-cl-8893',
    initialRating: 4,
    initialComment: 'Excelente atención profesional y puntualidad.',
    isLoading: true,
    onClose: () => {},
    onSuccess: () => {},
  },
};
