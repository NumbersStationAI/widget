import type { Meta, StoryObj } from '@storybook/react'
import VegaEmbed from 'components/chat/messages/VegaEmbed'

const meta = {
  title: 'Chat/Messages/VegaEmbed',
  component: VegaEmbed,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    spec: 'https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json',
  },
} satisfies Meta<typeof VegaEmbed>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
