$(document).ready(function () {
    // Try to use the test attached to window.challenge if it exits; otherwise, fall 
    // back to a default challenge.
    var whitelist = window.challenge ? challenge.whitelist : ['ForStatement', 'IfStatement', 'FunctionDeclaration'],
        blacklist = window.challenge ? challenge.blacklist : ['WhileStatement'],
        snippet = $('#snippet_code').text(),//.trim(), // get snippet code
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

    challengeAPI = challengeWorker(); // Initialize asynchronous testing API.

    // Listen for whitelist results event.
    challengeAPI.on('whitelist', function (data) {
        testResultsView.setWhitelistResults(data);
        testResultsView.computeGrade();
    });

    // Listen for blacklist results event.
    challengeAPI.on('blacklist', function (data) {
        testResultsView.setBlacklistResults(data);
        testResultsView.computeGrade();
    });

    // Listen for snippets results even.t
    challengeAPI.on('snippets', function (data) {
        testResultsView.setSnippetResults(data[0]);
        testResultsView.computeGrade();
    });

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
        // Send code to worker to be tested:
        challengeAPI.checkWhitelist(code, whitelist);
        challengeAPI.checkBlacklist(code, blacklist);
        challengeAPI.checkSnippets(code, snippets);
    }

    // Check code initially:
    checkCode(codeEditor.getValue());
    
});


