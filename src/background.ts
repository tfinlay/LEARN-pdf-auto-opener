import {browser, WebRequest} from "webextension-polyfill-ts";
import {ALLOWED_URL_PATTERNS, SYNC_KEYS} from "./constant";
import {getSyncSetting} from "./util";

const onHeadersReceived = async (requestDetails: WebRequest.OnHeadersReceivedDetailsType) => {
    if (!(await getShouldBind())) {
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
        }
        return {responseHeaders: headers}
    }
}

const getShouldBind = async () => {
    return await getSyncSetting(SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS, true)
}

const main = async () => {
    if (await getShouldBind()) {
        browser.webRequest.onHeadersReceived.addListener(
            onHeadersReceived,
            {
                urls: ALLOWED_URL_PATTERNS,
                types: ["main_frame"]
            },
            ["blocking", "responseHeaders"]
        )
        console.log("Bound onResponseStarted!")
    }
}

main()