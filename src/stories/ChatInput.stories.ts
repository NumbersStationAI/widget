import type { Meta, StoryObj } from '@storybook/react'
import ChatInput from 'components/chat/input/ChatInput'

const meta = {
  title: 'Chat/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof ChatInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
