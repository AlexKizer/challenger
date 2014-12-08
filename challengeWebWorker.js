/* The actual web worker */
importScripts('lib/esprima.js');
importScripts('lib/challenger.js'); // get the challenger module

var ch = challenger(esprima);

onmessage = function (event) {
    var data = event.data,
        response = {};
    if(data.action === 'checkWhitelist') {
        response.type = 'whitelist';
        response.value = ch.checkWhitelist(data.codeString, data.whitelist);
    } else if (data.action == 'checkBlacklist') {
        response.type = 'blacklist';
        response.value = ch.checkBlacklist(data.codeString, data.blacklist);
    } else {
        response.type = 'snippets';
        response.value = ch.checkSnippets(data.codeString, data.snippets);
    }
    postMessage(response);
};
