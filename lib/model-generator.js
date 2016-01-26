"use strict"

// Get some tools.
const Utils = require("./utils")
const path = require("path")

class Generator {
  constructor(model, host) {
    // Check we got a model.
    if (!model) {
      throw new ReferenceError("No model to generate from.")
    }

    // Check we have a host.
    if (!host) {
      throw new ReferenceError("No host to generate to.")
    }

    // Set our properties.
    this.host = host
    this.multicolour = host.host
    this.attributes = model._attributes
    this.name = model.adapter.identity

    // Convert the Map to JSON for the view.
    const config_as_json = Utils.map_to_object(this.multicolour.get("config"))

    // The view data.
    this.data = {
      attributes: this.attributes,
      writable_attributes: this.get_writable_attributes(),
      name: this.name,
      config: config_as_json,
      package: require("../../../package.json"),
      api_root: config_as_json.frontend && config_as_json.frontend.api_root ? config_as_json.frontend.api_root :
        `http://${config_as_json.api_connections.host || "localhost"}:${config_as_json.api_connections.port}`
    }
  }

  get_writable_attributes() {
    // What isn't writable.
    const non_writable = ["id", "createdAt", "updatedAt"]

    // What we'll return
    const out = {}

    // The keys that can be written.
    const out_keys = Object.keys(this.attributes).filter(attr => non_writable.indexOf(attr) < 0)

    // Recreate the object.
    out_keys.forEach(attr => out[attr] = this.attributes[attr])

    // Return the object.
    return out
  }

  run_compile_routine_with_fallbacks(type, next) {
    // The destination for the compiled file.
    const destination = `${this.host.build}/${this.name}/${type}.html`

    // The default template location.
    let template = `${this.host.src}/${this.name}/${type}.jade`

    // Check if the template file exists.
    Utils.file_exists(template, (err, exists) => {
      // If the template doesn't exist, fallback until we find one.
      if (!exists) {
        // Fallback to the generic template in the src dir.
        template = `${this.host.src}/${type}.jade`

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
