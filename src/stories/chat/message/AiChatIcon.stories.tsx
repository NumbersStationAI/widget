import type { Meta, StoryObj } from '@storybook/react'

import { ReactComponent as AiChatIcon } from 'lib/icons/ai-chat.svg'

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
