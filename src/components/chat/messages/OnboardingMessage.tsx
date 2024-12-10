import { useChatStore } from 'lib/stores/chat'
import MessageGroup from './MessageGroupView'

const OnboardingMessage: React.FC = () => {
  const { suggestions } = useChatStore()
  return (
    <MessageGroup
      messages={[
        {
          id: 'onboarding',
          sending_agent: 'planning_agent',
          render_type: 'STANDARD',
          markdown: `**Hello there, welcome to Analytics Co-pilot! 👋**

You’re now connected with your dedicated AI assistant, designed to go beyond traditional chatbots. Share the details of your question, and I’ll do my best to provide you with instant, insightful support. Let’s get started!`,
          response_index: 0,
          chat_id: '',
          receiving_agent: 'user',
          questions: suggestions,
          timestamp: new Date().toISOString(),
        },
      ]}
      sender='ai'
      showCopyActions={false}
    />
  )
}

export default OnboardingMessage
