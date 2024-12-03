import type { Meta, StoryObj } from '@storybook/react'
import Tableau from 'components/chat/messages/Tableau'
import VegaEmbed from 'components/chat/messages/VegaEmbed'

const meta = {
  title: 'Chat/Messages/Tableau',
  component: Tableau,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    url: 'https://public.tableau.com/views/Superstore_embedded_800x800/Overview',
  },
} satisfies Meta<typeof Tableau>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
