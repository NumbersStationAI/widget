import { type Meta, type StoryObj } from '@storybook/react'

import { Sidebar } from 'components/chat/Sidebar'

const meta = {
  title: 'Chat/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    onChatSelected: () => {},
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
