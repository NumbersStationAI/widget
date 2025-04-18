import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { type AgentName } from '@ns/public-api'
import { AGENT_DISPLAY_NAMES } from '@ns/ui/utils/agentName'
import { cn } from '@ns/ui/utils/cn'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from 'components/Select'
import { SuggestionsGrid } from 'components/Suggestions'
import { useEnabledAgentNames } from 'lib/stores/customization'

export const Route = createFileRoute('/_widget/prompts')({ component: Prompts })

function Prompts() {
  const [agent, setAgent] = useState<AgentName>()
  return (
    <div className='h-full w-full overflow-y-auto bg-neutral-50 p-6'>
      <div className='mx-auto flex max-w-3xl flex-col gap-2.5'>
        <header className='flex flex-col gap-3 py-4'>
          <h1 className='text-2xl font-semibold'>Prompt library</h1>
          <p className='text-sm'>
            Explore optimized prompts for a breadth of business and personal
            tasks.
          </p>
        </header>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <AgentSelect value={agent} onValueChange={setAgent} />
            <KnowledgeSelect />
          </div>
        </div>
        <SuggestionsGrid agent_name={agent} limit={100} />
      </div>
    </div>
  )
}

function AgentSelect({
  value,
  onValueChange,
}: {
  value: AgentName | undefined
  onValueChange: (value: AgentName | undefined) => void
}) {
  const all = 'all'
  return (
    <Select
      value={value ?? all}
      onValueChange={(v) =>
        onValueChange(v === all ? undefined : (v as AgentName))
      }
    >
      <SelectTrigger
        className={cn(
          'gap-2 border font-medium transition',
          value && 'border-indigo-600',
        )}
      >
        {value ? AGENT_DISPLAY_NAMES[value] : 'All agents'}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={all}>All agents</SelectItem>
        {useEnabledAgentNames().map((agentName) => (
          <SelectItem value={agentName} key={agentName}>
            {AGENT_DISPLAY_NAMES[agentName]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function KnowledgeSelect() {
  return null
}
