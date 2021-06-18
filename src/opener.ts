import {browser} from "webextension-polyfill-ts";

const __LEARN_PDF_opener = () => {
    console.log("LEARN PDF auto opener injected!")

    browser.storage.sync.get();

    const pageObjects = document.getElementsByTagName("object");
    for (const obj of pageObjects) {
        if (obj.type === "application/pdf" && obj.data.startsWith('http')) {
            window.location.replace(obj.data);
        }
    }
};

__LEARN_PDF_opener();