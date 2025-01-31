export const API_URL =
  process.env.REACT_APP_NS_API_URL ||
  window?.frameElement?.getAttribute('data-api-url') ||
  'https://api.numbersstation.ai/api'

export const APP_URL =
  process.env.REACT_APP_NS_APP_URL ||
  window?.frameElement?.getAttribute('data-app-url') ||
  'https://app.numbersstation.ai'
