import { Suggestion } from 'lib/models/suggestions'
import { useChatStore } from 'lib/stores/chat'
import { ChevronRight } from 'lucide-react'

interface SuggestionItemProps {
  suggestion: Suggestion
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion }) => {
  const { sendMessage } = useChatStore()

  return (
    <button
      className='flex max-w-[486px] items-center justify-between gap-2 rounded-md border px-3 py-2 hover:bg-[hsl(var(--foreground)_/_0.02);]'
      onClick={() => {
        sendMessage(
          `${suggestion.prompt} @[${suggestion.asset_name}](${suggestion.asset_id})`,
        )
      }}
    >
      <div className='flex flex-col gap-2'>
        <p className='text-left text-[1rem]'>{suggestion.prompt}</p>
        <p className='w-fit rounded-sm bg-[#EFF5FF] px-1 text-[#3B82F6]'>
          {' '}
          {suggestion.asset_name}
        </p>
      </div>
      <ChevronRight />
    </button>
  )
}

export default SuggestionItem
