$(document).ready(function () {
    var test_one = $('#test_one').text(),
        snippet_one = $('#snippet_one').text(),
        snippet_three = $('#snippet_two').text();
    var ch = challenger (esprima);
    console.log(ch.containsSnippet(test_one, snippet_two));
    

});
