import { Button } from 'components/Button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'components/Collapsible'
import MessageMarkdown from './MessageMarkdown'
import { ChevronDown } from 'lucide-react'

interface MessageSQLProps {
  sql: string
}

const MessageSQL: React.FC<MessageSQLProps> = ({ sql }) => {
  return (
    <Collapsible className='w-full'>
      <CollapsibleTrigger asChild>
        <Button
          variant='ghost'
          className='group/trigger flex items-center justify-between gap-2 rounded-lg bg-neutral-100 px-3 aria-expanded:w-full aria-expanded:rounded-b-none'
        >
          SQL
          <ChevronDown />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='w-full bg-neutral-100'>
        <MessageMarkdown className='text-xs'>{`\`\`\`sql\n${sql}\n\`\`\``}</MessageMarkdown>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default MessageSQL
