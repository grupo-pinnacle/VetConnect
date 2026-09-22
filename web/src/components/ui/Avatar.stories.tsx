import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'busy', 'offline'],
    },
    src: { control: 'text' },
    alt: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const DefaultPet: Story = {
  args: {
    alt: 'Milo Labrador',
    size: 'md',
  },
};

export const VetOnline: Story = {
  args: {
    alt: 'Dra. Valentina Gómez',
    size: 'lg',
    status: 'online',
  },
};

export const SmallOffline: Story = {
  args: {
    alt: 'Simba Gato',
    size: 'sm',
    status: 'offline',
  },
};
