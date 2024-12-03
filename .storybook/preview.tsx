import type { Preview } from '@storybook/react'
import '../src/index.css'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { editorConfig } from '../src/components/chatEditorConfig'
import React from 'react'

const preview: Preview = {
  decorators: [
    (Story) => {
      return React.createElement(LexicalComposer, {
        initialConfig: editorConfig,
        children: React.createElement(TooltipProvider, {
          children: React.createElement(Story),
        }),
      })
    },
  ],
  parameters: {
    // previewTabs: {
    //   docs: { hidden: true },
    // },
    // tags: ['!autodocs'],
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
