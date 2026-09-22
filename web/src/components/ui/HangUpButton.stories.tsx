import type { Meta, StoryObj } from '@storybook/react';
import { HangUpButton } from './HangUpButton';

const meta: Meta<typeof HangUpButton> = {
  title: 'UI/HangUpButton',
  component: HangUpButton,
  tags: ['autodocs'],
  argTypes: {
    isLoading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof HangUpButton>;

export const Default: Story = {
  args: {
    onHangUp: () => alert('Finalizando consulta médica...'),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    onHangUp: () => {},
  },
};
