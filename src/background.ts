/**
 * This file is executed as a background service worker. It has two jobs:
 * 1. Synchronising configuration changes (updateDnrRule)
 * 2. Analytics logging (everything related to BackgroundWorkSaver)
 */
import {
  ALLOWED_URL_PATTERNS,
  DNR_RULESET_ID,
  LOCAL_KEYS,
  SYNC_KEYS,
  WORK_NOTIFICATION_MESSAGE_ID
} from './constant'
import { getSyncSetting } from './util'

console.log('Starting...')

enum WorkType {
    EXPAND,
    AVOID_DOWNLOAD
}

class BackgroundWorkSaver {
    private helpNotificationBufferCount = 0
    private saveInFlight = false

    private static async saveWork (helpCount: number): Promise<void> {
      const currentWorkCount = (await chrome.storage.local.get(LOCAL_KEYS.WORK_COUNT))[LOCAL_KEYS.WORK_COUNT] as number | null | undefined
      const newWorkCount = (currentWorkCount ?? 0) + helpCount

      await chrome.storage.local.set({
        [LOCAL_KEYS.WORK_COUNT]: newWorkCount
      })

      console.log(`Saved work count ${newWorkCount}`)
    }

    private saveIfNecessary (): void {
      if (!this.saveInFlight && this.helpNotificationBufferCount !== 0) {
        this.saveInFlight = true
        void BackgroundWorkSaver.saveWork(this.helpNotificationBufferCount).then(_ => {
          this.saveInFlight = false
          this.saveIfNecessary()
        })
        this.helpNotificationBufferCount = 0
      }
    }

    public registerWork (type?: WorkType): void {
      console.log('Registering work...')
      this.helpNotificationBufferCount++
      this.saveIfNecessary()
    }

    constructor () {
      chrome.runtime.onMessage.addListener((message, sender) => {
        if (message === WORK_NOTIFICATION_MESSAGE_ID) {
          this.registerWork(WorkType.EXPAND)
        }
        return false
      })
    }
}

const workSaver = new BackgroundWorkSaver()

// No convenient type (in chrome-types) is available for res, so any has to be used here unfortunately...
const onHeadersReceived = async (res) => {
  /* eslint-disable */
  if (await getShouldBind()) {
    const headers = res.responseHeaders ?? []
    const contentTypeIndex = headers.findIndex(
      (header) => header.name.toLowerCase() === 'content-disposition'
    )

    if (res.method === 'GET' && res.url.includes(".pdf") && contentTypeIndex !== -1 && headers[contentTypeIndex].value.includes("attachment;")) {
      // With any luck, our DNR rule has just transformed this attachment into an inline. Let's count that as a win.
      workSaver.registerWork(WorkType.AVOID_DOWNLOAD)
    }
  }
}

const getShouldBind = async () => {
  return await getSyncSetting(SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS, true)
}

const updateDnrRule = async () => {
  const shouldIntercept = await getShouldBind()
  await chrome.declarativeNetRequest.updateEnabledRulesets({
    disableRulesetIds: (shouldIntercept) ? [] : [DNR_RULESET_ID],
    enableRulesetIds: (shouldIntercept) ? [DNR_RULESET_ID] : []
  })
}

const main = async () => {
  await updateDnrRule()

  chrome.webRequest.onHeadersReceived.addListener(
    (res) => {
      void onHeadersReceived(res)

      // Make ESLint happy by explicitly returning undefined here.
      return undefined
    },
  {
        urls: ALLOWED_URL_PATTERNS,
        types: ["main_frame"]
      },
      ["responseHeaders"]
  )
  console.log("Bound onHeadersReceived")

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (Object.hasOwn(changes, SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS)) {
      // The UI has enabled/disabled the "open forced downloads" option. We need to pass that setting through to DNR.
      void updateDnrRule()
    }
  })
}

void main()
