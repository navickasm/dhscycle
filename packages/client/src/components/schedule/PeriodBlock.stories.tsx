import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PeriodBlock from './PeriodBlock';

const meta = {
  component: PeriodBlock,
} satisfies Meta<typeof PeriodBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    period: {
      period: "EB",
      start: "07:14",
      end: "08:35"
    },
    index: 1
  }
};