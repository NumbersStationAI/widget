import Sidebar from './Sidebar'
import ExpandButton from './ExpandButton'
import MessageView from './MessageView'
import { useLayoutStore } from 'lib/stores/layout'
import HideButton from './HideButton'
import ChatInput from './input/ChatInput'
import NewChatButton from './NewChatButton'
import SidebarButton from './SidebarButton'

const ChatSmall: React.FC = () => {
  const { showSidebar, setShowSidebar } = useLayoutStore()

  return (
    <div className='relative flex h-full min-h-[30rem] flex-col items-center overflow-clip border border-border/50 bg-white py-4'>
      <div
        onClick={() => setShowSidebar(false)}
        className={`absolute bottom-0 left-0 right-0 top-0 z-40 bg-black/10 transition-all ${showSidebar ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <div
        className={`absolute bottom-0 top-0 z-50 w-fit max-w-[80%] transition-all ${showSidebar ? 'pointer-events-auto left-0' : 'pointer-events-none -left-[100%]'}`}
      >
        <Sidebar onChatSelected={() => setShowSidebar(false)} />
      </div>
      <div className='-m-4 flex w-full justify-between px-2 pb-6 pt-2'>
        <SidebarButton />

        <div className='flex gap-1'>
          <NewChatButton expanded={true} />
          <ExpandButton />
          <HideButton />
        </div>
      </div>
      <MessageView />
      <div className='fixed bottom-4 flex w-full items-center justify-center px-4'>
        <ChatInput />
      </div>
    </div>
  )
}

export default ChatSmall
