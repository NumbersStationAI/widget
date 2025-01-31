import { useChatStore } from 'lib/stores/chat'
import MessageGroup from './MessageGroupView'

const OnboardingMessage: React.FC = () => {
  const { suggestions } = useChatStore()
  const message = {
    id: 'onboarding',
    sending_agent: 'planning_agent',
    render_type: 'STANDARD',
    markdown: `**Hello there, welcome to Analytics Co-pilot! 👋**

You're now connected with your dedicated AI assistant, designed to go beyond traditional chatbots. Share the details of your question, and I'll do my best to provide you with instant, insightful support. Let's get started!`,
    response_index: 0,
    chat_id: '',
    questions: suggestions,
    timestamp: new Date().toISOString(),
  }

  return (
    <MessageGroup
      messages={[message]}
      sender='system'
      showCopyActions={false}
      userMessage={message}
      isPopoverFeedbackChat={false}
    />
  )
}

export default OnboardingMessage
