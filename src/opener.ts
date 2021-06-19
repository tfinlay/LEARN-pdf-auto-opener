import {getSyncSetting} from "./util";
import {SYNC_KEYS} from "./constant";

const __LEARN_PDF_opener = async () => {
    if (!(await getSyncSetting(SYNC_KEYS.CONFIG_EXPAND_EMBEDDED, true))) {
        return
    }

    console.log("LEARN PDF auto opener injected!")
    const pageObjects = document.getElementsByTagName("object");
    for (const obj of pageObjects) {
        if (obj.type === "application/pdf" && obj.data.startsWith('http')) {
            window.location.replace(obj.data);
        }
    }
};

__LEARN_PDF_opener();