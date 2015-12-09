"use strict"

const Model_Generator = require("./lib/generator")

class Multicolour_Frontend_Polymer {
  constructor() {
    this.targets = null
    this.config = null
    this.host = null
    this.has_requested = false
  }

  register(multicolour) {
    // Set the host.
    this.host = multicolour

    // Set the targets to the models.
    this.targets = multicolour.get("database").get("models")

    // Get the config from Multicolour.
    this.config = multicolour.get("config")

    // Register the frontend.
    multicolour.reply("frontend", this)

    // Listen for when the host is ready.
    multicolour.on("server_starting", server => {
      // Get the host
      const host = server.request("host")
      this.targets = host.get("database").get("models")

      // If we requested to generate but there where
      // no models set (because the server wasn't ready)
      // make sure to try again now that we're ready.
      if (this.has_requested) {
        this.generate()
      }
    })
  }

  server() {

  }

  generate() {
    // Get the tools.
    const Async = require("async")

    if (!this.targets) {
      this.has_requested = true
      return this
    }

    // Generate the templates in parallel.
    Async.waterfall(
      [
        // Get the model names.
        callback => callback(null,
          Object.keys(this.targets)
            // Make an array of models.
            .map(key => this.targets[key])

            // Filter out the junction tables.
            .filter(model => !model.meta.junctionTable)
        ),

        // Create the generators
        (models, callback) => callback(null, models.map(model => new Model_Generator(model, this.host))),

        // Generate the templates.
        (generators, callback) => generators.forEach(generator => Async.parallel([
          template_callback => generator.template(template_callback),
          template_callback => generator.list(template_callback),
          template_callback => generator.single(template_callback),
          template_callback => generator.create(template_callback),
          template_callback => generator.read(template_callback),
          template_callback => generator.update(template_callback)
        ], callback))
      ],
      (err, results) => {
        console.log(err)
      }
    )
  }
}

module.exports = Multicolour_Frontend_Polymer
