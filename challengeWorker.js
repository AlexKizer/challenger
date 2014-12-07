/*
This module does test checking in a separate thread using web workers, so as
not to block a user's typing. If web workers are unavailable, it falls back
to regular, synchronous operation.
*/
window.challengeWorker = function () {
    var async = typeof Worker === 'function', // true if web workers are available
        challengeWorker = {},
        webWorker,
        listeners = {
            whitelist: [],
            blacklist: [],
            snippets: []
        };

    if(async) {
        webWorker = new Worker('challengeWebWorker.js');
        webWorker.onmessage = onMessage;
    }

    challengeWorker.checkWhitelist = function (codeString, whitelist) {
        if(async) {
            webWorker.postMessage({
                action: 'checkWhitelist',
                codeString: codeString,
                whitelist: whitelist
            });
        } else {
            var results = challenger.checkWhitelist(codeString, whitelist);
            fire(results, listeners.whitelist);
        }
    };

    challengeWorker.checkBlacklist = function (codeString, blacklist) {
        if(async) {
            webWorker.postMessage({
                action: 'checkBlacklist',
                codeString: codeString,
                blacklist: blacklist
            });
        } else {
            var results = challenger.checkBlacklist(codeString, blacklist);
            fire(results, listeners.blacklist);
        }
    };

    challengeWorker.checkSnippets = function (codeString, snippets) {
        if(async) {
            webWorker.postMessage({
                action: 'checkSnippets',
                codeString: codeString,
                snippets: snippets
            });
        } else {
            var results = challenger.checkSnippets(codeString, snippets);
            fire(results, listeners.snippets);
        }
    };

    challengeWorker.on = function (eventName, callback) {
        listeners[eventName].push(callback);
    };

    function onMessage (event) {
        console.log('worker message');
        console.log(event);
        var data = event.data;
        if(data.type === 'whitelist') {
            fire(data.value, listeners.whitelist);
        } else if(data.type === 'blacklist') {
            fire(data.value, listeners.blacklist);
        } else {
            fire(data.value, listeners.snippets);
        }
    }

    function fire (data, array) {
        array.forEach(function (fn) {
            fn(data);
        });
    }

    return challengeWorker;
};
