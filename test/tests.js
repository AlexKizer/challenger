QUnit.config.testTimeout = 30000;
QUnit.module('challenger');

QUnit.test('containsNode', function (assert) {
    var sampleCodeOne = $('#sample_code_one').text(),
        sampleCodeTwo = $('#sampel_code_two').text(), 
        ch = challenger(esprima),
        statements = ['EmptyStatement', 'BlockStatement', 'ExpressionStatement', 'IfStatement', 'BreakStatement', 'ContinueStatement',
                      'WithStatement', 'SwitchStatement', 'ReturnStatement', 'ThrowStatement', 'TryStatement', 'WhileStatement', 'DoWhileStatement', 
                      'ForStatement', 'ForInStatement', 'FunctionDeclaration', 'VariableDeclaration'];
    var astOne = esprima.parse(sampleCodeOne),
        astTwo = esprima.parse(sampleCodeTwo);
    console.dir(astOne);
    for (var i = 0; i < statements.length; i++) {
        assert.ok(ch.containsNode(astOne, statements[i]), 'astOne contains ' + statements[i]);
    }
    for (var i = 0; i < statements.length; i++) {
        if(statements[i] == 'FunctionDeclaration') continue;
        assert.ok(!ch.containsNode(astTwo, statements[i]), 'astTwo does not contain ' + statements[i]);
    }
});

QUnit.test('checkWhitelist', function (assert) {
    var sampleCodeOne = $('#sample_code_one').text(),
        sampleCodeTwo = $('#sampel_code_two').text(), 
        ch = challenger(esprima),
        statements = ['EmptyStatement', 'BlockStatement', 'ExpressionStatement', 'IfStatement', 'BreakStatement', 'ContinueStatement',
                      'WithStatement', 'SwitchStatement', 'ReturnStatement', 'ThrowStatement', 'TryStatement', 'WhileStatement', 'DoWhileStatement', 
                      'ForStatement', 'ForInStatement', 'FunctionDeclaration', 'VariableDeclaration'];
    var results = ch.checkWhitelist(sampleCodeOne, statements);
    assert.ok(results.length == statements.length, 'one result is provided for each test');
    for (var i = 0; i < statements.length; i++) {
        assert.ok(results[i], statements[i] + ' passed correctly.');
    }
    results = ch.checkWhitelist(sampleCodeTwo, statements);
    assert.ok(results.length == statements.length, 'one result is provided for each test');
    for (var i = 0; i < statements.length; i++) {
        assert.ok(!results[i], statements[i] + ' failed correctly.');
    }
});

QUnit.test('checkBlacklist', function (assert) {
    var sampleCodeOne = $('#sample_code_one').text(),
        sampleCodeTwo = $('#sampel_code_two').text(), 
        ch = challenger(esprima),
        statements = ['WhileStatement', 'IfStatement'];
    var results = ch.checkBlacklist(sampleCodeOne, statements);
    assert.ok(results.length == statements.length, 'one result is provided for each test');
    for (var i = 0; i < statements.length; i++) {
        assert.ok(!results[i], statements[i] + ' failed blacklist correctly.');
    }
    results = ch.checkBlacklist(sampleCodeTwo, statements);
    assert.ok(results.length == statements.length, 'one result is provided for each test');
    for (var i = 0; i < statements.length; i++) {
        assert.ok(results[i], statements[i] + ' passed blacklist correctly.');
    }
});

QUnit.test('checkSnippets', function (assert) {
    var sampleCodeOne = $('#sample_code_one').text(),
        sampleCodeTwo = $('#sample_code_two').text(),
        sampleCodeThree = $('#sample_code_three').text(),
        sampleCodeEvil = $('#sample_code_evil').text(),
        snippetOne = $('#snippet_one').text(),
        snippetTwo = $('#snippet_two').text(),
        ch = challenger(esprima),
        snippets = [];
    snippets.push(snippetOne);
    assert.ok(ch.checkSnippets(sampleCodeOne, snippets), 'sampleCodeOne contains snippetOne');
    assert.ok(!ch.checkSnippets(sampleCodeTwo, snippets), 'sampleCodeTwo does not contain snippetOne');
    assert.ok(ch.checkSnippets(sampleCodeThree, snippets), 'sampleCodeThree contains snippetOne');
    snippets = [];
    snippets.push(snippetTwo);
    assert.ok(!ch.checkSnippets(sampleCodeOne, snippets), 'sampleCodeOne does not contain snippetTwo');
    assert.ok(!ch.checkSnippets(sampleCodeTwo, snippets), 'sampleCodeTwo does not contain snippetTwo');
    assert.ok(ch.checkSnippets(sampleCodeThree, snippets), 'sampleCodeThree contains snippetTwo');

    snippets = [];
    snippets.push(snippetOne);
    assert.ok(ch.checkSnippets(sampleCodeEvil, snippets), 'sampleCodeEvil contains snippetOne');
    snippets = [];
    snippets.push(snippetTwo);
    assert.ok(!ch.checkSnippets(sampleCodeEvil, snippets), 'sampleCodeEvil does not contain snippetTwo');
});
