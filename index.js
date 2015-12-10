"use strict"

const Model_Generator = require("./lib/generator")
const Template_Generator = require("./lib/template")

class Multicolour_Frontend_Polymer {
  constructor() {
    this.targets = null
    this.config = null
    this.host = null
    this.has_requested_generation = false
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
      if (this.has_requested_generation) {
        this.generate()
      }
    })
  }

  server() {

  }

  generate() {
    // Get the tools.
    const Async = require("async")
    const Utils = require("./lib/utils")
    const start = Date.now()

    if (!this.targets) {
      this.has_requested_generation = true
      return this
    }

    console.log("Generating.")
    Utils.copy_static_assets(this.config)
    
    // Generate the templates in parallel.
    Async.waterfall(
      [
        // Get the models.
        next => next(null,
          Object.keys(this.targets)
            // Make an array of models.
            .map(key => this.targets[key])

            // Filter out the junction tables.
            .filter(model => !model.meta.junctionTable)
        ),

        // Create the generators
        (models, next) => next(null, models.map(model => new Model_Generator(model, this.host))),

        // Generate the templates.
        (generators, next) => generators.forEach(generator => Async.parallel([
          next => generator.list(next),
          next => generator.single(next),
          next => generator.create(next),
          next => generator.read(next),
          next => generator.update(next)
        ], next)),

        // Generate the app template.
        (_, next) => {
          // Get the model names.
          const names = Object.keys(this.targets).filter(name => !this.targets[name].meta.junctionTable)

          // Generate other templates.
          new Template_Generator(names, this.host).generate(next)
        }
      ],
      err => {
        /* eslint-disable*/
        if (err) {
          console.error("ERROR during frontend generation", err)
        }
        console.log("---")
        console.log("Took: %sms", Date.now() - start)
        /* eslint-enable*/
      }
    )
  }
}

module.exports = Multicolour_Frontend_Polymer
