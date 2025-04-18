import { type Meta, type StoryObj } from '@storybook/react'

import ErrorAlert from 'components/ErrorAlert'

const meta = {
  title: 'Lib/ErrorAlert',
  component: ErrorAlert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    message: 'An error has occured',
  },
} satisfies Meta<typeof ErrorAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
