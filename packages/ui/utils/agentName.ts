import {
  ChartNoAxesCombined,
  ChartPie,
  DatabaseZap,
  FileSearch2,
  FileText,
  Ghost,
  Globe,
  Grid2x2Check,
  Logs,
  type LucideIcon,
  Mail,
  NotebookPen,
  NotepadText,
  ScanSearch,
  ScanText,
  Skull,
  SquareSigma,
  User,
} from 'lucide-react'

import { AgentName } from '@ns/public-api'

export const AGENT_DISPLAY_NAMES: Record<AgentName, string> = {
  [AgentName.user]: 'User',
  [AgentName.manager]: 'Manager',
  [AgentName.ghost]: 'Ghost',
  [AgentName['query agent']]: 'Query (deprecated)', // Bumblebee
  [AgentName.sql_query_agent]: 'Query',
  [AgentName.planner_agent]: 'Planner',
  [AgentName.search_agent]: 'Knowledge search',
  [AgentName.ssds_tool_agent]: 'Dataset tool',
  [AgentName.predictive_model_agent]: 'Predictive',
  [AgentName.vega_chart_agent]: 'Charting',
  [AgentName.file_search_agent]: 'File search',
  [AgentName.web_search_agent]: 'Web search',
  [AgentName.email_agent]: 'Email',
  [AgentName.pdf_agent]: 'PDF',
  [AgentName.research_planner_agent]: 'Research planner',
  [AgentName.research_solver_agent]: 'Research solver',
  [AgentName.research_solver_agent_for_execution]:
    'Research solver for execution',
  [AgentName.research_summary_agent]: 'Research summary',
  [AgentName.dataset_metadata_agent]: 'Dataset metadata',
}

export const AGENT_ICONS: Record<AgentName, LucideIcon> = {
  [AgentName.user]: User,
  [AgentName.manager]: Logs,
  [AgentName.ghost]: Ghost,
  [AgentName['query agent']]: Skull, // Bumblebee
  [AgentName.sql_query_agent]: Grid2x2Check,
  [AgentName.planner_agent]: NotepadText,
  [AgentName.search_agent]: ScanSearch,
  [AgentName.ssds_tool_agent]: DatabaseZap,
  [AgentName.predictive_model_agent]: ChartNoAxesCombined,
  [AgentName.vega_chart_agent]: ChartPie,
  [AgentName.file_search_agent]: FileSearch2,
  [AgentName.web_search_agent]: Globe,
  [AgentName.email_agent]: Mail,
  [AgentName.pdf_agent]: FileText,
  [AgentName.research_planner_agent]: NotebookPen,
  [AgentName.research_solver_agent]: SquareSigma,
  [AgentName.research_solver_agent_for_execution]: SquareSigma,
  [AgentName.research_summary_agent]: ScanText,
  [AgentName.dataset_metadata_agent]: ScanSearch,
}

export const AGENT_DESCRIPTIONS: Record<AgentName, string> = {
  [AgentName.user]: 'User agent',
  [AgentName.manager]: 'Manager agent',
  [AgentName.ghost]: 'Ghost agent',
  [AgentName['query agent']]: 'Query agent (deprecated)', // Bumblebee
  [AgentName.sql_query_agent]:
    'Ask complex questions in natural language and receive SQL-powered responses directly from your database.',
  [AgentName.planner_agent]: 'Planner agent',
  [AgentName.search_agent]:
    'Don’t know where to start? Ask the knowledge agent to browse through your enterprise knowledge and surface the best data assets for your needs.',
  [AgentName.ssds_tool_agent]: 'Dataset tool agent',
  [AgentName.predictive_model_agent]:
    'Run Python code on your data to generate predictions by running statistics or using models like regression or classification.',
  [AgentName.vega_chart_agent]:
    'Instantly generate customized charts, graphs, and visualizations based on natural language descriptions.',
  [AgentName.file_search_agent]: 'File search agent',
  [AgentName.web_search_agent]:
    'Search the web for additional information about the latest news to correlate with your internal knowledge.',
  [AgentName.email_agent]:
    'Send email notifications and updates to relevant parties based on significant data discoveries or changes.',
  [AgentName.research_planner_agent]: 'Deep research planner agent',
  [AgentName.research_solver_agent]:
    'Research solver agent for planning deep research',
  [AgentName.research_solver_agent_for_execution]:
    'Research solver agent for execution of deep research plans',
  [AgentName.research_summary_agent]: 'Deep research summary agent',
  [AgentName.pdf_agent]:
    'Generate a PDF summary report based on messages in a chat',
  [AgentName.dataset_metadata_agent]: 'Find the metadata for dataset',
}
