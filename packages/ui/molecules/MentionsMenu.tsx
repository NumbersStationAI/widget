import { forwardRef } from 'react'

import { AGENT_DISPLAY_NAMES, AGENT_ICONS } from '../utils/agentName'
import { cn } from '../utils/cn'
import { getDataAssetConnectionIcon } from '../utils/getDataAssetConnectionIcon'
import { getDataAssetTypeIcon } from '../utils/getDataAssetTypeIcon'
import {
  isAgentMentionData,
  isAssetMentionData,
  type MentionData,
} from '../utils/mentions'

export type MentionsMenuProps = React.HTMLAttributes<HTMLUListElement> & {
  loading?: boolean
}

export const MentionsMenu = forwardRef<HTMLUListElement, MentionsMenuProps>(
  ({ loading, className, ...props }, ref) => (
    <ul
      className={cn(
        'm-0 h-fit max-h-48 w-80 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-xl',
        loading && 'cursor-wait',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)

export type MentionsMenuItemProps<T extends MentionData> =
  React.HTMLAttributes<HTMLLIElement> & {
    selected?: boolean
    item: T
  }

export const MentionsMenuItem = forwardRef<
  HTMLLIElement,
  MentionsMenuItemProps<MentionData>
>(({ item, selected, className, ...props }, ref) => {
  let Icon
  let ConnectionIcon
  let label
  if (isAgentMentionData(item)) {
    Icon = AGENT_ICONS[item.agent_name]
    label = AGENT_DISPLAY_NAMES[item.agent_name]
  } else if (isAssetMentionData(item)) {
    Icon = getDataAssetTypeIcon(item.asset_type)
    ConnectionIcon = getDataAssetConnectionIcon(item.connection_type)
    label = item.name
  } else {
    return null
  }
  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-md bg-white px-2 py-1.5 transition-colors hover:bg-neutral-100 focus:bg-neutral-100 active:bg-neutral-100',
        selected && 'bg-neutral-100',
        className,
      )}
      ref={ref}
      {...props}
    >
      <Icon className='h-4 w-4 flex-none text-neutral-600' />
      <span className='w-0 grow truncate text-sm font-normal text-neutral-900'>
        {label}
      </span>
      {ConnectionIcon && <ConnectionIcon className='h-3 w-3 flex-none' />}
    </li>
  )
})
