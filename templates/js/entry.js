/* global document window */

/*
 * This file checks for native web components
 * support, if there is no support (Safari, IE, Firefox)
 * it will load the webcomponents lite polyfill.
 */
(function() {
  "use strict"

  // The app is available everywhere.
  window.app = document.querySelector("#app")

  // Do we have native components?
  var native_components_support = (
    "registerElement" in document &&
    "import" in document.createElement("link") &&
    "content" in document.createElement("template")
  )

  // If not, add the webcomponents polyfill.
  if (!native_components_support) {
    var script = document.createElement("script")
    script.async = true
    script.src = "./bower_components/webcomponentsjs/webcomponents-lite.min.js"
    document.head.appendChild(script)
  }

  // When the app is ready, add the stuff we need like XHR headers.
  window.app.addEventListener("dom-change", function app_ready() {
    window.app.set("headers", { accept: "application/vnd.api+json" })
  })
})()
