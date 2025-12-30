// check whether new version is installed
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        logOnInstalledMessage(details);
    } else if (details.reason == "update") {
        logOnInstalledMessage(details, true);
        removeCache();
        var thisVersion = chrome.runtime.getManifest().version;
        var message = chrome.i18n.getMessage("common_new_version_installed") + " " + thisVersion;
        popNotification(message);
    }
});

function logOnInstalledMessage(details, updated = false) {

    if (updated) {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("[CSFD Search & Extensions] Updated from " + details.previousVersion + " to " + thisVersion + ".");
    } else {
        console.log("[CSFD Search & Extensions] First installation.");
    }
}

function removeCache() {

    chrome.storage.local.remove(["artists", "movies"], function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        } else {
            console.log("[CSFD Search & Extensions] Cache cleared.")
        }
    });
}

function popNotification(message) {

    chrome.notifications.create(
        'CSFD_Extensions_Updated', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL("img/icon_128.png"),
        title: chrome.i18n.getMessage("ext_name"),
        message: message
    },
        function () { }
    );
}