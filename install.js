"use strict"

// Get the file system
const fs = require("fs-extra")
const path = require("path")

// Where will the themes go?
const install_to = path.resolve("../../content/frontend")

// Get the user's config.
const config_path = require.resolve("../../config.js")
const config = require(config_path)

// Check if there is config for the frontend already.
if (!config.hasOwnProperty("frontend")) {
  config.frontend = {
    src: `${install_to}/src`,
    build: `${install_to}/build`
  }
}

fs.stat(config.frontend.src, (err, stats) => {
  if (stats) {
    /* eslint-disable */
    console.log(`Not overwriting your theme: "${config.frontend.src}"`)
    /* eslint-enable */

    process.exit(1)
  }
  else {
    // Copy the template files over.
    fs.copy(path.resolve("./templates"), config.frontend.src  + "ss", err => {
      if (err) {
        /* eslint-disable */
        console.error(`
          Error installing default frontend source.
          Please copy "${path.resolve("./templates")}" to
          "${install_to}/src" manually
        `)
        /* eslint-enable */
        process.exit(1)
      }
    })

    // Rewrite the config file.
    /* eslint-disable */
    console.error(`
      Please add:

      frontend: {
        src: "${install_to}/src",
        build: "${install_to}/build"
      }

      to "${config_path}".
    `)
    /* eslint-enable */
  }
})
