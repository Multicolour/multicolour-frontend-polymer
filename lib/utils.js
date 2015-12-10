"use strict"

class Utils {
  /**
   * Check whether a file exists at a certain
   * path and call the callback with whether
   * it exists or not.
   * @param  {String}   path to check if it exists.
   * @param  {Function} callback to run when finished.
   * @return {void}
   */
  static file_exists(path, callback) {
    // Get the file system library.
    const fs = require("fs")

    // Check the file exists.
    fs.stat(path, err => callback(err, err === null))
  }

  static compile_template(template_path, destination_path, data, callback) {
    // Get some tools.
    const fs = require("fs")
    const path = require("path")
    const jade = require("jade")
    const mkdirp = require("mkdirp")

    // Read the template.
    fs.readFile(template_path, (err, template_contents) => {
      // Compile the template.
      const template = jade.compile(template_contents, {
        pretty: true
      })

      // Make sure the folder exists.
      mkdirp.sync(path.dirname(destination_path))

      // Write the file.
      fs.writeFile(destination_path, template(data), callback)
    })
  }

  static copy_static_assets(config, next) {
    // Get some tools.
    const Async = require("async")
    const fs = require("fs-extra")
    const path = require("path")

    // Work out where it's coming from
    // and where it's going.
    const source = path.resolve(__dirname, "../templates")
    const destination = config.get("frontend").theme_build_dir ||
      path.join(config.get("content"), "/frontend/build")

    // Copy the js folder.
    Async.parallel([
      next => fs.copy(`${source}/js`, `${destination}/js`, next),
      next => {
        // Don't bash any existing bower.json
        fs.stat(`${destination}/bower.json`, err => {
          if (err) {
            fs.copy(`${source}/bower.json`, `${destination}/bower.json`, next)
          }
          else {
            /* eslint-disable*/
            console.log("Not overwriting existing bower.json.")
            /* eslint-enable*/
          }
        })
      }
    ], err => {
      if (err) {
        throw err
      }
    })
  }
}

module.exports = Utils
