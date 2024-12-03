import type { Meta, StoryObj } from '@storybook/react'
import NewChatButton from 'components/chat/NewChatButton'

const meta = {
  title: 'Chat/NewChatButton',
  component: NewChatButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: { expanded: true },
} satisfies Meta<typeof NewChatButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
