window.challenger = function (esprima) {

    var challenger = {};

    challenger.validateTest = function (ast, test) {
        return challenger.validateWhitelist(ast, test.whitelist) &&
               challenger.validateBlacklist(ast, test.blacklist) &&
               challenger.validateSnippets(ast, test.snippets);
    };

    challenger.checkWhitelist = function (codeString, whitelist) {
        try {
            return challenger.validateWhitelist(esprima.parse(codeString), whitelist);
        } catch (e) {
            return false;
        }
    };

    challenger.checkBlacklist = function (codeString, blacklist) {
        try {
            return challenger.validateBlacklist(esprima.parse(codeString), blacklist);
        } catch (e) {
            return false;
        }
    };

    challenger.checkSnippets = function (codeString, snippetStrings) {
        var snippets = [];
        for (var i = 0; i < snippetStrings.length; i++) {
            try {
                snippets.push(esprima.parse(snippetStrings[i]));
            } catch (e) {
                return false;
            }
        }
        try {
            return challenger.checkSnippets(esprima.parse(codeString), snippets);
        } catch (e) {
            return false;
        }
    };

    challenger.checkIsValid = function (codeString) {
        try {
            esprima.parse(codeString);
        } catch (e) {
            return false;
        }
        return true;
    };

    challenger.validateWhitelist = function (ast, whitelist) {
        // Check that each element of `whitelist` is present in `ast`.
        for (var i = 0; i < whitelist.length; i++) {
            // If at least one element of `whitelist` is not present in `ast`, the test fails.
            if (!challenger.containsNode(ast, whitelist[i])) {
                return false;
            }
        }
        // All elements of `whitelist` are in `ast`. Return true.
        return true;
    };

    challenger.validateBlacklist = function (ast, blacklist) {
        // Check that _no_ element of `blacklist` is in `ast`.
        for (var i = 0; i < blacklist.length; i++) {
            // If at least one element of `blacklist` is present in `ast`, the test fails.
            if (challenger.containsNode(ast, blacklist[i])) {
                return false;
            }
        }
        // No elements of `blacklist` are in `ast`. Return true.
        return true;
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
        // First, check if the root of `ast` is a match.
        if (ast.type === nodeType) {
            return true;
        }
        // Next, check if at a "leaf" node. If so, return false.
        if (!ast.body) {
            return false;
        }
        // `ast.body` is either an array of statements, or a statement itself.
        // If it is an array of statements, search each element of `ast.body`.
        if(Array.isArray(ast.body)) {
            for (var i = 0; i < ast.body.length; i++) {
                if (challenger.containsNode(ast.body[i], nodeType)) {
                    return true;
                }
            }
        } else {
            // If `ast.body` is not an array, search it directly.
            return challenger.containsNode(ast.body, nodeType);
        }
        // `ast` has been completely searched, and `nodeType` has not matched; return false.
        return false;
    };

    /**
     * Checks if a given AST contains a `snippet`.
     */
    challenger.containsSnippet = function (ast, snippet) {
        // If `ast` matches `snippet`, return true.
        if (challenger.matchesSnippet(ast, snippet)) {
            return true;
        }
        // If ast is a leaf, return false.
        if (!ast.body) {
            return false;
        }
        // If `ast.body` is an array, see if one of its elements contains `snippet`.
        if (Array.isArray(ast.body)) {
            for (var i = 0; i < ast.body.length; i++) {
                if(challenger.containsSnippet(ast.body[i], snippet)) {
                    return true;
                }
            }
        } else {
            // Otherwise, search `body` directly.
            return challenger.containsSnippet(ast.body, snippet);
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
        if (!ast || ast.type !== snippet.type || snippet.body && !ast.body) {
            return false;
        }
        // If `snippet` has a body (there is more to search):
        // - If its body is an array, make sure each child node of `ast` matches against the children of `snippet`.
        // - Otherwise, search body directly
        if (snippet.body && Array.isArray(ast.body)) {
            for (var i = 0; i < snippet.body.length; i++) {
                return challenger.matchesSnippet(ast.body[i], snippet.body[i]);
            }
        } else if (snippet.body) {
            return challenger.matchesSnippet(ast.body, snippet.body);
        }
        // If `ast` and `snippet` are both leaves, and the type of `ast` matches that of snippet, then return true.
        return true;
     };

    return challenger;

};
