// all possible settings and its keys
var settings = ["imdbRating",
    "originalLanguage",
    "goUp",
    "artistTooltip",
    "movieTooltip",
];

// runs restore_option() before page load
document.addEventListener('DOMContentLoaded', restore_options);
// runs save() after submitting the form
document.querySelector('#submitButton').addEventListener('click', save_options);

// save to localStorage
function save_options() {

    // save the settings
    var select, val, key;

    for (var i = 0; i < settings.length; i++) {
        var obj = {};
        key = settings[i];
        select = document.getElementById(key);
        val = select.children[select.selectedIndex].value;
        obj[key] = val;
        chrome.storage.local.set(obj);
    }
    // update status to let user know options were saved
    var status = document.getElementById("status");
    status.innerHTML = chrome.i18n.getMessage("opt_saved");
    setTimeout(function () {
        status.innerHTML = "";
    }, 10000);
}

// restores select box state to saved value from localStorage
function restore_options() {
    // load the settings
    chrome.storage.local.get(settings, function (result) {
        var select, val, child, key;
        for (var i = 0; i < settings.length; i++) {
            key = settings[i];
            val = result[key];
            select = document.getElementById(key);
            // set the comboboxes
            for (var j = 0; j < select.children.length; j++) {
                child = select.children[j];
                if (child.value == val) {
                    child.selected = "true";
                    break;
                }
            }
        }

    });
}