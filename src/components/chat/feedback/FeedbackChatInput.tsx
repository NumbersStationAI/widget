import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    INSERT_PARAGRAPH_COMMAND,
    KEY_ENTER_COMMAND,
} from 'lexical'
import { clearFeedbackContent, getFeedbackContent, useFeedbackStore } from 'lib/stores/feedback'
import { useCallback, useEffect } from 'react'
import SendButton from '../SendButton'

const feedbackEditorConfig = {
    namespace: 'FeedbackEditor',
    onError: (error: Error) => {
        console.error('Feedback Editor Error:', error)
    },
    nodes: [],
    theme: {
        text: {
            bold: 'font-bold',
            italic: 'italic',
            underline: 'underline',
            strikethrough: 'line-through',
            underlineStrikethrough: 'underline line-through',
        },
    }
}

function Editor() {
    const [editor] = useLexicalComposerContext()
    const {
        feedbackChatId,
        loadingFeedbackMessages,
        setFeedbackEditor,
        sendFeedbackMessage,
        inputState,
        updateDisabledState,
    } = useFeedbackStore()

    useEffect(() => {
        setFeedbackEditor(editor)
        updateDisabledState(feedbackChatId || '')

        const unregister = editor.registerTextContentListener(() => {
            updateDisabledState(feedbackChatId || '')
        })

        return () => {
            unregister()
        }
    }, [editor, feedbackChatId, setFeedbackEditor, updateDisabledState])

    const handleSend = useCallback(async () => {
        if (!feedbackChatId || inputState.get(feedbackChatId) === 'loading') return

        const content = getFeedbackContent()?.trim()
        if (!content) return

        try {
            clearFeedbackContent()
            await sendFeedbackMessage(content)
        } catch (error) {
            console.error('Error sending feedback:', error)
        }
    }, [feedbackChatId, inputState, sendFeedbackMessage])

    const handleSubmit = useCallback(
        (keyboardCommand = false) => {
            if (
                inputState.get(feedbackChatId || '') === 'loading' ||
                loadingFeedbackMessages
            ) return
            handleSend()
        },
        [handleSend, inputState, loadingFeedbackMessages, feedbackChatId]
    )

    useEffect(() => {
        return editor.registerCommand<KeyboardEvent | null>(
            KEY_ENTER_COMMAND,
            (event) => {
                const selection = $getSelection()
                if (!$isRangeSelection(selection)) {
                    return false
                }
                if (event !== null) {
                    event.preventDefault()
                    if (event.shiftKey) {
                        return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
                    }
                }
                handleSubmit(true)
                return true
            },
            COMMAND_PRIORITY_LOW,
        )
    }, [editor, handleSubmit])

    return (
        <div className='flex w-full flex-row items-end justify-between gap-2'>
            <div className='relative h-fit w-full min-w-[10rem]'>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            placeholder={
                                <div className='pointer-events-none absolute left-0 top-0 w-full select-none overflow-hidden overflow-ellipsis whitespace-nowrap text-foreground/50'>
                                    Type your feedback...
                                </div>
                            }
                            aria-placeholder='Type your feedback...'
                            className='relative max-h-14 min-h-7 w-full resize-none overflow-y-auto leading-6 outline-0 focus-visible:outline-none'
                        />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <AutoFocusPlugin />
            </div>
            <div className='flex h-full items-end'>
                <SendButton
                    state={inputState.get(feedbackChatId || '') ?? 'send'}
                    onSubmit={() => handleSubmit(false)}
                />
            </div>
        </div>
    )
}

export function FeedbackChatInput() {
    return (
        <LexicalComposer initialConfig={feedbackEditorConfig}>
            <div className='mr-3 flex w-full min-w-[15rem] max-w-full flex-col items-center rounded-lg border border-border bg-white px-3 py-2'>
                <Editor />
                <HistoryPlugin />
            </div>
        </LexicalComposer>
    )
}
