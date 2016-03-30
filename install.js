"use strict"

// Get the file system
const fs = require("fs-extra")
const path = require("path")
require("colors")

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
else {
  if (!config.frontend.src) {
    config.frontend.src = `${install_to}/src`
  }

  if (!config.frontend.build) {
    config.frontend.build = `${install_to}/build`
  }
}

fs.stat(config.frontend.src, (err, stats) => {
  if (stats) {
    /* eslint-disable */
    return console.log(`Not overwriting your theme: "${config.frontend.src}"`.blue)
    /* eslint-enable */
  }
  else {
    // Copy the template files over.
    fs.copy(path.resolve("./templates"), config.frontend.src, err => {
      if (err) {
        /* eslint-disable */
        console.error(`
          ${"Error installing default frontend source.".underline.bold}

          Please copy "${path.resolve("./templates")}" to "${install_to}/src" manually.
        `.red.bold)
        /* eslint-enable */
      }
    })

    // Rewrite the config file.
    /* eslint-disable */
    console.error(`
      ${"Could not write to your config file.".underline.bold}

      Please add:

      frontend: {
        src: "${install_to}/src",
        build: "${install_to}/build"
      }

      to "${config_path}".
    `.yellow)
    /* eslint-enable */
  }
})
