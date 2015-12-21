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

  static map_to_object(map) {
    const out = Object.create(null)
    map.forEach((value, key) => {
      if (value instanceof Map) {
        out[key] = Utils.map_to_object(value)
      }
      else {
        out[key] = value
      }
    })
    return out
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
      try {
        const template = jade.compile(template_contents, {
          pretty: true
        })

        // Make sure the folder exists.
        mkdirp.sync(path.dirname(destination_path))

        // Write the file.
        fs.writeFile(destination_path, template(data), callback)
      } catch (compile_error) {
        /* eslint-disable */
        console.error(`
          An error occured while compiling "${template_path}".
          The error was:

          "${compile_error.message}"
          ${compile_error.stack}
        `)
        /* eslint-enable */
      }
    })
  }

  static copy_static_assets(config) {
    // Get some tools.
    const Async = require("async")
    const fs = require("fs-extra")
    const path = require("path")

    // Work out where it's coming from
    // and where it's going.
    const source = config.get("frontend").theme_src_dir ||
      path.resolve(__dirname, "../templates")
    const destination = config.get("frontend").theme_build_dir ||
      path.join(config.get("content"), "/frontend/build")

    // Copy some other assets.
    Async.parallel([
      next => fs.copy(`${source}/js`, `${destination}/js`, next),
      next => fs.copy(`${source}/bower.json`, `${destination}/bower.json`, next)
    ], err => {
      if (err) {
        throw err
      }
    })
  }
}

module.exports = Utils
