(function () {
    var keys = [
        "imdbRating",
        "goUp",
        "originalLanguage"
    ];

    chrome.storage.local.get(keys, function (result) {
        var valImdb = result.imdbRating;
        var valGoUp = result.goUp;
        var valOriginalLanguage = result.originalLanguage;


        if (valImdb == 1 || valImdb == null ||
            valOriginalLanguage == 1 || valOriginalLanguage == null) {
            var currentUrl = window.location.href;
            var cache;

            // first, get some data from the API
            var title = "";
            var imdbRating = "";

            var language = "";

            // find a link to the IMDB profile
            var imdbLink = $("a.button-imdb").attr('href');
            if (imdbLink) {
                var imdbId = imdbLink.split('/');
                if (imdbId[imdbId.length - 1] == "" || "combined" == imdbId[imdbId.length - 1]) {
                    imdbId = imdbId[imdbId.length - 2];
                } else {
                    imdbId = imdbId[imdbId.length - 1];
                }

                var apiKey = "ba1f4581";
                var apiUrl = "https://www.omdbapi.com/?i=" + imdbId + "&apikey=" + apiKey;
                var imdbLinkPretty = imdbLink.replace('combined', '');
            } else {
                var imdbLinkPretty = "";
            }
            // check the cache
            $.when(retrieveFromCache(CacheType.MOVIE, getCsfdIdFromUrl(currentUrl))).then(function (result) {
                cache = result;
                if (typeof cache != 'undefined' && cache != null && cache.movieInfo != null) {
                    title = cache.movieInfo.title;
                    imdbRating = cache.movieInfo.imdbRating;

                    language = cache.movieInfo.language;
                    console.log(imdbLinkPretty, imdbRating);
                    // display features
                    addFeatures();
                } else {
                    // not cached yet
                    $.ajax({
                        'async': true,
                        'global': false,
                        'url': apiUrl,
                        'dataType': "json",
                        'success': function (data) {
                            console.log(data.Ratings, data.Ratings[0]);
                            title = data.Title;
                            data.Ratings[0].Value ? imdbRating = data.Ratings[0].Value : imdbRating = "N/A";
                            language = data.Language;
                            // display features
                            addFeatures();
                            // store to the cache
                            var movieInfo = normalizeMovieInfoObject(title, imdbRating, null, language);
                            storeToCache(CacheType.MOVIE, normalizeMovieObject(movieInfo, null, null, null, $.now()), getCsfdIdFromUrl(currentUrl));
                        }
                    });
                }
            });
        }


        /**
         * Adds features to the CSFD website, such as IMDB rating, 
         * orignal language, go-up link.
         */
        function addFeatures() {
            var titleDecoded = decodeEntities(title);
            // IMDB RATING
            if (valImdb == "1" || valImdb == null) {
                $(".film-rating-average").after('<div id="imdb_rating"><a href="' + imdbLinkPretty + '">' + imdbRating + '</a></div>');
            }
            // ORIGINAL LANGUAGE
            if ((valOriginalLanguage == "1" || valOriginalLanguage == null) && language) {
                language = transalteOriginalLanguage(language);
                language = language.replace(/\|/g, ", ");
                $(".genres").after('<p>Jazyk originálu: ' + language + '</p>');
            }

            // GO UP LINK
            if (valGoUp == "1" || valGoUp == null) {
                $("#page-header").before('<a name="#top"></a><a href="#top" class="go_up"><img src="' + chrome.runtime.getURL("img/up.png") + '"></a>');
            }

        }

    });

})();