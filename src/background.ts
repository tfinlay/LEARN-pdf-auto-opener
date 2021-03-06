import {browser, WebRequest} from "webextension-polyfill-ts";
import {ALLOWED_URL_PATTERNS, ANALYTICS, LOCAL_KEYS, SYNC_KEYS, WORK_NOTIFICATION_MESSAGE_ID} from "./constant";
import {getSyncSetting} from "./util";

enum WorkType {
    EXPAND,
    AVOID_DOWNLOAD
}

class BackgroundWorkSaver {
    private helpNotificationBufferCount: number = 0
    private saveInFlight = false

    private static async saveWork (helpCount: number): Promise<void> {
        const currentWorkCount = (await browser.storage.local.get(LOCAL_KEYS.WORK_COUNT))[LOCAL_KEYS.WORK_COUNT]
        const newWorkCount = (currentWorkCount ?? 0) + helpCount

        await browser.storage.local.set({
            [LOCAL_KEYS.WORK_COUNT]: newWorkCount
        })

        console.log(`Saved work count ${newWorkCount}`)
    }

    private saveIfNecessary(): void {
        if (!this.saveInFlight && this.helpNotificationBufferCount !== 0) {
            this.saveInFlight = true
            BackgroundWorkSaver.saveWork(this.helpNotificationBufferCount).then(r => {
                this.saveInFlight = false
                this.saveIfNecessary()
            })
            this.helpNotificationBufferCount = 0
        }
    }

    private static async pingAnalyticsIfNecessary(type?: WorkType) {
        if (await getSyncSetting(SYNC_KEYS.CONFIG_ANONYMOUS_ANALYTICS, true)) {
            let typeString
            switch (type) {
                case WorkType.AVOID_DOWNLOAD:
                    typeString = ANALYTICS.eventTypeSkipDownload
                    break
                case WorkType.EXPAND:
                    typeString = ANALYTICS.eventTypeExpand
                    break
                default:
                    typeString = "unknown"
            }

            const res = await fetch(`https://www.google-analytics.com/collect`, {
                method: "POST",
                credentials: "omit",
                body: `v=1&tid=${ANALYTICS.trackingId}&cid=${ANALYTICS.clientId}&aip=1&ds=add-on&t=event&ec=${ANALYTICS.eventCategory}&ea=${typeString}`
            })

            if (res.ok) {
                console.log("Successfully sent ping to analytics.")
            }
            else {
                console.warn("Failed to send ping to analytics.")
            }
        }
    }

    public registerWork(type?: WorkType): void {
        console.log("Registering work...")
        this.helpNotificationBufferCount ++;
        this.saveIfNecessary()
        BackgroundWorkSaver.pingAnalyticsIfNecessary(type)
    }

    constructor() {
        browser.runtime.onMessage.addListener((message, sender) => {
            if (message === WORK_NOTIFICATION_MESSAGE_ID) {
                this.registerWork(WorkType.EXPAND)
            }
        })
    }
}

const workSaver = new BackgroundWorkSaver()

let shouldIntercept = false

const onHeadersReceived = (requestDetails: WebRequest.OnHeadersReceivedDetailsType) => {
    if (!shouldIntercept) {
        return
    }

    console.log(`Intercepted request of type ${requestDetails.type} to ${requestDetails.url}`);
    const headers: WebRequest.HttpHeadersItemType[] = requestDetails.responseHeaders ?? []
    const contentType = headers.find(
        (header) => header.name.toLowerCase() === 'content-type'
    )

    if (contentType !== undefined && contentType.value.toLowerCase() === 'application/pdf') {
        console.log("Intercepted PDF request...")
        const dispositionHeader = headers.findIndex(
            (header) => header.name.toLowerCase() === 'content-disposition'
        )
        if (dispositionHeader !== undefined && /attachment;/.test(headers[dispositionHeader].value)) {
            console.log(`Caught Content-Disposition: ${headers[dispositionHeader].value}`)
            headers.splice(dispositionHeader, 1)
            workSaver.registerWork(WorkType.AVOID_DOWNLOAD)
        }
        return {responseHeaders: headers}
    }
}

const getShouldBind = async () => {
    return await getSyncSetting(SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS, true)
}

const main = async () => {
    shouldIntercept = await getShouldBind()

    browser.webRequest.onHeadersReceived.addListener(
        onHeadersReceived,
        {
            urls: ALLOWED_URL_PATTERNS,
            types: ["main_frame"]
        },
        ["blocking", "responseHeaders"]
    )
    console.log("Bound onHeadersReceived")


    browser.storage.onChanged.addListener((changes, namespace) => {
        if (changes.hasOwnProperty(SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS)) {
            shouldIntercept = changes[SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS].newValue
        }
    })
}

main()