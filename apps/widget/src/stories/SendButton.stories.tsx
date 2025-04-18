import { type Meta, type StoryObj } from '@storybook/react'

import SendButton from 'components/chat/SendButton'

const meta = {
  title: 'Chat/SendButton',
  component: SendButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      options: ['send', 'interrupt', 'disabled'],
      control: { type: 'select' },
    },
  },
  args: {
    state: 'send',
  },
} satisfies Meta<typeof SendButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    state: 'send',
  },
}
