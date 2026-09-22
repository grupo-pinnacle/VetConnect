import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './ChatMessage';
import { Message } from '../../types';

const mockTextMessage: Message = {
  id: 'msg-1',
  consultationId: 'cons-100',
  senderId: 'vet-1',
  content: 'Buenas tardes. Estoy revisando la respiración de Milo. ¿Podrías enfocar la cámara hacia su tórax?',
  clientMsgId: 'client-msg-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sender: {
    id: 'vet-1',
    firstName: 'Dra. Valentina',
    lastName: 'Gómez',
    role: 'VET',
  },
};

const mockImageMessage: Message = {
  id: 'msg-2',
  consultationId: 'cons-100',
  senderId: 'client-1',
  content: 'Aquí le adjunto la foto macroscópica de la lesión en la patita derecha.',
  attachmentUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
  clientMsgId: 'client-msg-2',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sender: {
    id: 'client-1',
    firstName: 'Martín',
    lastName: 'Pérez',
    role: 'CLIENT',
  },
};

const meta: Meta<typeof ChatMessage> = {
  title: 'UI/ChatMessage',
  component: ChatMessage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatMessage>;

export const IncomingText: Story = {
  args: {
    message: mockTextMessage,
    isOwn: false,
  },
};

export const OutgoingWithImage: Story = {
  args: {
    message: mockImageMessage,
    isOwn: true,
    onImageClick: (url) => alert(`Abrir zoom de imagen: ${url}`),
  },
};
