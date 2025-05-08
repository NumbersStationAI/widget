import { useNavigate } from '@tanstack/react-router'
import {
  ArrowUpRight,
  Atom,
  ChevronDown,
  Circle,
  CircleCheck,
} from 'lucide-react'
import { Fragment } from 'react'

import {
  type DeepResearchPlanVerifyParameters,
  InstructionState,
  type ResearchInstruction,
} from '@ns/public-api'
import { Button } from '@ns/ui/atoms/Button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ns/ui/atoms/Collapsible'
import { Spinner } from '@ns/ui/atoms/Spinner'
import { MessageMarkdown } from '@ns/ui/molecules/MessageMarkdown'
import { cn } from '@ns/ui/utils/cn'

import { useChatStore } from 'lib/stores/chat'
import { useLayoutStore } from 'lib/stores/layout'
import { usePanelChatStore } from 'lib/stores/panelChat'
import { getAccount } from 'lib/stores/user'

export function DeepResearchPlan({
  plan,
  isStreaming = false,
}: {
  plan: DeepResearchPlanVerifyParameters
  isStreaming?: boolean
}) {
  const { sendMessage } = useChatStore()
  const { toggleRightPanel, rightPanelOpen, viewportWidth } = useLayoutStore()
  const {
    setActiveInstructionId,
    setActiveinstructionName,
    fetchStreamingMessages,
    activeInstructionId,
  } = usePanelChatStore()
  const navigate = useNavigate({ from: '/chats' })

  const inProgress = plan.plan_steps.some((step) =>
    step.instructions?.some(
      (instruction) => instruction.status === InstructionState.in_progress,
    ),
  )

  const isStepComplete = (step: (typeof plan.plan_steps)[0]): boolean => {
    if (!step.instructions?.length) return false
    return step.instructions.every(
      (instruction) => instruction.status === InstructionState.completed,
    )
  }

  const isResearchPending = plan.plan_steps.some((step) =>
    step.instructions?.some(
      (instruction) => instruction.status === InstructionState.pending,
    ),
  )

  const instructionOnclick = (instruction: ResearchInstruction) => {
    setActiveInstructionId(instruction.instruction_id)
    setActiveinstructionName(instruction.instruction)
    fetchStreamingMessages(instruction.instruction_id)
    if (!rightPanelOpen) {
      toggleRightPanel()
    }
  }

  return (
    <div className='w-full'>
      <Collapsible defaultOpen>
        <div className='w-full overflow-hidden rounded-xl border border-neutral-200 p-2'>
          <CollapsibleTrigger asChild>
            <button
              type='button'
              className='group/deep-research flex w-full items-center justify-between gap-2 p-2 text-sm font-medium'
            >
              <div className='flex items-center gap-3 text-indigo-600'>
                {isStreaming ? (
                  <Spinner size={0.5} />
                ) : (
                  <Atom className='h-4 w-4' />
                )}
                <span className={cn(isStreaming && 'animate-pulse')}>
                  {!isResearchPending ? 'Deep research' : 'Deep research plan'}
                </span>
                {inProgress ? (
                  <span className='animate-pulse text-neutral-600'>
                    Thinking
                  </span>
                ) : !isResearchPending ? (
                  <span className='text-neutral-600'>Completed</span>
                ) : null}
              </div>
              <ChevronDown className='h-4 w-4 transition group-aria-expanded/deep-research:rotate-180' />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='bg-white px-3'>
              <div className='py-2 text-lg font-bold'>
                {plan?.plan_title || 'Preparing research plan...'}
              </div>
              <div className='py-2 text-sm'>{plan?.plan_goal || ''}</div>
              {plan?.plan_steps.map((step, stepIndex) => (
                <Fragment key={JSON.stringify(step.section_header)}>
                  <div className='flex items-center gap-3'>
                    {isStepComplete(step) ? (
                      <CircleCheck className='h-4 w-4 flex-shrink-0 fill-black text-white' />
                    ) : (
                      <Circle className='h-4 w-4 flex-shrink-0 fill-neutral-300 text-neutral-300' />
                    )}
                    <div className='text-base/10 font-semibold'>
                      Part {stepIndex + 1}: {step.section_header}
                    </div>
                  </div>
                  {step.instructions?.map((instruction) => (
                    <div
                      key={instruction.instruction_id}
                      className={cn(
                        'ml-1.5 pb-4 pl-6',
                        stepIndex < (plan?.plan_steps.length ?? 0) - 1 &&
                          `border-l-2 ${isStepComplete(step) ? 'border-black' : 'border-neutral-200'}`,
                      )}
                    >
                      <div
                        className={cn(
                          'flex gap-3',
                          instruction.status === InstructionState.in_progress &&
                            'rounded-lg border border-neutral-300 p-2',
                          instruction.instruction_id === activeInstructionId &&
                            'm-1 rounded-lg border-2 border-neutral-400 bg-neutral-100 p-2',
                        )}
                      >
                        {instruction.status === InstructionState.in_progress ? (
                          <div className='mt-1'>
                            <Spinner size={0.4} />
                          </div>
                        ) : instruction.status ===
                          InstructionState.completed ? (
                          <CircleCheck className='mt-1 h-4 w-4 flex-shrink-0 fill-black text-white' />
                        ) : (
                          <Circle className='mt-1 h-4 w-4 flex-shrink-0 fill-neutral-300 text-neutral-300' />
                        )}
                        <div className='flex flex-1 items-start justify-between'>
                          <MessageMarkdown
                            accountName={getAccount()}
                            viewportWidth={viewportWidth}
                            className='text-sm/6'
                          >
                            {instruction.instruction}
                          </MessageMarkdown>
                          {instruction.status !== InstructionState.pending && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => instructionOnclick(instruction)}
                              className={cn(
                                instruction.instruction_id ===
                                  activeInstructionId && 'bg-neutral-100',
                              )}
                            >
                              {instruction.status ===
                                InstructionState.in_progress ||
                              instruction.instruction_id ===
                                activeInstructionId ? (
                                <ArrowUpRight className='h-5 w-5 stroke-[5px]' />
                              ) : instruction.status ===
                                InstructionState.completed ? (
                                <ArrowUpRight className='h-2 w-2 stroke-2 text-neutral-400 hover:stroke-[4px]' />
                              ) : null}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </Fragment>
              ))}
              {!isStreaming && isResearchPending && (
                <div className='flex justify-end'>
                  <Button
                    variant='default'
                    disabled={isStreaming}
                    onClick={() => {
                      sendMessage('start research', true)
                      navigate({
                        search: (prev) => ({ ...prev, deepResearch: false }),
                      })
                    }}
                  >
                    Start research
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
