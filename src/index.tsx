import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { WidgetProvider } from './ChatProvider'
import App from './App'
import { Toaster } from 'components/Toast'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { editorConfig } from 'components/chatEditorConfig'
import { TooltipProvider } from 'components/Tooltip'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <WidgetProvider>
    <TooltipProvider>
      <LexicalComposer initialConfig={editorConfig}>
        <App />
        <Toaster />
      </LexicalComposer>
    </TooltipProvider>
  </WidgetProvider>,
)
