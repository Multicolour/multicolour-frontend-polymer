"use strict"

const Model_Generator = require("./lib/model-generator")
const Template_Generator = require("./lib/template")

class Multicolour_Frontend_Polymer {
  constructor() {
    this.targets = null
    this.config = null
    this.host = null
    this.has_requested_generation = false

    this._last_compile = false
    this._fs_throttle = 100
  }

  register(multicolour) {
    // Set the host.
    this.host = multicolour

    // Set the targets to the models.
    this.targets = multicolour.get("database").get("models")

    // Get the config from Multicolour.
    this.config = multicolour.get("config")

    // Get the src and build directories.
    const path = require("path")

    // Get the config and default if no specific config was found.
    const config = this.config.get("frontend")
    if (!config) {
      this.src = path.join(this.config.get("content"), "frontend", "src")
      this.build = path.join(this.config.get("content"), "frontend", "build")
    }
    else {
      this.src = config.theme_src_dir || path.join(this.config.get("content"), "frontend", "src")
      this.build = config.theme_src_dir || path.join(this.config.get("content"), "frontend", "build")
    }

    // Register the frontend.
    multicolour.reply("frontend", this)

    // Listen for when the host is ready.
    multicolour.on("server_starting", () => {
      // Get the host
      this.targets = multicolour.get("database").get("models")

      // If we requested to generate but there where
      // no models set (because the server wasn't ready)
      // make sure to try again now that we're ready.
      if (this.has_requested_generation) {
        this.generate()
      }
    })
  }

  /**
   * Custom data is passed to each view during
   * compilation. It is passed to the view with
   * the key `meta` and can be anything.
   * @param {Any} data to pass to the view for compilation.
   * @return {Multicolour_Frontend_Polymer} Object for chaining.
   */
  add_custom_data(data) {
    this._custom_data = data
    return this
  }

  /**
   * Watch files in the build directory for changes
   * and regenerate if/when anything changes and live
   * reload any open browsers with livereload enabled.
   * @return {Multicolour_Frontend_Polymer} object for chaining calls.
   */
  watch() {
    // Get the tools.
    const fs = require("fs")

    // Create a live reload server.
    const livereload = require("livereload").createServer()

    // Show the dev a friendly message.
    /* eslint-disable */
    console.log("Watching:", this.src)
    console.log("Build target:", this.build)
    /* eslint-enable */

    // Watch for file changes and regenerate on change.
    fs.watch(this.src, {
      persistent: true,
      recursive: true
    }, () => this.generate())

    // Tell live reload to watch.
    livereload.watch(this.build)

    // Exit.
    return this
  }

  generate(done) {
    // Throttle the compilation.
    if (this._last_compile && this._last_compile + this._fs_throttle > Date.now()) {
      return
    }

    // Get the tools.
    const Async = require("async")
    const Utils = require("./lib/utils")
    const start = Date.now()
    const config_as_json = Utils.map_to_object(this.config)

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
    Utils.copy_static_assets(this.src, this.build)

    // Does the theme have a frontend.json for other compile-ables?
    const directives_path = `${this.src}/frontend.json`
    Utils.file_exists(directives_path, (err, exists) => {
      if (exists) {
        // Uncache the directives.
        delete require.cache[require.resolve(directives_path)]

        // Reload the directives.
        const directives = require(directives_path)

        // Create an object for the models.
        const models_obj = {}
        models.forEach(model => models_obj[model.adapter.identity] = model)

        // Compile everything we found.
        Async.parallel(directives.map(directive => {
          // Get the paths.
          const src = `${this.src}/${directive}.jade`
          const dest = `${this.build}/${directive}.html`

          // Compile.
          return next => Utils.compile_template(src, dest, {
            models,
            models_obj,
            config: config_as_json,
            meta: this._custom_data,
            package: require("../../package.json"),
            type_to_html_input_type: Utils.type_to_html_input_type,
            api_root: config_as_json.frontend && config_as_json.frontend.api_root ||
              `http://${config_as_json.api_connections.host}:${config_as_json.api_connections.port}`
          }, next)
        }), err => {
          /* eslint-disable */
          if (err) {
            console.error("ERROR during frontend.json compilation", err)
          }
          else {
            console.log("Compiled %s files listed in frontend.json", directives.length)

            // Last compile time for throttling.
            this._last_compile = Date.now()
          }
          /* eslint-enable */
        })
      }
    })

    // Generate the templates in parallel.
    Async.waterfall(
      [
        // Create the generators
        next => next(null, models.map(model => new Model_Generator(model, this))),

        // Generate the templates.
        (generators, complete) => generators.forEach(generator => Async.parallel([
          next => generator.list(next),
          next => generator.single(next),
          next => generator.create(next),
          next => generator.update(next)
        ], complete)),

        // Generate the app template.
        (_, next) => {
          // Get the model names.
          const names = models.map(model => model.adapter.identity)

          // Generate other templates.
          new Template_Generator(names, this).generate(next)
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

        // Fire any callback.
        done && done(err)
      }
    )

    return this
  }
}

module.exports = Multicolour_Frontend_Polymer
