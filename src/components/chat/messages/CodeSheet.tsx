import { Button, TooltipButton } from 'components/Button'
import { Markdown } from 'components/Markdown'
import { Sheet, SheetClose, SheetContent } from 'components/Sheet'
import { Code, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CodeSheetProps {
  code: string
  language: string
}

const CodeSheet: React.FC<CodeSheetProps> = ({ code, language }) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={(value) => setOpen(value)}>
      <TooltipButton
        size='icon'
        variant='ghost'
        tooltip='View source'
        onClick={() => setOpen(true)}
      >
        <Code />
      </TooltipButton>
      <SheetContent className='flex w-full max-w-[42rem] flex-col p-0 sm:w-[50vw]'>
        <div className='flex items-center gap-2 border-b px-4 py-2'>
          <p>{language}</p>
          <div className='flex-1' />
          <Button
            size='icon'
            variant='ghost'
            onClick={() => {
              navigator.clipboard.writeText(code)
              toast('SQL copied to clipboard')
            }}
          >
            <Copy />
          </Button>
          <SheetClose className='p-2' />
        </div>
        <div className='h-full max-h-full w-full max-w-full overflow-auto'>
          <Markdown className='w-full text-xs'>{`\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``}</Markdown>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CodeSheet
