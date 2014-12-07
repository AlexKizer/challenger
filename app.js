$(document).ready(function () {
    // Try to use the test attached to window.challenge if it exits; otherwise, fall 
    // back to a default challenge.
    var whitelist = window.challenge ? challenge.whitelist : ['ForStatement', 'IfStatement', 'FunctionDeclaration'],
    blacklist = window.challenge ? challenge.blacklist : ['ForStatement'],
    snippet = $('#snippet_code').text(),//.trim(); // get snippet code
    snippets = [],
    codeEditor,
    snippetEditor,
    testResultsView,
    challengeAPI;

    snippets.push(snippet); // Although we could test multiple snippets, we will only test one.
    
    // Initialize main code editor:
    codeEditor = CodeMirror($('#code').get()[0], {
        mode: 'javascript',
        lineNumbers: true,
        value: '// Write code below to pass the tests to the right.\n'
    });

    // Initliaze another CodeMirror instance; this will contain
    // the snippet code, which will be able to be edited as well.
    snippetEditor = CodeMirror($('#snippet').get()[0], {
            value: '// Include the following statement tree \n// somewhere in your code:',
            mode: 'javascript',
            lineNumbers: true
    });

    testResultsView = makeTestView($('#right'), snippetEditor); // Create the test results view.

    challengeAPI = challenger(esprima); // Initialize the testing API.

    // Initialize the test results view:
    testResultsView.initWhitelist(whitelist); 
    testResultsView.initBlacklist(blacklist);
    testResultsView.initSnippet(snippet);
    testResultsView.setValid(true);

    // Listen for changes to the code editor:
    codeEditor.on('change', function (event) {
        checkCode(codeEditor.getValue());
    });

    // Listen for changes to the snippet editor:
    snippetEditor.on('change', function (event) {
        snippets[0] = snippetEditor.getValue();
        checkCode(codeEditor.getValue());
    });

    function checkCode(code) {
        testResultsView.setLoading(); // Display loading indicators.
        testResultsView.setValid(challengeAPI.checkIsValid(code)) // Is the code valid?
        testResultsView.setWhitelistResults(challengeAPI.checkWhitelist(code, whitelist)); // Does code pass whitelist test?
        testResultsView.setBlacklistResults(challengeAPI.checkBlacklist(code, blacklist)); // Does code pass blacklist test?
        testResultsView.setSnippetResults(challengeAPI.checkSnippets(code, snippets)); // Does code contain snippet?
        testResultsView.computeGrade();
    }

    // Check code initially:
    checkCode(codeEditor.getValue());
    
});


