import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { nanoid } from 'nanoid'
import { forwardRef } from 'react'

import {
  AgentName,
  type GetSuggestionsForAccountQueryParams,
  type SuggestionApi,
  useGetSuggestionsForAccount,
} from '@ns/public-api'
import { AGENT_DESCRIPTIONS, AGENT_DISPLAY_NAMES } from '@ns/ui/utils/agentName'
import { cn } from '@ns/ui/utils/cn'
import { ASSET_TRIGGER } from '@ns/ui/utils/mentions'

import { Alert, AlertDescription, AlertTitle } from 'components/Alert'
import { Button } from 'components/Button'
import { Spinner } from 'components/Spinner'
import { useChatStore } from 'lib/stores/chat'
import { useCustomizationStore } from 'lib/stores/customization'
import { getAccount } from 'lib/stores/user'

import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'

const suggestedAgentNames = [
  AgentName.sql_query_agent,
  AgentName.search_agent,
  AgentName.web_search_agent,
  AgentName.predictive_model_agent,
  AgentName.vega_chart_agent,
  AgentName.email_agent,
]

export function Suggestions({ className }: { className?: string }) {
  const {
    state: { showPromptLibrary },
  } = useCustomizationStore()
  return (
    <TabsPrimitive.Root
      defaultValue={suggestedAgentNames[0]}
      className={cn('mx-auto flex max-w-3xl flex-col gap-2.5', className)}
    >
      <header className='flex flex-col gap-2 pt-4'>
        <h1 className='text-2xl font-semibold'>
          Unleash insights faster with AI agents
        </h1>
        <div className='flex min-h-8 flex-col items-start justify-between gap-2 sm:flex-row'>
          <p className='text-base text-neutral-600'>
            Write your own prompt or choose a curated one
          </p>
          {showPromptLibrary && (
            <Button
              size='sm'
              variant='outline'
              className='no-underline'
              asChild
            >
              <Link to='/prompts' search>
                More prompts
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          )}
        </div>
      </header>
      <SuggestionsGrid limit={4} />
    </TabsPrimitive.Root>
  )
}

export function SuggestionsGrid(params: GetSuggestionsForAccountQueryParams) {
  const {
    data: suggestions,
    isPending,
    error,
  } = useGetSuggestionsForAccount({
    accountName: getAccount(),
    params,
  })
  return isPending ? (
    <div className='flex items-center justify-center gap-2 p-6'>
      <Spinner size={0.4} />
      Getting suggestions
    </div>
  ) : error ? (
    <Alert variant='destructive' className='w-full self-start'>
      <AlertTitle>Failed to get suggestions</AlertTitle>
      <AlertDescription>{(error as Error).message}</AlertDescription>
    </Alert>
  ) : (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
      {suggestions.map((suggestion) => (
        <SuggestionsGridItem suggestion={suggestion} key={nanoid()} />
      ))}
    </div>
  )
}

function SuggestionsGridItem({ suggestion }: { suggestion: SuggestionApi }) {
  const {
    state: { showAgentTagging },
  } = useCustomizationStore()
  const { sendMessage } = useChatStore()
  const assetTag = `[${suggestion.asset_name}](ds-${suggestion.short_id})`
  const message = `${suggestion.prompt} ${ASSET_TRIGGER}${assetTag}`
  return (
    <button
      type='button'
      onClick={() => sendMessage(message)}
      className='flex flex-col items-start justify-between gap-6 rounded-lg border border-neutral-200 bg-white p-4 text-left transition hover:border-primary focus:border-primary'
    >
      <span className='line-clamp-2 min-h-10 text-sm font-normal text-neutral-900'>
        {suggestion.prompt}
      </span>
      <div className='flex w-full items-center justify-between gap-4'>
        {showAgentTagging && <AgentMention name={suggestion.agent_name} />}
        <AssetMention name={suggestion.asset_name} />
      </div>
    </button>
  )
}

function AgentMention({ name }: { name: AgentName }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Mention className='flex-none bg-indigo-50 text-indigo-600'>
          @{AGENT_DISPLAY_NAMES[name]}
        </Mention>
      </TooltipTrigger>
      <TooltipContent className='max-w-xs'>
        <p className='font-semibold'>{AGENT_DISPLAY_NAMES[name]} agent</p>
        <p>{AGENT_DESCRIPTIONS[name]}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function AssetMention({ name }: { name: string }) {
  return (
    <Mention className='ml-auto w-0 max-w-fit grow bg-blue-50 text-blue-600'>
      <span className='max-w-full truncate'>#{name}</span>
    </Mention>
  )
}

type MentionProps = React.HTMLAttributes<HTMLDivElement>

const Mention = forwardRef<HTMLDivElement, MentionProps>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn(
        'flex h-6 items-center rounded-md px-1.5 text-xs',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
)
