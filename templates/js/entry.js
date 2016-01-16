/* global document */

/*
 * This file checks for native web components
 * support, if there is no support (Safari, IE)
 * it will load the webcomponents lite polyfills.
 */
(function() {
  "use strict"

  // Do we have native components?
  var nativeComponents = (
    "registerElement" in document &&
    "import" in document.createElement("link") &&
    "content" in document.createElement("template")
  )

  // If not, add the webcomponents polyfill.
  if (!nativeComponents) {
    var script = document.createElement("script")
    script.async = true
    script.src = "./bower_components/webcomponentsjs/webcomponents-lite.min.js"
    document.head.appendChild(script)
  }
})()
