import {
  $createTextNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
  type LexicalNode,
  type TextNode,
} from 'lexical'
import {
  $createBeautifulMentionNode,
  type BeautifulMentionsItem,
  useBeautifulMentions,
} from 'lexical-beautiful-mentions'
import { useMemo } from 'react'

import {
  AgentName,
  type DataAssetApi,
  dataAssetApiSchema,
  useGetDataAssetsForAccount,
} from '@ns/public-api'

import { AGENT_DISPLAY_NAMES } from './agentName'

const DEFAULT_PUNCTUATION =
  '\\.,\\*\\?\\$\\|#{}\\(\\)\\^\\[\\]\\\\/!%\'"~=<>_:;'

// Strings that can trigger the mention menu.
const TRIGGERS = (triggers: string[]) => `(?:${triggers.join('|')})`

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = (triggers: string[], punctuation: string) => {
  const lookahead = triggers.length === 0 ? '' : `(?!${triggers.join('|')})`
  return `${lookahead}[^${punctuation}]`
}

// This is the limit that the lexical-beautiful-mentions library imposes on
// mention value lengths. Dataset names should not be longer than 75 characters.
// I'm not sure if we enforce this yet in the backend, but we likely should. If
// they are longer than 75 characters, we may run into weird UI behavior.
// ref: https://github.com/sodenn/lexical-beautiful-mentions/blob/main/plugin/src/mention-utils.ts#L72
const LENGTH_LIMIT = 75

// The shortened_id()s from the backend will be 8-character base64 encoded
// strings (ref: https://stackoverflow.com/q/475074).
const SHORT_ID = '[-A-Za-z0-9+/_]{8}'

// RegExp for valid agent names.
const AGENT_NAME = Object.values(AgentName).join('|')

// We use '@' to tag agents and '#' to tag data assets.
export const AGENT_TRIGGER = '@'
export const ASSET_TRIGGER = '#'

// The identifier is stored in the database (as markdown) and extracted when
// prepopulating input values.
export type AssetMentionIdentifier = { name: string; short_id: string }
export type AgentMentionIdentifier = { name: string; agent_name: string }
export type MentionIdentifier = AssetMentionIdentifier | AgentMentionIdentifier

export function isAssetMentionIdentifier(
  data: unknown,
): data is AssetMentionIdentifier {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof data.name === 'string' &&
    'short_id' in data &&
    typeof data.short_id === 'string'
  )
}

export function isAgentMentionIdentifier(
  data: unknown,
): data is AgentMentionIdentifier {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof data.name === 'string' &&
    'agent_name' in data &&
    typeof data.agent_name === 'string' &&
    Object.values(AgentName).includes(data.agent_name as AgentName)
  )
}

// The data is not stored but fetched from the API at runtime and used when
// adding new mentions.
export type AssetMentionData = DataAssetApi
export type AgentMentionData = { agent_name: AgentName }
export type MentionData = AssetMentionData | AgentMentionData

export function isAssetMentionData(data: unknown): data is AssetMentionData {
  return dataAssetApiSchema.safeParse(data).success
}

export function isAgentMentionData(data: unknown): data is AgentMentionData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'agent_name' in data &&
    typeof data.agent_name === 'string' &&
    Object.values(AgentName).includes(data.agent_name as AgentName)
  )
}

export function useMentionsState(): ReturnType<typeof useBeautifulMentions> {
  return useBeautifulMentions()
}

export function useMentionItems({
  accountName,
  enabledAgentNames,
}: {
  accountName: string
  enabledAgentNames?: AgentName[]
}) {
  const { data: assets } = useGetDataAssetsForAccount({
    accountName,
    params: { limit: 500 },
  })
  const mentionItems = useMemo(
    () => ({
      [ASSET_TRIGGER]: (assets?.data ?? []).map((asset) => {
        const mentionItem = {
          value: asset.name,
          ...asset,
        } satisfies BeautifulMentionsItem & MentionIdentifier & MentionData
        return mentionItem
      }),
      [AGENT_TRIGGER]: (enabledAgentNames ?? []).map((agentName) => {
        const mentionItem = {
          value: AGENT_DISPLAY_NAMES[agentName],
          name: AGENT_DISPLAY_NAMES[agentName],
          agent_name: agentName,
        } satisfies BeautifulMentionsItem & MentionIdentifier & MentionData
        return mentionItem
      }),
    }),
    [assets, enabledAgentNames],
  )
  return mentionItems
}

type MentionEntry = MentionIdentifier & {
  type: 'mention'
  trigger: string
  value: string
}

type TextEntry = {
  type: 'text'
  value: string
}

type Entry = MentionEntry | TextEntry

type Match = MentionIdentifier & { mention: string; index: number }

function findMentions(
  text: string,
  triggers: string[],
  punctuation: string,
): Match[] {
  const expr = `(?<=\\s|^|\\()${TRIGGERS(triggers)}\\[((?:${VALID_CHARS(
    triggers,
    punctuation,
  )}){1,${LENGTH_LIMIT}})\\]\\((agent|ds)-(${AGENT_NAME}|${SHORT_ID})\\)`
  const regex = new RegExp(expr, 'g')
  const matches: Match[] = []
  let match: RegExpExecArray | null
  regex.lastIndex = 0
  /* eslint-disable-next-line no-cond-assign */
  while ((match = regex.exec(text)) !== null) {
    const [mention, name, mentionType, mentionId] = match
    if (mentionType === 'agent') {
      const identifier: AgentMentionIdentifier = {
        name,
        agent_name: mentionId,
      }
      matches.push({ ...identifier, mention, index: match.index })
    } else if (mentionType === 'ds') {
      const identifier: AssetMentionIdentifier = {
        name,
        short_id: mentionId,
      }
      matches.push({ ...identifier, mention, index: match.index })
    } else {
      throw new Error(`Invalid mention type (${mentionType})!`)
    }
  }
  return matches
}

export function convertToMentionEntries(
  text: string,
  triggers: string[],
  punctuation: string,
): Entry[] {
  const matches = findMentions(text, triggers, punctuation)

  const result: Entry[] = []
  let lastIndex = 0

  matches.forEach(({ mention, index, ...dataAsset }) => {
    // Add text before mention
    if (index > lastIndex) {
      const textBeforeMention = text.substring(lastIndex, index)
      result.push({ type: 'text', value: textBeforeMention })
    }
    // Add mention
    const triggerRegExp = triggers.find((trigger) =>
      new RegExp(trigger).test(mention),
    )

    const match = triggerRegExp && new RegExp(triggerRegExp).exec(mention)
    if (!match) {
      // should never happen since we only find mentions with the given triggers
      throw new Error('No trigger found for mention')
    }
    const trigger = match[0]

    result.push({
      type: 'mention',
      value: dataAsset.name,
      trigger,
      ...dataAsset,
    })
    // Update lastIndex
    lastIndex = index + mention.length
  })

  // Add text after last mention
  if (lastIndex < text.length) {
    const textAfterMentions = text.substring(lastIndex)
    result.push({ type: 'text', value: textAfterMentions })
  }

  return result
}

/**
 * Utility function that takes a string or a text nodes and converts it to a
 * list of mention and text nodes.
 *
 * 🚨 Only works for mentions without spaces. Ensure spaces are disabled
 *  via the `allowSpaces` prop.
 */
export function $convertToMentionNodes(
  textOrNode: string | TextNode,
  triggers: string[],
  punctuation = DEFAULT_PUNCTUATION,
) {
  const text =
    typeof textOrNode === 'string' ? textOrNode : textOrNode.getTextContent()
  const entries = convertToMentionEntries(text, triggers, punctuation)
  const nodes: LexicalNode[] = []
  entries.forEach((entry) => {
    if (entry.type === 'text') {
      const textNode = $createTextNode(entry.value)
      if (typeof textOrNode !== 'string') {
        textNode.setFormat(textOrNode.getFormat())
      }
      nodes.push(textNode)
    } else {
      const data: MentionIdentifier = isAssetMentionIdentifier(entry)
        ? { name: entry.name, short_id: entry.short_id }
        : { name: entry.name, agent_name: entry.agent_name }
      nodes.push($createBeautifulMentionNode(entry.trigger, entry.value, data))
    }
  })
  return nodes
}

/**
 * Transforms text nodes containing mention strings into mention nodes.
 *
 *  🚨 Only works for mentions without spaces. Ensure spaces are disabled
 *  via the `allowSpaces` prop.
 */
export function $transformTextToMentionNodes(
  triggers: string[],
  punctuation = DEFAULT_PUNCTUATION,
) {
  const traverseNodes = (nodes: LexicalNode[]) => {
    nodes.forEach((node) => {
      if ($isTextNode(node)) {
        const newNodes = $convertToMentionNodes(node, triggers, punctuation)
        if (newNodes.length > 1) {
          const parent = node.getParent()
          const index = node.getIndexWithinParent()
          parent?.splice(index, 1, newNodes)
        }
      } else if ($isElementNode(node)) {
        traverseNodes(node.getChildren())
      }
    })
  }
  traverseNodes($getRoot().getChildren())
}
