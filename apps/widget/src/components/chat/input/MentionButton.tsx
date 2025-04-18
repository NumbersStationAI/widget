import { MentionsMenu, MentionsMenuItem } from '@ns/ui/molecules/MentionsMenu'
import {
  type AGENT_TRIGGER,
  type ASSET_TRIGGER,
  isAssetMentionIdentifier,
  useMentionItems,
  useMentionsState,
} from '@ns/ui/utils/mentions'

import { TooltipButton } from 'components/Button'
import { Popover, PopoverContent, PopoverTrigger } from 'components/Popover'
import { useEnabledAgentNames } from 'lib/stores/customization'
import { getAccount } from 'lib/stores/user'

export type MentionButtonProps = {
  label: string
  icon: React.FC<{ className?: string }>
  trigger: typeof ASSET_TRIGGER | typeof AGENT_TRIGGER
  disabled?: boolean
}

export function MentionButton({
  label,
  icon: Icon,
  trigger,
  disabled,
}: MentionButtonProps) {
  const mentionItems = useMentionItems({
    accountName: getAccount(),
    enabledAgentNames: useEnabledAgentNames(),
  })
  const { insertMention } = useMentionsState()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <TooltipButton
          variant='outline'
          size='icon'
          tooltip={label}
          className='rounded-full'
          disabled={disabled}
        >
          <Icon className='h-4 w-4' />
        </TooltipButton>
      </PopoverTrigger>
      <PopoverContent className='p-2' asChild>
        <MentionsMenu>
          {mentionItems[trigger].map((mention) => (
            <MentionsMenuItem
              item={mention}
              key={
                isAssetMentionIdentifier(mention)
                  ? mention.short_id
                  : mention.agent_name
              }
              onClick={() => {
                insertMention({
                  trigger,
                  value: mention.value,
                  data: mention,
                })
              }}
            />
          ))}
          {mentionItems == null ? (
            <span className='px-2 text-sm'>Loading suggestions</span>
          ) : mentionItems[trigger].length === 0 ? (
            <span className='px-2 text-sm'>No suggestions</span>
          ) : null}
        </MentionsMenu>
      </PopoverContent>
    </Popover>
  )
}
