import type { Meta, StoryObj } from '@storybook/react'
import ProgressMessages from 'components/chat/messages/ProgressMessages'
import VegaEmbed from 'components/chat/messages/VegaEmbed'

const meta = {
  title: 'Chat/Messages/ProgressMessages',
  component: ProgressMessages,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    messages: [
      {
        id: 'b4693297-a3a8-4498-baf6-7ff7cd3414b6',
        response_index: 0,
        chat_id: 'b12ccb66-f28e-4882-8757-ed4e59f7e549',
        render_type: 'TEMPORARY',
        signal_type: null,
        sending_agent: 'manager',
        receiving_agent: 'user',
        timestamp: '2024-11-18T15:50:53.782800Z',
        markdown: 'Invoking the SQL agent on dataset `Retail Sales`',
        questions: null,
        sql: null,
        embedded_viz_url: null,
        options: null,
        selected_option: null,
        vega_spec: null,
        table_data: null,
        message_table_id: null,
      },
      {
        id: '423b1f39-4304-4db2-abbd-b8d3c2eda502',
        response_index: 0,
        chat_id: 'b12ccb66-f28e-4882-8757-ed4e59f7e549',
        render_type: 'TEMPORARY',
        signal_type: null,
        sending_agent: 'manager',
        receiving_agent: 'user',
        timestamp: '2024-11-18T15:50:53.865761Z',
        markdown: 'Searching your metadata',
        questions: null,
        sql: null,
        embedded_viz_url: null,
        options: null,
        selected_option: null,
        vega_spec: null,
        table_data: null,
        message_table_id: null,
      },
      {
        id: 'e8df7895-ae34-48d7-80df-50f5b372122e',
        response_index: 0,
        chat_id: 'b12ccb66-f28e-4882-8757-ed4e59f7e549',
        render_type: 'TEMPORARY',
        signal_type: null,
        sending_agent: 'manager',
        receiving_agent: 'user',
        timestamp: '2024-11-18T15:51:01.195332Z',
        markdown: 'Querying your warehouse',
        questions: null,
        sql: null,
        embedded_viz_url: null,
        options: null,
        selected_option: null,
        vega_spec: null,
        table_data: null,
        message_table_id: null,
      },
      {
        id: '4c2fe0c1-95ab-4203-9de8-38551dafad77',
        response_index: 0,
        chat_id: 'b12ccb66-f28e-4882-8757-ed4e59f7e549',
        render_type: 'TEMPORARY',
        signal_type: null,
        sending_agent: 'manager',
        receiving_agent: 'user',
        timestamp: '2024-11-18T15:51:05.330074Z',
        markdown: 'Explaining the Query',
        questions: null,
        sql: null,
        embedded_viz_url: null,
        options: null,
        selected_option: null,
        vega_spec: null,
        table_data: null,
        message_table_id: null,
      },
    ],
  },
} satisfies Meta<typeof ProgressMessages>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}