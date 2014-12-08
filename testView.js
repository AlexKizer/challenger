/* A simple "view" for the test results pane. */
function makeTestView($div, snippetEditor) {
    var view = {},
        $whitelist = $div.find('#whitelist'),
        $blacklist = $div.find('#blacklist'),
        $snippet = $div.find('#snippet'),
        $snippetResult = $div.find('#test-snippet-value'),
        $grade = $div.find('.testgrade'),
        indicatorPass = '&#10003', // check mark
        indicatorFail = '&#10007', // x mark
        indicatorLoading = '...',
        cssClasses = {
            testGradeBad: 'testgrade-bad',
            testGradeOkay: 'testgrade-okay',
            testGradeGood: 'testgrade-good',
            testPass: 'test-value-pass',
            testFail: 'test-value-fail',
            testLoading: 'test-value-loading',
            testValue: 'test-value',
            testKey: 'test-key',
            test: 'test',
            first: 'first'
        };

    view.setLoading = function () {
        setResults('loading', $whitelist);
        setResults('loading', $blacklist);
        setIndicatorClass($snippetResult, 'loading');
    };

    view.computeGrade = function () {
        var right = $div.find('.' + cssClasses.testPass).length,
            wrong = $div.find('.' + cssClasses.testFail).length,
            grade = Math.round(right / (right + wrong) * 100);
        $grade.removeClass(cssClasses.testGradeBad)
            .removeClass(cssClasses.testGradeOkay)
            .removeClass(cssClasses.testGradeGood);
        if (grade <= 33) {
            $grade.addClass(cssClasses.testGradeBad);
        } else if (grade <= 66) {
            $grade.addClass(cssClasses.testGradeOkay);
        } else {
            $grade.addClass(cssClasses.testGradeGood);
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

    function initList(tests, $list) {
        var $test,
            $testKey,
            $testValue;
        for (var i = 0; i < tests.length; i++) {
            $test = $('<li>').addClass(cssClasses.test);
            if (i == 0) {
                $test.addClass(cssClasses.first);
            }
            $testValue = $('<span>').addClass(cssClasses.testValue).appendTo($test);
            $testKey = $('<span>').addClass(cssClasses.testKey).text(tests[i]).appendTo($test);
            $list.append($test);
        }
    }

    function setResults(results, $list) {
        var $value;
        for (var i = 0; i < results.length; i++) {
            $value = $list.find('.' + cssClasses.testValue).eq(i);
            if (results === 'loading') {
                setIndicatorClass($value, 'loading');
            } else if (results[i]) {
                setIndicatorClass($value, 'pass');
            } else {
                setIndicatorClass($value, 'fail');
            }
        }
    }

    function setIndicatorClass($value, indicator) {
        $value.removeClass(cssClasses.testFail)
            .removeClass(cssClasses.testPass)
            .removeClass(cssClasses.testLoading);
        if (indicator === 'pass') {
            $value.addClass(cssClasses.testPass);
            $value.html(indicatorPass);
        } else if (indicator === 'fail') {
            $value.addClass(cssClasses.testFail);
            $value.html(indicatorFail);
        } else {
            $value.addClass(cssClasses.testLoading);
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
