/* A simple "view" for the test results pane. */
function makeTestView ($div, snippetEditor) {
    var view = {},
        $whitelist = $div.find('#whitelist'),
        $blacklist = $div.find('#blacklist'),
        $snippet = $div.find('#snippet'),
        $snippetResult = $div.find('#test-snippet-value'),
        $grade = $div.find('.test-grade'),
        indicatorPass = '&#10003'
        indicatorFail = '&#10007',
        indicatorLoading = '...';

    view.setLoading = function () {
        setResults('loading', $whitelist);
        setResults('loading', $blacklist);
        setIndicatorClass($snippetResult, 'loading');
    };

    view.computeGrade = function () {
        var right = $div.find('.test-value-pass').length,
            wrong = $div.find('.test-value-fail').length,
            grade = Math.round(right / (right + wrong) * 100);
        $grade.removeClass('test-grade-bad').removeClass('test-grade-okay').removeClass('test-grade-good');
        if(grade <= 33) {
            $grade.addClass('test-grade-bad');
        } else if (grade <= 66) {
            $grade.addClass('test-grade-okay');
        } else {
            $grade.addClass('test-grade-good');
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
                setIndicatorClass($value, 'loading');
            } else if (results[i]) {
                setIndicatorClass($value, 'pass');
            } else {
                setIndicatorClass($value, 'fail');
            }
        }
    }

    function setIndicatorClass ($value, indicator) {
        $value.removeClass('test-value-fail').removeClass('test-value-pass').removeClass('test-value-loading');
        if(indicator === 'pass') {
            $value.addClass('test-value-pass');
            $value.html(indicatorPass);
        } else if (indicator === 'fail') {
            $value.addClass('test-value-fail');
            $value.html(indicatorFail);
        } else {
            $value.addClass('test-value-loading');
            $value.html(indicatorLoading);
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
        if (result) {
            setIndicatorClass($snippetResult, 'pass');
        } else {
            setIndicatorClass($snippetResult, 'fail');
        }
    };

    return view;
};
