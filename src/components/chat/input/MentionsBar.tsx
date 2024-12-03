import { Button } from 'components/Button'
import { useBeautifulMentions } from 'lexical-beautiful-mentions'
import { getDataAssetTypeIcon } from 'lib/utils/dataAsset'
import { Layers, LayoutGrid, NotebookText, X } from 'lucide-react'
import { useReducer } from 'react'

const MentionsBar: React.FC = () => {
  const { getMentions, removeMentions } = useBeautifulMentions()
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const getUniqueMentions = (mentions: any[]) => {
    const uniqueMentions: any[] = []
    mentions.forEach((mention) => {
      if (
        uniqueMentions.findIndex(
          (uniqueMention) => uniqueMention.value === mention.value,
        ) === -1
      ) {
        uniqueMentions.push(mention)
      }
    })
    return uniqueMentions
  }

  return (
    <div className='flex w-full max-w-full flex-row flex-wrap justify-start'>
      {getUniqueMentions(getMentions()).map((mention, index) => {
        const Icon = getDataAssetTypeIcon(mention.data.type)

        return (
          <div
            className='mb-2 mr-2 flex select-none items-center gap-2 rounded-md border px-2 py-1 text-sm'
            key={index}
          >
            <Icon className='max-h-3 min-h-3 min-w-3 max-w-3 text-foreground/70' />
            {mention.value}
            <Button
              className='h-4 w-4 items-center justify-center p-0'
              variant='ghost'
              onClick={() => {
                removeMentions({ value: mention.value, trigger: '@' })
                forceUpdate()
              }}
            >
              <X className='max-h-3 min-h-3 min-w-3 max-w-3 text-foreground/70' />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export default MentionsBar
