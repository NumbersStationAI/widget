import MarkdownLib, { type MarkdownToJSX } from 'markdown-to-jsx'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { cn } from 'lib/utils'
import { codeStyle } from './codeStyle'

interface HighlightedCodeProps {
  children: string
  inline: boolean
  className?: string
}

interface PreProps {
  children: string
}

const Pre: React.FC<PreProps> = ({ children }) => {
  return <>{children}</>
}
interface CodeProps {
  children: string
}

const Code: React.FC<CodeProps> = ({ children }) => {
  return <code className='not-prose text-sm'>{children}</code>
}

const HighlightedCode: React.FC<HighlightedCodeProps> = ({
  className,
  inline,
  children,
}) => {
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

const WrapperPre: React.FC<{ children: string }> = ({ children }) => {
  return <pre className='not-prose w-min-fit px-6 py-2'>{children}</pre>
}

const Link: React.FC<{ href: string; children: string }> = ({
  href,
  children,
}) => {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary underline'
    >
      {children}
    </a>
  )
}

const options: MarkdownToJSX.Options = {
  // forceWrapper: true,
  disableParsingRawHTML: true,
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
}: React.PropsWithChildren<{ className?: string }>) {
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
      options={options}
    >
      {children}
    </MarkdownLib>
  )
}
