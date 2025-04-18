import { type Meta, type StoryObj } from '@storybook/react'

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
