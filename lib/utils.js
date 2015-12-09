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
    const jade = require("jade")

    // Read the template.
    fs.readFile(template_path, (err, template_contents) => {
      // Compile the template.
      const template = jade.compile(template_contents)

      // Write the file.
      fs.writeFile(destination_path, template(data), callback)
    })
  }
}

module.exports = Utils
