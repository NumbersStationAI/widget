import { type Meta, type StoryObj } from '@storybook/react'

import AiChatIcon from 'lib/icons/ai-chat.svg?react'

const meta = {
  title: 'Chat/Messages/AiChatIcon',
  component: AiChatIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof AiChatIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
