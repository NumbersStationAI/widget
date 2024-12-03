import type { Meta, StoryObj } from '@storybook/react'
import ErrorAlert from 'components/ErrorAlert'
import { Input } from 'components/Input'

const meta = {
  title: 'Lib/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['text', 'password', 'email', 'number'],
      control: { type: 'select' },
    },
  },
  args: {
    type: 'text',
    disabled: false,
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
