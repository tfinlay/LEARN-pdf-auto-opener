import { getSyncSetting } from './util'
import { SYNC_KEYS, WORK_NOTIFICATION_MESSAGE_ID } from './constant'


(async () => {
  if (!(await getSyncSetting(SYNC_KEYS.CONFIG_EXPAND_EMBEDDED, true))) {
    return
  }

  console.log('LEARN PDF auto opener injected!');
  const iframe = document.querySelector('iframe#resourceobject');
  if (iframe && iframe.src.startsWith('http')) {
      await chrome.runtime.sendMessage(WORK_NOTIFICATION_MESSAGE_ID);
      window.location.replace(iframe.src);
  }
})()

