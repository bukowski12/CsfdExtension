// Variables
var extensionVersion = chrome.runtime.getManifest().version;

// Search
window.onload = function () {
    // language
    document.getElementById('searchButton').value = chrome.i18n.getMessage("button_search");

    // current extension version in search bar
    $("input[type=hidden][name=ver]").val(extensionVersion);

    // selected text
    chrome.tabs.query({ active: true, currentWindow: true },
        function (tab) {
            if (tab && tab[0]) {
                chrome.tabs.sendMessage(tab[0].id, { method: "getSelection" },
                    function (response) {
                        if (typeof response !== 'undefined' && response.data && response.data.trim() !== "") {
                            chrome.tabs.create({ url: 'https://www.csfd.cz/hledat/?q=' + encodeURIComponent(response.data.trim()) });
                        }
                    });
            }
        });
};