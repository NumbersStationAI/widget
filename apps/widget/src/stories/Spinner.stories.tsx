import { type Meta, type StoryObj } from '@storybook/react'

import { Spinner } from 'components/Spinner'

const meta = {
  title: 'Lib/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
