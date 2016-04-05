"use strict"

// Get some tools.
const Utils = require("./utils")
const path = require("path")

class Template_Generator {
  constructor(names, host) {
    // Convert the Map to JSON for the view.
    const config_as_json = Utils.map_to_object(host.host.get("config"))

    // The view data.
    this.data = {
      names: names,
      meta: host._custom_data,
      config: Utils.map_to_object(host.host.get("config")),
      package: require("../../../package.json"),
      directives: [],
      type_to_html_input_type: Utils.type_to_html_input_type,
      type_to_js_native: Utils.type_to_js_native,
      api_root: config_as_json.frontend && config_as_json.frontend.api_root ? config_as_json.frontend.api_root :
        `http://${config_as_json.api_connections.host || "localhost"}:${config_as_json.api_connections.port}`
    }

    // Set the host.
    this.host = host

    // Check for a list of extra directives.
    const directives_path = `${this.host.src}/frontend.json`
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
    let template = `${this.host.src}/${type}.jade`

    // The destination for the compiled file.
    const destination = `${this.host.build}/${type}.html`

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
