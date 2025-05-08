import MarkdownLib, { type MarkdownToJSX } from 'markdown-to-jsx'
import { useMemo } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'

import { cn } from '../utils/cn'
import { codeStyle } from '../utils/codeStyle'

interface HighlightedCodeProps {
  children: string
  className?: string
}

interface PreProps {
  children: string
}

function Pre({ children }: PreProps) {
  return <>{children}</>
}
interface CodeProps {
  children: string
}

function Code({ children }: CodeProps) {
  return <code className='not-prose text-sm'>{children}</code>
}

function HighlightedCode({ className, children }: HighlightedCodeProps) {
  const language = className ? className.replace('lang-', '') : 'text'
  return (
    <SyntaxHighlighter
      language={language.toLowerCase()}
      style={codeStyle}
      PreTag={Pre}
      CodeTag={Code}
    >
      {children}
    </SyntaxHighlighter>
  )
}

function WrapperPre({ children }: { children: string }) {
  return (
    <pre className='not-prose w-min-fit text-wrap px-6 py-2'>{children}</pre>
  )
}

function Link({ href, children }: { href: string; children: string }) {
  try {
    const url = new URL(href)
    return (
      <a
        href={url.href}
        target='_blank'
        rel='noopener noreferrer'
        className='text-primary underline'
      >
        {children}
      </a>
    )
  } catch (error) {
    return <span>{children}</span>
  }
}

const defaultOptions: MarkdownToJSX.Options = {
  overrides: {
    code: {
      component: HighlightedCode,
    },
    pre: {
      component: WrapperPre,
    },
    a: {
      component: Link,
    },
  },
}

export function Markdown({
  className,
  children,
  options,
}: React.PropsWithChildren<{
  className?: string
  options?: MarkdownToJSX.Options
}>) {
  const opts = useMemo(
    () => ({
      ...defaultOptions,
      ...options,
      overrides: { ...defaultOptions.overrides, ...options?.overrides },
    }),
    [options],
  )
  if (typeof children !== 'string') {
    /* eslint-disable-next-line no-console */
    console.warn(
      `<Markdown> component was passed a non-string child!. Child was of type: ${typeof children}`,
    )
    return <>{children}</>
  }
  return (
    <MarkdownLib
      className={cn(
        'break-words [&>:first-child]:mt-0 [&>:last-child]:mb-0',
        className,
      )}
      options={opts}
    >
      {children}
    </MarkdownLib>
  )
}
