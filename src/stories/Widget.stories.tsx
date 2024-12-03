import type { Meta, StoryObj } from '@storybook/react'
import Widget from 'Widget'
import { widgetContext } from 'ChatProvider'

const meta = {
  title: 'Widget/Widget',
  component: Widget,
  decorators: [
    (Story) => (
      <widgetContext.Provider
        value={{
          shrink: () => {},
          hide: () => {},
          expand: () => {},
        }}
      >
        <Story />
      </widgetContext.Provider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Widget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
