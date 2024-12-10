import type { Meta, StoryObj } from '@storybook/react'
import ChatView from 'components/chat/ChatView'

const meta = {
  title: 'Chat/ChatExpanded',
  component: ChatView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof ChatView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    expanded: true,
    onExpandClick: () => {},
  },
}
