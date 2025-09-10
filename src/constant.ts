export const SHARE_URL = 'https://www.tfinlay.io/projects/learn_pdf'
export const FEEDBACK_URL = 'https://forms.gle/q8CqkXQP62b3DmEu5'

export const ALLOWED_URL_PATTERNS = [
  '*://*.learn.canterbury.ac.nz/*'
]

export const SYNC_KEYS = {
  CONFIG_EXPAND_EMBEDDED: 'configExpandEmbedded', // Boolean, whether to auto-expand embedded pdfs
  CONFIG_OPEN_FORCED_DOWNLOADS: 'configOpenForcedDownloads', // Boolean, whether to open pdfs that try to force download in the browser instead
  CONFIG_ANONYMOUS_ANALYTICS: 'configAnonymousAnalytics' // Boolean, whether to report anonymous analytics. This is no longer surfaced through the UI as Google Analytics is disabled.
}

export const LOCAL_KEYS = {
  WORK_COUNT: 'workCount',
  HAS_WELCOMED: 'hasWelcomed'
}

export const WORK_NOTIFICATION_MESSAGE_ID = '__LEARN_PDF_AUTO_OPENER_WORKED_MESSAGE'

export const DNR_RULESET_ID = "learn_force_download"