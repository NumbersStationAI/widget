import { cn } from 'lib/utils'
import { Markdown } from 'components/Markdown'

interface MessageMarkdownProps {
  className?: string
  children: string
}

const MessageMarkdown: React.FC<MessageMarkdownProps> = ({
  className,
  children,
}) => {
  return (
    <Markdown
      className={cn(
        'prose prose-sm prose-neutral max-w-none text-primary prose-blockquote:font-medium prose-blockquote:not-italic prose-strong:font-bold prose-pre:rounded-md prose-pre:p-0',
        className,
      )}
    >
      {children}
    </Markdown>
  )
}

export default MessageMarkdown
