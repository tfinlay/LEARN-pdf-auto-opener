import {
  ALLOWED_URL_PATTERNS,
  ANALYTICS,
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

    private static async pingAnalyticsIfNecessary (type?: WorkType) {
      if (await getSyncSetting(SYNC_KEYS.CONFIG_ANONYMOUS_ANALYTICS, true)) {
        let typeString: string
        switch (type) {
          case WorkType.AVOID_DOWNLOAD:
            typeString = ANALYTICS.eventTypeSkipDownload
            break
          case WorkType.EXPAND:
            typeString = ANALYTICS.eventTypeExpand
            break
          default:
            typeString = 'unknown'
        }

        const res = await fetch('https://www.google-analytics.com/collect', {
          method: 'POST',
          credentials: 'omit',
          body: `v=1&tid=${ANALYTICS.trackingId}&cid=${ANALYTICS.clientId}&aip=1&ds=add-on&t=event&ec=${ANALYTICS.eventCategory}&ea=${typeString}`
        })

        if (res.ok) {
          console.log('Successfully sent ping to analytics.')
        } else {
          console.warn('Failed to send ping to analytics.')
        }
      }
    }

    public registerWork (type?: WorkType): void {
      console.log('Registering work...')
      this.helpNotificationBufferCount++
      this.saveIfNecessary()
      void BackgroundWorkSaver.pingAnalyticsIfNecessary(type)
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
      void updateDnrRule()
    }
  })
}

void main()
