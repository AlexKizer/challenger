challenger = function (esprima) {
    "use strict";
    var challenger = {};

    challenger.checkWhitelist = function (codeString, whitelist) {
        // try to check if `codeString` passes `whitelist` test. If esprima
        // throws an error because the code is invalid, return false.
        try {
            return challenger.validateWhitelist(esprima.parse(codeString), whitelist);
        } catch (e) {
            //console.log(e);
            return false;
        }
    };

    challenger.checkBlacklist = function (codeString, blacklist) {
        // try to check if `codeString` passes `blacklist` test. If esprima
        // throws an error because the code is invalid, return false.
        try {
            return challenger.validateBlacklist(esprima.parse(codeString), blacklist);
        } catch (e) {
            //console.log(e);
            return false;
        }
    };

    challenger.checkSnippets = function (codeString, snippetStrings) {
        // parse all of the `snippetStrings` and try to check if parsed `codeString` 
        // contains each of them. If esprima throws an error, return false.
        var snippets = [];
        for (var i = 0; i < snippetStrings.length; i++) {
            try {
                // take the first element of the given code as the root of the snippet
                snippets.push(esprima.parse(snippetStrings[i]).body[0]);
            } catch (e) {
                //console.log(e);
                return false;
            }
        }
        try {
            return challenger.validateSnippets(esprima.parse(codeString), snippets);
        } catch (e) {
            //console.log(e);
            return false;
        }
    };

    challenger.checkIsValid = function (codeString) {
        // If esprima throws no errors, `codeString` is valid.
        try {
            esprima.parse(codeString);
        } catch (e) {
            //console.log(e);
            return false;
        }
        return true;
    };

    challenger.validateWhitelist = function (ast, whitelist) {
        // Check that each element of `whitelist` is present in `ast`.
        var results = [];
        for (var i = 0; i < whitelist.length; i++) {
            // If the node is present in `ast`, the test passes.
            // Otherwise, it fails.
            results[i] = challenger.containsNode(ast, whitelist[i]);
        }
        return results;
    };

    challenger.validateBlacklist = function (ast, blacklist) {
        // Check that _no_ element of `blacklist` is in `ast`.
        var results = [];
        for (var i = 0; i < blacklist.length; i++) {
            // If the node is present in `ast`, the test fails.
            // Otherwise, it passes.
            results[i] = !challenger.containsNode(ast, blacklist[i]);
        }
        return results;
    };

    challenger.validateSnippets = function (ast, snippets) {
        // Check that each snippet in `snippets` is present in `ast`.
        for (var i = 0; i < snippets.length; i++) {
            // If at least one snippet is not present in `ast`, the test fails.
            if(!challenger.containsSnippet(ast, snippets[i])) {
                return false;
            }
        }
        // All snippets are present in `ast`. Return true.
        return true;
    };

    challenger.containsNode = function (ast, nodeType) {
        var nodeBody;
        // First, check if the root of `ast` is a match.
        if (ast.type === nodeType) {
            return true;
        }
        // Handle a variety of edge cases where ast.body
        // is not the primary or only body of the node:
        nodeBody = challenger.getBodyOfNode(ast);
        // Next, check if at a leaf node. If so, return false.
        if (!nodeBody) {
            return false;
        }
        // `nodeBody` is either an array of statements, or a statement itself.
        // If it is an array of statements, search each element of `nodeBody`.
        if(Array.isArray(nodeBody)) {
            for (var i = 0; i < nodeBody.length; i++) {
                // Recurse.
                if (challenger.containsNode(nodeBody[i], nodeType)) {
                    return true;
                }
            }
        } else {
            // If `nodeBody` is not an array, search it directly.
            return challenger.containsNode(nodeBody, nodeType);
        }
        // `ast` has been completely searched, and `nodeType` has not matched; return false.
        return false;
    };

    challenger.containsSnippet = function (ast, snippet) {
        var nodeBody;
        // If `ast` matches `snippet`, return true.
        if (challenger.matchesSnippet(ast, snippet)) {
            return true;
        }
        nodeBody = challenger.getBodyOfNode(ast);
        // If ast is a leaf, return false.
        if (!nodeBody) {
            return false;
        }
        // If `nodeBody` is an array, see if one of its elements contains `snippet`.
        if (Array.isArray(nodeBody)) {
            for (var i = 0; i < nodeBody.length; i++) {
                if(challenger.containsSnippet(nodeBody[i], snippet)) {
                    return true;
                }
            }
        } else {
            // Otherwise, search `nodeBody` directly.
            return challenger.containsSnippet(nodeBody, snippet);
        }
        return false;
     };

     /** 
      * Checks a given AST against a given subtree; in other words, that 
      * a subtree of some height rooted at `ast` is equivalent to `snippet`.
      */
     challenger.matchesSnippet = function (ast, snippet) {
        // If `ast` is falsy (it could be undefined because of the for-loop below), 
        // or if its type does not match the type of `snippet`,
        // or if `snippet` has a body and ast does not (`snippet` is not a leaf while `ast` is),
        // then return false.
        if(!ast) return false;
        var nodeBody = challenger.getBodyOfNode(ast),
            snippetBody = challenger.getBodyOfNode(snippet);
        if (ast.type !== snippet.type || snippetBody && !nodeBody) {
            return false;
        }
        // If `snippet` has a body (there is more to search):
        // - If its body is an array, make sure each child node of `ast` matches against the children of `snippet`.
        // - Otherwise, search body directly
        if (snippetBody && Array.isArray(nodeBody)) {
            for (var i = 0; i < snippetBody.length; i++) {
                return challenger.matchesSnippet(nodeBody[i], snippetBody[i]);
            }
        } else if (snippetBody) {
            return challenger.matchesSnippet(nodeBody, snippetBody);
        }
        // If `ast` and `snippet` are both leaves, and the type of `ast` matches that of snippet, then return true.
        return true;
     };

     challenger.getBodyOfNode = function (ast) {
        var body;
        if (ast.type === 'IfStatement') {
            body = [];
            body.push(ast.consequent);
            if(ast.alternate) {
                body.push(ast.alternate);
            }
        } else if (ast.type === 'SwitchStatement') {
            body = ast.cases;
        } else if (ast.type === 'SwitchCase') {
            body = ast.consequent;
        } else if (ast.type === 'TryStatement') {
            body = [];
            body.push(ast.block);
            if(ast.handler) {
                body.push(ast.handler);
            }
        } else if (ast.type === 'ReturnStatement') {
            body = ast.argument;
        } else if (ast.type === 'VariableDeclaration') {
            body = ast.declarations;
        } else if (ast.type === 'VariableDeclarator') {
            body = ast.init;
        } else if (ast.type === 'ArrayExpression') {
            body = ast.elements; 
        } else if (ast.type === 'CallExpression') {
            body = ast.callee; 
        } else {
            body = ast.body;
        }
        return body;
     };

    return challenger;

};
