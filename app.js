// An asynchronous interface for the testing module; uses WebWorkers if available or falls back to regular operation.
window.challengerAsync = function () {
    var async = {};

    return async;
};

$(document).ready(function () {
    var whitelist = ['ForStatement', 'IfStatement'],
        blacklist = ['WhileStatement'],
        snippet = $('#snippet_example').text().trim(),
        snippets = [];

    snippets.push(snippet);
    
    // Initialize codemirror:
    var codemirror = CodeMirror($('#code').get()[0], {
        mode: 'javascript',
        lineNumbers: true,
        value: '// Write code below to pass the tests to the right.\n'
    });

    var snippetMirror = CodeMirror($('#snippet').get()[0], {
            value: '// Include the following statement tree \n// somewhere in your code:',
            mode: 'javascript',
            lineNumbers: true
        });
    var testView,
        ch;
    // A simple "view" for the test div:
    function makeTestView ($div, snippetMirror) {
        var view = {},
            $whitelist = $div.find('#whitelist'),
            $blacklist = $div.find('#blacklist'),
            $snippet = $div.find('#snippet'),
            $snippetResult = $div.find('#test-snippet-value');


        view.setLoading = function () {
            setResults('loading', $whitelist);
            setResults('loading', $blacklist);
        };

        view.setValid = function (valid) {
            var $validValue = $div.find('#test-valid-value');
            if (valid) {
                $validValue.removeClass('test-value-fail').addClass('test-value-pass').text('valid');
            } else {
                $validValue.removeClass('test-value-pass').addClass('test-value-fail').text('invalid');
            }
        };

        view.initWhitelist = function (tests) {
            initList(tests, $whitelist);
        };

        view.initBlacklist = function (tests) {
            initList(tests, $blacklist);
        };

        function initList (tests, $list) {
            var $test, $testKey, $testValue;
            tests.forEach(function (test) {
                $test = $('<div>').addClass('test'); 
                $testKey = $('<span>').addClass('test-key').text(test);
                $testValue = $('<span>').addClass('test-value').text('');
                $test.append($testKey);
                $test.append($testValue);
                $list.append($test);
            });
        }

        function setResults (results, $list) {
            var $value;
            for (var i = 0; i < results.length; i++) {
                $value = $list.find('.test-value').eq(i);
                if (results === 'loading') {
                    $value.removeClass('test-value-fail');
                    $value.removeClass('test-value-pass');
                    $value.addClass('test-value-loading');
                    $value.text('...');
                } else if (results[i]) {
                    $value.removeClass('test-value-fail');
                    $value.removeClass('test-value-loading');
                    $value.addClass('test-value-pass');
                    $value.html('&#10003;');
                } else {
                    $value.removeClass('test-value-pass');
                    $value.removeClass('test-value-loading');
                    $value.addClass('test-value-fail');
                    $value.html('&#10007;');
                }
            }
        }

        view.initSnippet = function (snippet) {
            snippetMirror.setValue(snippet);
        };

        view.setWhitelistResults = function (results) {
            setResults(results, $whitelist);
        };

        view.setBlacklistResults = function (results) {
            setResults(results, $blacklist);
        };

        view.setSnippetResults = function (result) {
            console.log('Snippet result is %s', result);
            if (result) {
                $snippetResult.removeClass('test-value-fail').addClass('test-value-pass').html('&#10003');
            } else {
                $snippetResult.removeClass('test-value-pass').addClass('test-value-fail').html('&#10007');
            }
        };


        return view;
    };
    // Initialize test view:
    testView = makeTestView($('#right'), snippetMirror);
    testView.initWhitelist(whitelist);
    testView.initBlacklist(blacklist);
    testView.initSnippet(snippet);
    testView.setValid(true);
    
    ch = challenger(esprima);

    // Listen for changes to code editor:
    codemirror.on('change', function (event) {
        checkCode(codemirror.getValue());
    });

    snippetMirror.on('change', function (event) {
        snippets[0] = snippetMirror.getValue();
        checkCode(codemirror.getValue());
    });

    function checkCode(code) {
        testView.setLoading();
        testView.setValid(ch.checkIsValid(code))
        testView.setWhitelistResults(ch.checkWhitelist(code, whitelist));
        testView.setBlacklistResults(ch.checkBlacklist(code, blacklist));
        console.dir(snippets);
        testView.setSnippetResults(ch.checkSnippets(code, snippets));
    }

    checkCode(codemirror.getValue());
    
});


