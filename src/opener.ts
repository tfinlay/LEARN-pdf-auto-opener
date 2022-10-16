import { getSyncSetting } from './util'
import { SYNC_KEYS, WORK_NOTIFICATION_MESSAGE_ID } from './constant'


(async () => {
  if (!(await getSyncSetting(SYNC_KEYS.CONFIG_EXPAND_EMBEDDED, true))) {
    return
  }

  console.log('LEARN PDF auto opener injected!')
  const pageObjects = document.getElementsByTagName('object')
  for (const obj of pageObjects) {
    if (obj.type === 'application/pdf' && obj.data.startsWith('http')) {
      await chrome.runtime.sendMessage(WORK_NOTIFICATION_MESSAGE_ID)
      window.location.replace(obj.data)
    }
  }
})()
