"use strict"

// Get some tools.
const Utils = require("./utils")
const path = require("path")

class Template_Generator {
  constructor(names, multicolour) {
    // The view data.
    this.data = {
      names: names,
      config: Utils.map_to_object(multicolour.get("config")),
      directives: []
    }

    // The default theme source directory is
    // in this module unless otherwise specified.
    this.theme_src_dir = path.resolve(__dirname, "../templates")
    this.theme_build_dir = path.join(multicolour.get("config").get("content"), "/frontend/build")

    // Check for a new source directory.
    if (multicolour.get("config").get("frontend").theme_src_dir) {
      this.theme_src_dir = multicolour.get("config").get("frontend").theme_src_dir
    }

    // Check for a new build directory.
    if (multicolour.get("config").get("frontend").theme_build_dir) {
      this.theme_build_dir = multicolour.get("config").get("frontend").theme_build_dir
    }

    // Check for a list of extra directives.
    const directives_path = `${this.theme_src_dir}/frontend.json`
    Utils.file_exists(directives_path, (err, exists) => {
      if (exists) {
        // Uncache the directives.
        delete require.cache[require.resolve(directives_path)]

        // Get it again.
        this.data.directives = require(directives_path)
      }
    })
  }

  run_compile_routine_with_fallbacks(type, next) {
    // The template location.
    let template = `${this.theme_src_dir}/${type}.jade`

    // The destination for the compiled file.
    const destination = `${this.theme_build_dir}/${type}.html`

    // Check if the template file exists.
    Utils.file_exists(template, (err, exists) => {
      // If the template doesn't exist, fallback to the default one.
      if (!exists) {
        template = path.resolve(__dirname, "../templates/${type}.jade")
      }

      // Compile the template.
      Utils.compile_template(template, destination, this.data, err => next(err, err ? null : this))
    })
  }

  generate(next) {
    const Async = require("async")

    Async.parallel([
      next => this.run_compile_routine_with_fallbacks("index", next),
      next => this.run_compile_routine_with_fallbacks("elements", next),
      next => this.run_compile_routine_with_fallbacks("overview", next)
    ], next)
  }
}

module.exports = Template_Generator
