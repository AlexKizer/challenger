/* A simple "view" for the test results pane. */
function makeTestView ($div, snippetEditor) {
    var view = {},
        $whitelist = $div.find('#whitelist'),
        $blacklist = $div.find('#blacklist'),
        $snippet = $div.find('#snippet'),
        $snippetResult = $div.find('#test-snippet-value'),
        $grade = $div.find('.test-grade');


    view.setLoading = function () {
        setResults('loading', $whitelist);
        setResults('loading', $blacklist);
    };

    view.computeGrade = function () {
        var right = $div.find('.test-value-pass').length,
            wrong = $div.find('.test-value-fail').length,
            grade = Math.round(right / (right + wrong) * 100);
        if(grade <= 33) {
            $grade.removeClass('test-grade-okay').removeClass('test-grade-good').addClass('test-grade-bad');
        } else if (grade <= 66) {
            $grade.removeClass('test-grade-bad').removeClass('test-grade-good').addClass('test-grade-okay');
        } else {
            $grade.removeClass('test-grade-bad').removeClass('test-grade-okay').addClass('test-grade-good');
        }
        $grade.text(grade);
    };

    view.setValid = function (valid) {
    };

    view.initWhitelist = function (tests) {
        initList(tests, $whitelist);
    };

    view.initBlacklist = function (tests) {
        initList(tests, $blacklist);
    };

    function initList (tests, $list) {
        var $test, $testKey, $testValue;
        for (var i = 0; i < tests.length; i++) {
            $test = $('<li>').addClass('test'); 
            if (i == 0) {
                $test.addClass('first');
            }
            $testValue = $('<span>').addClass('test-value').appendTo($test);
            $testKey = $('<span>').addClass('test-key').text(tests[i]).appendTo($test);
            $list.append($test);
        }
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
        snippetEditor.setValue(snippet);
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
