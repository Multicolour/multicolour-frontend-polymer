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
    // Get the tools.
    const fs = require("fs")
    const path = require("path")
    const config = this.config.get("frontend")
    const target = config.theme_src_dir || path.resolve(__dirname, "./templates")
    const livereload = require("livereload").createServer()

    // Show the dev a friendly message.
    /* eslint-disable */
    console.log("Watching:", target)
    /* eslint-enable */

    // Watch for file changes and regenerate on change.
    fs.watch(target, {
      persistent: true,
      recursive: true
    }, () => this.generate())

    // Tell live reload to watch.
    livereload.watch(config.theme_build_dir || path.join(this.config.get("content"), "/frontend/build"))

    return this
  }

  generate() {
    // Get the tools.
    const Async = require("async")
    const Utils = require("./lib/utils")
    const start = Date.now()

    // Get where to get files from and where they're going.
    const theme_src_dir = this.config.get("frontend").theme_src_dir
    const theme_build_dir = this.config.get("frontend").theme_build_dir ||
      `${this.config.get("content")}/frontend/build`

    // Wait until we have models to generate with.
    if (!this.targets) {
      this.has_requested_generation = true
      return this
    }

    // Get the valid models for generation.
    const models = Object.keys(this.targets)
      // Make an array of models.
      .map(key => this.targets[key])

      // Filter out the junction tables and
      // any models we specifically don't want
      // to generate a frontend for.
      .filter(model => !model.meta.junctionTable && !model.NO_AUTO_GEN_FRONTEND)

    // Copy the static assets.
    Utils.copy_static_assets(this.config)

    // Does the theme have a frontend.json for other compile-ables?
    const directives_path = `${theme_src_dir}/frontend.json`
    Utils.file_exists(directives_path, (err, exists) => {
      if (exists) {
        const directives = require(directives_path)

        // Compile everything we found.
        Async.parallel(directives.map(directive => {
          // Get the paths.
          const src = `${theme_src_dir}/${directive}.jade`
          const dest = `${theme_build_dir}/${directive}.html`

          // Compile.
          return next => Utils.compile_template(src, dest, { models }, next)
        }), err => {
          /* eslint-disable */
          if (err) {
            console.error("ERROR during frontend.json compilation", err)
          }
          else {
            console.log("Compiled files listed in frontend.json")
          }
          /* eslint-enable */
        })
      }
    })

    // Generate the templates in parallel.
    Async.waterfall(
      [
        // Create the generators
        next => next(null, models.map(model => new Model_Generator(model, this.host))),

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
          const names = models.map(model => model.adapter.identity)

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
