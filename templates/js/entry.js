/* global document window */

/*
 * This file checks for native web components
 * support, if there is no support (Safari, IE, Firefox)
 * it will load the webcomponents lite polyfill.
 *
 * It also sets up the app wide binding on #app and
 * makes the app global available.
 */
(function() {
  "use strict"

  /**
   * Set default headers for all XHR
   * requests here.
   * @return {HTMLTemplateElement}
   */
  function set_default_headers() {
    // The app is available everywhere.
    window.app = document.querySelector("#app")

    // When the app is ready, add the stuff we need like XHR headers.
    window.app.set("headers", Object.freeze({
      accept: "application/vnd.api+json"
    }))

    return window.app
  }

  // Do we have native components?
  var native_components_support = (
    "registerElement" in document &&
    "import" in document.createElement("link") &&
    "content" in document.createElement("template")
  )

  // If not, add the webcomponents polyfill.
  if (!native_components_support) {
    // When we're ready, set the defaults.
    window.addEventListener("WebComponentsReady", set_default_headers)

    // Add the shim.
    var script = document.createElement("script")
    script.async = true
    script.src = "/bower_components/webcomponentsjs/webcomponents-lite.min.js"
    document.head.appendChild(script)
  }
  else {
    // Set the default headers.
    set_default_headers()
  }
})()
