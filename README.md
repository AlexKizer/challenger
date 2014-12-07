# challenger
Open `index.html` for a demo!

## usage
    challenger.checkWhitelist(codeString, whitelist);
    challenger.checkBlacklist(codeString, blacklist);
    challenger.checkSnippets(codeString, snippets);
Where `codeString` is a string of JavaScript code, and 
    * `whitelist`/`blacklist` are arrays of string from the statement vocabulary list below
    * `snippets` is an array of JavaScript code snippets (see below)

## statement vocabulary
The following statements have been tested to work:
* 'EmptyStatement' 
* 'BlockStatement' 
* 'ExpressionStatement'
* 'IfStatement'
* 'BreakStatement'
* 'ContinueStatement'
* 'WithStatement'
* 'SwitchStatement'
* 'ReturnStatement'
* 'ThrowStatement'
* 'TryStatement'
* 'WhileStatement'
* 'DoWhileStatement'
* 'ForStatement'
* 'ForInStatement'
* 'FunctionDeclaration'
* 'VariableDeclaration'

## snippets
Snippets represent generic 'sub-trees' of an AST. We can test if a given AST contains the sub-tree
defined by the snippet. Snippets are represented with regular JavaScript. However, they are parsed into an 
AST and specifics (variable names, certain expressions) are ignored when the snippet is searched for
in student code.

