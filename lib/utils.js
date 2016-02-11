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

  /**
   * Convert the config map to a JSON dictionary, recursively.
   * @param  {Map} map to convert.
   * @return {Object} JSON dictionary of the Map.
   */
  static map_to_object(map) {
    // Create a bare object.
    const out = Object.create(null)

    // Loop over each key value in the Map.
    map.forEach((value, key) => {
      // Check for recursion.
      if (value instanceof Map) {
        out[key] = Utils.map_to_object(value)
      }
      else {
        out[key] = value
      }
    })

    // Return the object.
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

  /**
   * Copy static assets from src to build.
   * @param  {String} src to copy assets from. (js, bower.json)
   * @param  {String} build target.
   * @return {void}
   */
  static copy_static_assets(src, build) {
    // Get some tools.
    const Async = require("async")
    const fs = require("fs-extra")

    // Copy some other assets.
    Async.parallel([
      // js
      next => fs.copy(`${src}/js`, `${build}/js`, next),

      // css
      next => fs.copy(`${src}/css`, `${build}/css`, next),

      // assets
      next => fs.copy(`${src}/assets`, `${build}/assets`, next),

      // Bower stuffs.
      next => fs.copy(`${src}/bower.json`, `${build}/bower.json`, next),
      next => fs.copy(`${src}/bower_components`, `${build}/bower_components`, next)
    ], err => {
      if (err) {
        throw err
      }
    })
  }

  /**
   * Swap some basic types around.
   * @param  {String} type to convert.
   * @return {String} HTML friendly input type.
   */
  static type_to_html_input_type(type) {
    switch (type) {
    case "integer":
    case "float":
      return "number"
    case "date":
    case "datetime":
    case "time":
      return "date"
    case "string":
    case "text":
    default:
      return "text"
    }
  }

  static type_to_js_native(type) {
    switch (type) {
    case "integer":
    case "float":
      return "Number"
    case "date":
    case "datetime":
    case "time":
      return "Date"
    case "json":
      return "Object"
    case "array":
      return "Array"
    case "boolean":
      return "Boolean"
    case "string":
    case "text":
    default:
      return "String"
    }
  }
}

module.exports = Utils
