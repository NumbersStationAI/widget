import { useMemo } from 'react'
import { create } from 'zustand'

import { AgentName } from '@ns/public-api'

type CustomizationState = {
  showAttachFileButton: boolean
  showDeepResearchButton: boolean
  showOpenInFullButton: boolean
  showExpandButton: boolean
  showMinimizeButton: boolean
  showInput: boolean
  showCopyLinkButton: boolean
  showCopyIdButton: boolean
  showPromptLibrary: boolean
  showAgentTagging: boolean

  searchAgent: boolean
  sqlQueryAgent: boolean
  predictiveModelAgent: boolean
  vegaChartAgent: boolean
  emailAgent: boolean
  fileSearchAgent: boolean
  webSearchAgent: boolean
}

type CustomizationStore = {
  state: CustomizationState
  setState: (value: CustomizationState) => void
}

export const defaultState: CustomizationState = {
  showAttachFileButton: false,
  showDeepResearchButton: false,
  showOpenInFullButton: true,
  showExpandButton: true,
  showMinimizeButton: true,
  showInput: true,
  showCopyLinkButton: true,
  showCopyIdButton: false,
  showPromptLibrary: false,
  showAgentTagging: true,

  searchAgent: true,
  sqlQueryAgent: true,
  predictiveModelAgent: false,
  vegaChartAgent: true,
  emailAgent: false,
  fileSearchAgent: false,
  webSearchAgent: false,
}

export const useCustomizationStore = create<CustomizationStore>()((set) => ({
  state: defaultState,
  setState: (value) => set({ state: value }),
}))

export function useEnabledAgentNames() {
  const { state } = useCustomizationStore()
  return useMemo(() => {
    const enabledAgents: AgentName[] = []
    if (state.searchAgent) enabledAgents.push(AgentName.search_agent)
    if (state.sqlQueryAgent) enabledAgents.push(AgentName.sql_query_agent)
    if (state.predictiveModelAgent)
      enabledAgents.push(AgentName.predictive_model_agent)
    if (state.vegaChartAgent) enabledAgents.push(AgentName.vega_chart_agent)
    if (state.emailAgent) enabledAgents.push(AgentName.email_agent)
    if (state.fileSearchAgent) enabledAgents.push(AgentName.file_search_agent)
    if (state.webSearchAgent) enabledAgents.push(AgentName.web_search_agent)
    return enabledAgents
  }, [state])
}
