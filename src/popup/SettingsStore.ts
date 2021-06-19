import {makeAutoObservable, runInAction} from "mobx";
import {browser} from "webextension-polyfill-ts";
import {SYNC_KEYS} from "../constant";
import {LoadStatus, LoadStatusDone, LoadStatusError, LoadStatusLoading, LoadStatusNotBegun} from "./LoadStatus";

export class SettingsStore {
    hasMadeSettingsChanges: boolean = false

    expandEmbedded?: boolean
    openForcedDownloads?: boolean
    analytics?: boolean

    expandEmbeddedLoadStatus: LoadStatus = new LoadStatusNotBegun()
    openForcedDownloadsLoadStatus: LoadStatus = new LoadStatusNotBegun()
    analyticsLoadStatus: LoadStatus = new LoadStatusNotBegun()


    constructor() {
        makeAutoObservable(this)

        this.fetchExpandEmbedded()
        this.fetchOpenForcedDownloads()
        this.fetchAnalytics()
    }

    resetHasMadeSettingsChanges() {
        this.hasMadeSettingsChanges = false
    }

    async setExpandEmbedded(value: boolean) {
        await browser.storage.sync.set({
            [SYNC_KEYS.CONFIG_EXPAND_EMBEDDED]: value
        })

        runInAction(() => {
            this.hasMadeSettingsChanges = true
            this.expandEmbedded = value
            this.expandEmbeddedLoadStatus = new LoadStatusDone()
        })
    }

    async fetchExpandEmbedded() {
        this.expandEmbedded = undefined
        this.expandEmbeddedLoadStatus = new LoadStatusLoading()
        try {
            const res = await browser.storage.sync.get(SYNC_KEYS.CONFIG_EXPAND_EMBEDDED)
            runInAction(() => {
                if (res.hasOwnProperty(SYNC_KEYS.CONFIG_EXPAND_EMBEDDED)) {
                    this.expandEmbedded = res[SYNC_KEYS.CONFIG_EXPAND_EMBEDDED]
                    this.expandEmbeddedLoadStatus = new LoadStatusDone()
                }
                else {
                    this.expandEmbeddedLoadStatus = new LoadStatusError("Key is not defined. Setting...");
                    this.setExpandEmbedded(true)
                }
            })
        } catch (e) {
            runInAction(() => {
                this.expandEmbeddedLoadStatus = new LoadStatusError(e)
            })
            throw e
        }
    }

    async setOpenForcedDownloads(value: boolean) {
        await browser.storage.sync.set({
            [SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS]: value
        })
        runInAction(() => {
            this.hasMadeSettingsChanges = true
            this.openForcedDownloads = value
            this.openForcedDownloadsLoadStatus = new LoadStatusDone()
        })
    }

    async fetchOpenForcedDownloads() {
        this.openForcedDownloads = undefined
        this.openForcedDownloadsLoadStatus = new LoadStatusLoading()
        try {
            const res = await browser.storage.sync.get(SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS)
            runInAction(() => {
                if (SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS in res) {
                    this.openForcedDownloads = res[SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS]
                    this.openForcedDownloadsLoadStatus = new LoadStatusDone()
                }
                else {
                    this.openForcedDownloadsLoadStatus = new LoadStatusError("Key is not defined. Setting...");
                    this.setOpenForcedDownloads(true)
                }
            })
        } catch (e) {
            runInAction(() => {
                this.openForcedDownloadsLoadStatus = new LoadStatusError(e)
            })
            throw e
        }
    }

    async setAnalytics(value: boolean) {
        await browser.storage.sync.set({
            [SYNC_KEYS.CONFIG_ANONYMOUS_ANALYTICS]: value
        })
        runInAction(() => {
            this.hasMadeSettingsChanges = true
            this.analytics = value
            this.analyticsLoadStatus = new LoadStatusDone()
        })
    }

    async fetchAnalytics() {
        this.analytics = undefined
        this.analyticsLoadStatus = new LoadStatusLoading()
        try {
            const res = await browser.storage.sync.get(SYNC_KEYS.CONFIG_ANONYMOUS_ANALYTICS)
            runInAction(() => {
                if (SYNC_KEYS.CONFIG_ANONYMOUS_ANALYTICS in res) {
                    this.analytics = res[SYNC_KEYS.CONFIG_ANONYMOUS_ANALYTICS]
                    this.analyticsLoadStatus = new LoadStatusDone()
                }
                else {
                    this.analyticsLoadStatus = new LoadStatusError("Key is not defined. Setting...");
                    this.setAnalytics(true)
                }
            })
        } catch (e) {
            runInAction(() => {
                this.analyticsLoadStatus = new LoadStatusError(e)
            })
            throw e
        }
    }
}