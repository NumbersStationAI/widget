import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from 'components/Button'

const meta = {
  title: 'Lib/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: [
        'default',
        'outline',
        'link',
        'destructive',
        'secondary',
        'ghost',
      ],
      control: { type: 'select' },
    },
  },
  args: {
    variant: 'default',
    disabled: false,
    children: 'Button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
