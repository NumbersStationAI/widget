import type { Meta, StoryObj } from '@storybook/react'
import { Button } from 'components/Button'
import ChatView from 'components/chat/ChatView'
import ErrorAlert from 'components/ErrorAlert'

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
