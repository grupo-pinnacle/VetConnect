import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Skeleton,
  PetCardSkeleton,
  ConsultationQueueSkeleton,
  PrescriptionDocSkeleton,
} from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Esqueletos visuales clínicos (Skeleton Loaders) para prevención de saltos de maquetación (CLS = 0) durante la resolución asíncrona de datos médicos.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const BaseSkeleton: Story = {
  render: () => (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 max-w-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  ),
};

export const PetCardLoading: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
      <PetCardSkeleton />
      <PetCardSkeleton />
      <PetCardSkeleton />
    </div>
  ),
};

export const ConsultationQueueLoading: Story = {
  render: () => (
    <div className="max-w-3xl">
      <ConsultationQueueSkeleton rows={3} />
    </div>
  ),
};

export const PrescriptionDocLoading: Story = {
  render: () => (
    <div className="flex justify-center p-4 bg-slate-100">
      <PrescriptionDocSkeleton />
    </div>
  ),
};
