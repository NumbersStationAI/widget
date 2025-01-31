import { useFeedbackStore } from 'lib/stores/feedback';
import { FeedbackChatInput } from './FeedbackChatInput';
import { FeedbackChatView } from './FeedbackChatView';

export function FeedbackView() {
    const feedbackChatId = useFeedbackStore(state => state.feedbackChatId);
    if (!feedbackChatId) {
        return <div>No feedback chat selected</div>;
    }
    return (
        <div className='flex h-full w-full flex-col items-center justify-between overflow-clip'>
            <div className='flex-1 w-full overflow-y-auto'>
                <FeedbackChatView feedbackChatId={feedbackChatId} />
            </div>
            <div className='w-full px-4 py-2'>
                <FeedbackChatInput />
            </div>
        </div>
    )
}
