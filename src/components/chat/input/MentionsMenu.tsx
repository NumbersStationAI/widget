import {
  BeautifulMentionsMenuItemProps,
  BeautifulMentionsMenuProps,
} from 'lexical-beautiful-mentions'
import {
  getDataAssetConnectionIcon,
  getDataAssetTypeIcon,
} from 'lib/utils/dataAsset'
import { forwardRef } from 'react'

export const MentionsMenu: React.FC<BeautifulMentionsMenuProps> = ({
  loading,
  custom,
  ...props
}) => {
  return (
    <ul
    className={`fixed bottom-20 left-4 right-4 h-fit max-h-48 overflow-y-auto rounded-md border bg-white p-2 shadow-md md:w-[max-content] ${custom ? 'md:static md:bottom-0' : 'md:absolute md:bottom-16'}`}
      {...props}
    />
  )
}

export const MentionsMenuItem = forwardRef<
  HTMLLIElement,
  BeautifulMentionsMenuItemProps
>(({ selected, item, itemValue, label, ...props }, ref) => {
  const Icon = getDataAssetTypeIcon(item.data.type)
  const ConnectionIcon = getDataAssetConnectionIcon(item.data.connection_type)
  return (
    <li
      className={`m-0 flex w-full select-none items-center rounded-md p-1 text-sm ${selected ? 'bg-gray-100' : ''} hover:bg-gray-100`}
      {...props}
      ref={ref}
    >
      <Icon className='max-h-4 min-h-4 min-w-4 max-w-4 text-foreground/70' />
      <span className='mx-2 truncate max-w-[calc(100vw-96px)] md:max-w-[480px]'>
        {label}
      </span>
      <div className='flex-1' />
      <ConnectionIcon className='max-h-4 min-h-4 min-w-4 max-w-4' />
    </li>
  )
})
