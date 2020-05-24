// ==UserScript==
// @name         LOGrar
// @namespace    pstux.dev
// @version      1.0-alpha
// @description  Rapid log inspection for lobster
// @author       Pierlauro Sciarelli
// @match        https://logkeeper.mongodb.org/lobster/build/5449fd3c31e9b471aa0557f6f44e63c5/test/5ec697e2f84ae8682b012268
// @grant        none
// ==/UserScript==

'use strict'

function inspectBF(){
    /* ---- BEGIN redux state magic
        * https://stackoverflow.com/a/57909332 */
    const appStates = [];
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
            var state = base.pendingProps.store.getState();
            appStates.push(state);
        } catch (e) {
            /* no state */
        }
        base = base.child;
    }
    /* ---- END magic */

    const BFregex = new RegExp("assert|frame|invariant failure|stacktrace|backtrace|failed to load|segmentation fault|error occurred");

    const appState = appStates[0];

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

var toolbar = document.getElementsByClassName('btn-toolbar')[0]
// TODO remove dirty hack to inject function, append function to window context
toolbar.innerHTML += '<button type="button" class="btn btn-default" onclick=\'' + inspectBF.toString().replace(/\n|\t/g,' ') + '; inspectBF();\'>BF 💩</button>'

