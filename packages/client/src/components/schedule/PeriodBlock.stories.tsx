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
      name: "3",
      time: "10:00 - 10:45"
    },
    index: 1
  }
};