const searchParams = window?.location
  ? new URLSearchParams(window.location.search)
  : null

// Ensure we have backwards compatibility with old `data-api-url` options that
// included the trailing `/api` path by removing it here if it exists.
export const API_URL =
  searchParams?.get('apiUrl')?.replace(/\/api$/, '') || __API_URL__

export const APP_URL = searchParams?.get('appUrl') || __APP_URL__
