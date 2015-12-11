"use strict"

// Get some tools.
const Utils = require("./utils")
const path = require("path")

class Generator {
  constructor(model, multicolour) {
    require("map.prototype.tojson")

    // Check we got a model.
    if (!model) {
      throw new ReferenceError("No model to generate from.")
    }

    // Check we have a host.
    if (!multicolour) {
      throw new ReferenceError("No host to generate to.")
    }

    // Set our properties.
    this.host = multicolour
    this.attributes = model._attributes
    this.name = model.adapter.identity

    const config_as_json = multicolour.get("config").toJSON()

    // The view data.
    this.data = {
      attributes: this.attributes,
      name: this.name,
      config: config_as_json,
      api_root: config_as_json.frontend.api_root ||
        `http://${config_as_json.api_connections.host}:${config_as_json.api_connections.port}`
    }

    // The default theme source directory is
    // in this module unless otherwise specified.
    this.theme_src_dir = path.resolve(__dirname, "../templates")
    this.theme_build_dir = path.join(this.host.get("config").get("content"), "/frontend/build")

    // Check for a new source directory.
    if (multicolour.get("config").get("frontend").theme_src_dir) {
      this.theme_src_dir = multicolour.get("config").get("frontend").theme_src_dir
    }

    // Check for a new build directory.
    if (multicolour.get("config").get("frontend").theme_build_dir) {
      this.theme_build_dir = multicolour.get("config").get("frontend").theme_build_dir
    }
  }

  run_compile_routine_with_fallbacks(type, next) {
    // The destination for the compiled file.
    const destination = `${this.theme_build_dir}/${this.name}/${type}.html`

    // The default template location.
    let template = `${this.theme_src_dir}/${this.name}/${type}.jade`

    // Check if the template file exists.
    Utils.file_exists(template, (err, exists) => {
      // If the template doesn't exist, fallback until we find one.
      if (!exists) {
        // Fallback to the generic template in the src dir.
        template = `${this.theme_src_dir}/${type}.jade`

        // Fallback to a generic template within the module.
        Utils.file_exists(template, (err, exists) => {
          if (!exists) {
            template = path.join(path.resolve(__dirname, "../templates/"), type)
          }

          // Compile the template.
          Utils.compile_template(template, destination, this.data, err => next(err, err ? null : this))
        })
      }
      else {
        // Compile the template.
        Utils.compile_template(template, destination, this.data, err => next(err, err ? null : this))
      }
    })
  }

  template(next) {
    // Compile the template.
    this.run_compile_routine_with_fallbacks("index", next)

    // Exit.
    return this
  }

  list(next) {
    // Compile the template.
    this.run_compile_routine_with_fallbacks("list", next)

    // Exit.
    return this
  }

  single(next) {
    // Compile the template.
    this.run_compile_routine_with_fallbacks("single", next)

    // Exit.
    return this
  }

  create(next) {
    // Compile the template.
    this.run_compile_routine_with_fallbacks("create", next)

    // Exit.
    return this
  }

  read(next) {
    // Compile the template.
    this.run_compile_routine_with_fallbacks("read", next)

    // Exit.
    return this
  }

  update(next) {
    // Compile the template.
    this.run_compile_routine_with_fallbacks("update", next)

    // Exit.
    return this
  }
}

module.exports = Generator
