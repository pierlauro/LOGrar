// ==UserScript==
// @name         LOGrar
// @namespace    pstux.dev
// @version      1.0-beta
// @description  Rapid log inspection for lobster
// @author       Pierlauro Sciarelli
// @match        https://logkeeper.mongodb.org/lobster/build/*
// @match        https://evergreen.mongodb.org/lobster/build/*
// @grant        none
// ==/UserScript==

'use strict'

function inspectBF(){
    /* ---- BEGIN redux state magic
     * https://stackoverflow.com/a/57909332 */
    var appState;
    const reactRoot = document.getElementById("root");
    let base;

    try {
        base = reactRoot._reactRootContainer._internalRoot.current;
    } catch (e) {
        console.log("Could not get internal root information from reactRoot element");
        throw e;
    }

    while (base) {
        try {
            appState = base.pendingProps.store.getState();
            break;
        } catch (e) {
            /* no state, keep on searching */
        }
        base = base.child;
    }
    /* ---- END magic */

    console.assert(appState);

    /* TODO allow dinamically modifying the regex from a textarea */
    const BFregex = new RegExp("DBException::toString|fassert|assert\\.|\"frame\"|invariant[ |\(\)]|got signal|stacktrace|backtrace|failed to load|segmentation fault|error occurred|\"FAIL(URE)?\"|throwing exception", "i");

    const logLines = appState.log.lines;

    const beginUriSeparator = "bookmarks=";
    const bookmarksSeparator = "%2C";
    const endUriSeparator = "&";

    const beginUri = window.location.href.split(beginUriSeparator)[0];
    const endUri = window.location.href.split(endUriSeparator)[1];

    var bookmarks = window.location.href.split(beginUriSeparator)[1].split(endUriSeparator)[0].split(bookmarksSeparator).map(Number).sort(function(i, j) { return i - j; });

    logLines.forEach(line => {
        if(line.text.match(BFregex)){
            bookmarks.push(line.lineNumber);
        }
    });

    bookmarks = new Set(bookmarks).toJSON();
    bookmarks.map(Number).sort(function(i, j) { return i - j; });

    window.location.href = beginUri + beginUriSeparator + bookmarks.join(bookmarksSeparator) + endUriSeparator + endUri;
}

// Adding button to toolbar (injecting function code for cross-browser compatibility)
var toolbar = document.getElementsByClassName('nav nav-pills')[0]
toolbar.innerHTML += '<button type="button" class="btn btn-default" onclick=\'' + inspectBF.toString().replace(/\n|\t/g,' ') + '; inspectBF();\'>BF 💩</button>'
