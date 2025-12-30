/**
 * Converts youtube's ISO8601 time into readable format minutes:seconds.
 *
 * @param  {string} s Time in ISO8601.
 * @return {string}   Time in readable format mm:ss.
 */
function iso8601TimeToHMS(s) {

    var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var hours = 0,
        minutes = 1,
        seconds = 0;

    if (reptms.test(s)) {
        var matches = reptms.exec(s);
        if (matches[1]) hours = Number(matches[1]);
        if (matches[2]) minutes = Number(matches[2]);
        if (matches[3]) seconds = Number(matches[3]);
    }
    minutes = minutes + (hours * 60);
    return (minutes < 10 ? '0' + minutes : minutes) + ":" + (seconds < 10 ? '0' + seconds : seconds);
}


/**
 * Translates each language from english to czech.
 *
 * @param  {string} language String of languages in english.
 * @return {string}          String of languages in czech.
 */
function transalteOriginalLanguage(language) {

    var langInEnglish = new Array(
        'Afrikaans',
        'Albanian',
        'Arabic',
        'Armenian',
        'Bosnian',
        'Brazilian',
        'Bulgarian',
        'Canton',
        'Cantonese',
        'Chinese',
        'Croatian',
        'Czech',
        'Danish',
        'Dutch',
        'English',
        'Estonian',
        'Finnish',
        'French',
        'German',
        'Greek',
        'Hindi',
        'Hungarian',
        'Icelandic',
        'Indonesian',
        'Italian',
        'Japanese',
        'Kazakh',
        'Korean',
        'Kurdish',
        'Latin',
        'Latvian',
        'Lithuanian',
        'Macedonian',
        'Mandarin',
        'Mongolian',
        'Nepali',
        'Norwegian',
        'Persian',
        'Portuguese',
        'Polish',
        'Romanian',
        'Romany',
        'Russian',
        'Slovak',
        'Slovenian',
        'Spanish',
        'Swahili',
        'Swedish',
        'Taiwanese',
        'Thai',
        'Turkish',
        'Turkmen',
        'Ukrainian',
        'Vietnamese',
        'Welsh');
    var langInCzech = new Array(
        'afrikánština',
        'albánština',
        'arabština',
        'arménština',
        'bosenština',
        'brazilština',
        'bulharština',
        'kantonština',
        'kantonština',
        'čínština',
        'chorvatština',
        'čeština',
        'dánština',
        'nizozemština',
        'angličtina',
        'estonština',
        'finština',
        'francouzština',
        'němčina',
        'řečtina',
        'hindština',
        'maďarština',
        'islandština',
        'indonéština',
        'italština',
        'japonština',
        'kazaština',
        'korejština',
        'kurdština',
        'latina',
        'lotyština',
        'litevština',
        'makedonština',
        'mandanština',
        'mongolština',
        'nepálština',
        'norština',
        'perština',
        'portugalština',
        'polština',
        'rumunština',
        'romština',
        'ruština',
        'slovenština',
        'slovinština',
        'španělština',
        'svahilština',
        'švédština',
        'tajvanština',
        'thajština',
        'turečtina',
        'turkmenština',
        'ukrajinština',
        'vietnamština',
        'velština');

    for (var i = 0; i < langInEnglish.length; i++) {
        language = language.replace(langInEnglish[i], langInCzech[i]);
    }
    return language;
}


/**
 * Stores an object to the cache.
 *
 * @param  {CacheTye} 	type 	The type of the object which is to be stored into the cache
 * @param  {Object} 	data 	The object to be stored
 * @param  {int} 		id 		ID of the object to be stored
 * @return {boolean} 			True if the process ended successfully, false otherwise
 */
function storeToCache(type, data, id) {

    var dfrd = $.Deferred();

    switch (type) {
        case CacheType.ARTIST:
            chrome.storage.local.get('artists', function (result) {
                if (typeof result.artists == 'undefined') {
                    result.artists = [];
                }
                result.artists[id] = updateOldObject(result.artists[id], data);
                chrome.storage.local.set({ 'artists': result.artists }, function () {
                    dfrd.resolve(true);
                });
            });
            break;

        case CacheType.MOVIE:
            chrome.storage.local.get('movies', function (result) {
                if (typeof result.movies == 'undefined') {
                    result.movies = [];
                }
                result.movies[id] = updateOldObject(result.movies[id], data);
                chrome.storage.local.set({ 'movies': result.movies }, function () {
                    dfrd.resolve(true);
                });
            });
            break;

        default:
            dfrd.resolve(false);
    }

    return dfrd.promise();
}


/**
 * Retrieves movies or artists from a storage cache if they exist.
 *
 * @param  {CacheType} 	type 	Specify if the object retrieved from cache should be a movie or an artist
 * @param  {int} 		id 		ID of the object
 * @return {Object} 			Retrieved object
 */
function retrieveFromCache(type, id) {

    var dfrd = $.Deferred();

    switch (type) {
        case CacheType.ARTIST:
            chrome.storage.local.get('artists', function (result) {
                if (typeof result.artists == 'undefined') {
                    dfrd.resolve(null);
                } else {
                    if (result.artists[id] == null || isOlderThanMonth(result.artists[id].timestamp)) {
                        dfrd.resolve(null);
                    }
                    dfrd.resolve(result.artists[id]);
                }
            });
            break;

        case CacheType.MOVIE:
            chrome.storage.local.get('movies', function (result) {
                if (typeof result.movies == 'undefined') { // if the movies are not initializied yet (e.g. after the extension installation)
                    dfrd.resolve(null);
                } else {
                    if (result.movies[id] == null || isOlderThanMonth(result.movies[id].timestamp)) {
                        dfrd.resolve(null);
                    }
                    dfrd.resolve(result.movies[id]);
                }
            });
            break;

        default:
            return null;
    }

    return dfrd.promise();
}


/**
 * Updates an object with a new object comparing their properties.
 * If the property is null, nothing is updated, otherwise it is.
 *
 * @param  {Object} oldObject 	The object ot be updated
 * @param  {Object} newObject 	The object which updates the old one
 * @return {Object} 			Updated object
 */
function updateOldObject(oldObject, newObject) {

    if (oldObject == null) {
        return newObject;
    }

    var updatedObject = {};

    for (var key in oldObject) {
        updatedObject[key] = newObject[key] == null || typeof newObject[key] == 'undefined' ? oldObject[key] : newObject[key];
    }

    return updatedObject;
}


/**
 * Creates an artist object for further use (a constructor).
 *
 * @param  {string} tooltipContent 	Parameter 1
 * @param  {string} timestamp 		Parameter 2
 * @return {Object} 				Normalized object.
 */
function normalizeArtistObject(tooltipContent, timestamp) {

    var normalizedObject = {
        tooltipContent: tooltipContent,
        timestamp: timestamp
    }

    return normalizedObject;
}


/**
 * Creates a movie object for further use (a constructor).
 *
 * @param  {string} 	movieInfo 		Parameter 1
 * @param  {string} 	tooltipContent 	Parameter 2
 * @param  {boolean} 	isTVShow 		Parameter 3
 * @param  {string} 	episodes 		Parameter 4
 * @param  {string} 	timestamp 		Parameter 5
 * @return {Object} 					Normalized object
 */
function normalizeMovieObject(movieInfo, tooltipContent, isTVShow, episodes, timestamp) {

    var normalizedObject = {
        movieInfo: movieInfo,
        tooltipContent: tooltipContent,
        isTVShow: isTVShow,
        episodes: episodes,
        timestamp: timestamp
    }

    return normalizedObject;
}


/**
 * Creates a movieInfo object for further use (a constructor).
 *
 * @param  {string} title 		Paramter 1
 * @param  {string} imdbRating 	Paramter 2
 * @param  {string} yearEnd 	Paramter 3
 * @param  {string} language 	Paramter 4
 * @return {Object} 			Normalized object
 */
function normalizeMovieInfoObject(title, imdbRating, yearEnd, language) {

    var normalizedObject = {
        title: title,
        imdbRating: imdbRating,
        yearEnd: yearEnd,
        language: language
    }

    return normalizedObject;
}


/**
 * Creates a youtubeVideo object for further use (a constructor).
 *
 * @param  {string} id 			Parameter 1
 * @param  {string} duration 	Parameter 2
 * @return {Object}  			Normalized object
 */
function normalizeYouTubeVideoObject(id, duration) {

    var normalizedObject = {
        id: id,
        duration: duration
    }

    return normalizedObject;
}


/**
 * Reads chrome.storage.local asynchronously.
 * @param {string or an array of strings} key Keys to identify the item(s) to be retrieved from storage
 */
function readStorageAsync(key) {
    return new Promise((resolve, reject) => {
        if (key != null) {
            chrome.storage.local.get(key, function (result) {
                resolve(result);
            });
        } else {
            reject(null);
        }
    });
}


/**
 * Gets CSFD ID of the movie or artist from CSFD url.
 *
 * @param  {string} url 	CSFD url
 * @return {int} 			ID of the movie or artist
 */
function getCsfdIdFromUrl(url) {

    var matches = url.match(/\d+/);
    return matches ? matches[0] : null;
}


/**
 * Checks if the provided timestamp is older than a month.
 *
 * @param  {Date} 	timestamp 	Timestamp to be checked
 * @return {boolean} 			True if the timestamp is older than a month, false otherwise
 */
function isOlderThanMonth(timestamp) {

    var monthInMiliseconds = 30 * 24 * 60 * 60 * 1000;
    var currentTimestamp = $.now();

    return currentTimestamp - timestamp > monthInMiliseconds;
}


/**
 * Decodes a string with special HTML characters (e.g.: single qoute (') as &#x27;).
 *
 * @param {string} encodedString String to be decoded
 */
function decodeEntities(encodedString) {

    var div = document.createElement('div');
    div.innerHTML = encodedString;

    return div.textContent;
}


/**
 * Decodes a string which consists of some special HTML characters (such as &#39;)
 * @param  string html String with HTML characters
 * @return string      String without HTML characters
 */
function decodeHtml(html) {

    var txt = document.createElement("textarea");
    txt.innerHTML = html;

    return txt.value;
}


/**
 * Prints all chrome.storage.local data into console (might be useful during debug).
 */
function printAllStorageData() {

    chrome.storage.local.get(function (items) {
        console.log(items);
    });

}