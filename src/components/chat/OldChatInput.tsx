import React, { useState } from 'react'
import { ReactComponent as Send } from 'lib/icons/send.svg'
import { ReactComponent as Database } from 'lib/icons/database.svg'
import { Input } from 'components/Input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from 'components/Select'

interface Props {
  onSubmit: (query: string, dataset: string) => void
}

const OldChatInput: React.FC<Props> = ({ onSubmit }) => {
  const [query, setQuery] = useState('')
  const [selectedDataset, setSelectedDataset] = useState('Banking Customers')

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query, selectedDataset)
      setQuery('') // Clear the input after submitting
    }
  }

  return (
    <div className='flex min-w-[250px] flex-col items-center gap-3 rounded-lg border border-[#4F46E5] p-2 shadow-lg'>
      <div className='flex w-full flex-row items-center gap-2'>
        <Input
          type='text'
          placeholder='Ask follow-up'
          className='flex-1 border-none px-1 py-1 focus-visible:ring-0'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className='flex aspect-square h-8 min-w-8 items-center justify-center rounded-lg bg-[#818CF8] text-white focus:outline-none focus-visible:ring-transparent'
        >
          <Send />
        </button>
      </div>

      <div className='flex w-full items-center gap-2 px-1'>
        <p className='text-sm'>Dataset</p>
        <Select>
          <SelectTrigger className='w-[200px]'>
            <div className='flex items-center gap-2'>
              <Database />
              <SelectValue placeholder='Dataset' />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Dataset</SelectLabel>
              <SelectItem value='apple'>Banking Customers</SelectItem>
              <SelectItem value='banana'>Banana</SelectItem>
              <SelectItem value='blueberry'>Blueberry</SelectItem>
              <SelectItem value='grapes'>Grapes</SelectItem>
              <SelectItem value='pineapple'>Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default OldChatInput
