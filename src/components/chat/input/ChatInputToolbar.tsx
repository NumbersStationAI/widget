import { TooltipButton } from 'components/Button'
import { Popover, PopoverContent, PopoverTrigger } from 'components/Popover'
import { useBeautifulMentions } from 'lexical-beautiful-mentions'
import { MentionsMenu, MentionsMenuItem } from './MentionsMenu'
import FeatherIcon from 'feather-icons-react'

interface ChatInputToolbarProps {
  currentMentions: any[]
}

const ChatInputToolbar: React.FC<ChatInputToolbarProps> = ({
  currentMentions,
}) => {
  const { insertMention } = useBeautifulMentions()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <TooltipButton
          variant='ghost'
          size='icon'
          className='rounded-md'
          onClick={() => {}}
          tooltip='Add context'
        >
          <FeatherIcon icon="at-sign"/>
        </TooltipButton>
      </PopoverTrigger>
      <PopoverContent className='mb-3 w-fit p-2'>
        <MentionsMenu className='w-fit shadow-none' custom={true}>
          {currentMentions?.map((mention, index) => {
            const item = {
              data: {
                type: mention.type,
                connection_type: mention.connection_type,
                id: mention.id,
              },
              trigger: '@',
              value: mention.value,
            }
            return (
              <MentionsMenuItem
                item={item}
                label={mention.label}
                key={mention.id}
                onClick={() => insertMention(item)}
              />
            )
          })}
          {(!currentMentions || currentMentions.length === 0) && (
            <span className='px-2 text-sm'>No suggestions</span>
          )}
        </MentionsMenu>
      </PopoverContent>
    </Popover>
  )
}

export default ChatInputToolbar
