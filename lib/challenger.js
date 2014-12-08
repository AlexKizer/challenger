challenger = function (esprima) {
    "use strict";
    var challenger = {};

    /**
     * Checks if a code string contains each node in array `whitelist`.
     * @param codeString A string of JavaScript code.
     * @param whitelist An array of AST node type strings.
     * @returns results An array of boolean values indicating pass (true) or fail (false) for each node in `whitelist`.
     */
    challenger.checkWhitelist = function (codeString, whitelist) {
        // try to check if `codeString` passes `whitelist` test. If esprima
        // throws an error because the code is invalid, return false.
        try {
            return challenger.checkWhitelistAST(esprima.parse(codeString), whitelist);
        } catch (e) {
            // console.log(e);
            return false;
        }
    };

    /**
     * Checks if a code string contains no nodes in array `blacklist`.
     * @param codeString A string of JavaScript code.
     * @param blacklist An array of AST node type strings.
     * @returns results An array of boolean values indicating pass (true) or fail (false) for each node in `blacklist`.
     */
    challenger.checkBlacklist = function (codeString, blacklist) {
        // try to check if `codeString` passes `blacklist` test. If esprima
        // throws an error because the code is invalid, return false.
        try {
            return challenger.checkBlacklistAST(esprima.parse(codeString), blacklist);
        } catch (e) {
            // console.log(e);
            return false;
        }
    };

    /**
     * Checks if a code string contains each code snippet in `snippetStrings` array.
     * @param codeString A string of JavaScript code.
     * @param snippetStrings An array of JavaScript code snippets.
     * @returns results An array of boolean values indicating pass (true) or fail (false) for each snippet in
     * `snippetStrings`.
     */
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
            return challenger.checkSnippetsAST(esprima.parse(codeString), snippets);
        } catch (e) {
            //console.log(e);
            return false;
        }
    };

    /**
     * Checks if a code string is valid JavaScript.
     * @param codeString A string of JavaScript code.
     * @returns results A boolean that is true if `codeString` is valid, or false otherwise.
     */
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

    challenger.checkWhitelistAST = function (ast, whitelist) {
        // Check that each element of `whitelist` is present in `ast`.
        var results = [];
        for (var i = 0; i < whitelist.length; i++) {
            // If the node is present in `ast`, the test passes.
            // Otherwise, it fails.
            results[i] = challenger.containsNode(ast, whitelist[i]);
        }
        return results;
    };

    challenger.checkBlacklistAST = function (ast, blacklist) {
        // Check that _no_ element of `blacklist` is in `ast`.
        var results = [];
        for (var i = 0; i < blacklist.length; i++) {
            // If the node is present in `ast`, the test fails.
            // Otherwise, it passes.
            results[i] = !challenger.containsNode(ast, blacklist[i]);
        }
        return results;
    };

    challenger.checkSnippetsAST = function (ast, snippets) {
        // Check that each snippet in `snippets` is present in `ast`.
        var results = [];
        for (var i = 0; i < snippets.length; i++) {
            // If the snippet is  present in `ast`, the test passes.
            // Otherwise, it fails.
            results[i] = challenger.containsSnippet(ast, snippets[i]);
        }
        return results;
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
        if (isArray(nodeBody)) {
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
        if (isArray(nodeBody)) {
            for (var i = 0; i < nodeBody.length; i++) {
                if (challenger.containsSnippet(nodeBody[i], snippet)) {
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
        if (!ast) return false;
        var nodeBody = challenger.getBodyOfNode(ast),
            snippetBody = challenger.getBodyOfNode(snippet);
        if (ast.type !== snippet.type || snippetBody && !nodeBody) {
            return false;
        }
        // If `snippet` has a body (there is more to search):
        // - If its body is an array, make sure each child node of `ast` matches against the children of `snippet`.
        // - Otherwise, search body directly
        if (snippetBody && isArray(nodeBody)) {
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
            body = new Array();//[];
            body.push(ast.consequent);
            if (ast.alternate) {
                body.push(ast.alternate);
            }
        } else if (ast.type === 'SwitchStatement') {
            body = ast.cases;
        } else if (ast.type === 'SwitchCase') {
            body = ast.consequent;
        } else if (ast.type === 'TryStatement') {
            body = new Array();//[];
            body.push(ast.block);
            if (ast.handler) {
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

    // necessary because IE8 doesn't support Array.isArray
    function isArray(arr) {
       /*if(Array.isArray) {
           return Array.isArray(arr);
       }*/
       return Object.prototype.toString.call(arr) === '[object Array]';
    }

    return challenger;

};
