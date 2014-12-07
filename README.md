# challenger
Open `index.html` for a demo!

## usage
    challenger.checkWhitelist(codeString, whitelist);
    challenger.checkBlacklist(codeString, blacklist);
    challenger.checkSnippets(codeString, snippets);

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

## test format
Whitelists/blacklists are arrays of strings that are in the above list.

Snippets represent generic 'sub-trees' of an AST. They are represented with regular JavaScript. However,
they are parsed into an AST and specifics (variable name

