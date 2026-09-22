import type { Meta, StoryObj } from '@storybook/react';
import { PetCard } from './PetCard';
import { Pet } from '../../types';

const mockPet: Pet = {
  id: 'pet-123',
  ownerId: 'owner-456',
  name: 'Milo',
  species: 'CANINE',
  breed: 'Labrador Retriever',
  sex: 'MALE',
  weightKg: 28.5,
  microchip: '981098123456789',
  allergies: 'Alérgico al pollo',
  chronicConditions: null,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

const meta: Meta<typeof PetCard> = {
  title: 'UI/PetCard',
  component: PetCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PetCard>;

export const Default: Story = {
  args: {
    pet: mockPet,
  },
};

export const Selected: Story = {
  args: {
    pet: mockPet,
    selected: true,
  },
};

export const WithAction: Story = {
  args: {
    pet: mockPet,
    onRequestConsultation: (pet) => alert(`Solicitar consulta para ${pet.name}`),
  },
};
