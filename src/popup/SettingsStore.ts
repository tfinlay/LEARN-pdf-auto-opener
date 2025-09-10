import { makeAutoObservable, runInAction } from 'mobx'
import { SYNC_KEYS } from '../constant'
import { LoadStatus, LoadStatusDone, LoadStatusError, LoadStatusLoading, LoadStatusNotBegun } from './LoadStatus'

/**
 * MobX store behind the settings UI. This handles reading and writing configuration changes.
 * For added fun these reads and writes are asynchronous so each setting is paired with a LoadStatus to track this.
 */
export class SettingsStore {
    hasMadeSettingsChanges = false

    expandEmbedded?: boolean
    openForcedDownloads?: boolean

    expandEmbeddedLoadStatus: LoadStatus = new LoadStatusNotBegun()
    openForcedDownloadsLoadStatus: LoadStatus = new LoadStatusNotBegun()

    constructor () {
      makeAutoObservable(this)

      this.fetchExpandEmbedded()
      this.fetchOpenForcedDownloads()
    }

    resetHasMadeSettingsChanges () {
      this.hasMadeSettingsChanges = false
    }

    async setExpandEmbedded (value: boolean, internal?: boolean) {
      await chrome.storage.sync.set({
        [SYNC_KEYS.CONFIG_EXPAND_EMBEDDED]: value
      })

      runInAction(() => {
        if (!internal) {
          this.hasMadeSettingsChanges = true
        }
        this.expandEmbedded = value
        this.expandEmbeddedLoadStatus = new LoadStatusDone()
      })
    }

    async fetchExpandEmbedded () {
      this.expandEmbedded = undefined
      this.expandEmbeddedLoadStatus = new LoadStatusLoading()
      try {
        const res = await chrome.storage.sync.get(SYNC_KEYS.CONFIG_EXPAND_EMBEDDED)
        runInAction(() => {
          if (res.hasOwnProperty(SYNC_KEYS.CONFIG_EXPAND_EMBEDDED)) {
            this.expandEmbedded = res[SYNC_KEYS.CONFIG_EXPAND_EMBEDDED]
            this.expandEmbeddedLoadStatus = new LoadStatusDone()
          } else {
            this.expandEmbeddedLoadStatus = new LoadStatusError('Key is not defined. Setting...')
            this.setExpandEmbedded(true, true)
          }
        })
      } catch (e) {
        runInAction(() => {
          this.expandEmbeddedLoadStatus = new LoadStatusError(e)
        })
        throw e
      }
    }

    async setOpenForcedDownloads (value: boolean, internal?: boolean) {
      await chrome.storage.sync.set({
        [SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS]: value
      })
      runInAction(() => {
        if (!internal) {
          this.hasMadeSettingsChanges = true
        }
        this.openForcedDownloads = value
        this.openForcedDownloadsLoadStatus = new LoadStatusDone()
      })
    }

    async fetchOpenForcedDownloads () {
      this.openForcedDownloads = undefined
      this.openForcedDownloadsLoadStatus = new LoadStatusLoading()
      try {
        const res = await chrome.storage.sync.get(SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS)
        runInAction(() => {
          if (SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS in res) {
            this.openForcedDownloads = res[SYNC_KEYS.CONFIG_OPEN_FORCED_DOWNLOADS]
            this.openForcedDownloadsLoadStatus = new LoadStatusDone()
          } else {
            this.openForcedDownloadsLoadStatus = new LoadStatusError('Key is not defined. Setting...')
            this.setOpenForcedDownloads(true, true)
          }
        })
      } catch (e) {
        runInAction(() => {
          this.openForcedDownloadsLoadStatus = new LoadStatusError(e)
        })
        throw e
      }
    }
}
