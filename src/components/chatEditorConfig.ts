import { BeautifulMentionNode } from 'lexical-beautiful-mentions'

export const editorConfig = {
  namespace: 'Chat Input',
  theme: {
    beautifulMentions: {
      '@': 'bg-[#EFF5FF] text-[#3B82F6] w-fit px-1 rounded-sm',
      '@Focused': 'shadow-md outline-2 outline outline-[#3B82F6]',
    },
  },
  onError: (error: any) => {
    console.error(error)
  },
  nodes: [BeautifulMentionNode],
}
