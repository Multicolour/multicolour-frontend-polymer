# multicolour-polymer

Polymer front end generator for Multicolour applications. Your CRUD operations
are generated for you.

`npm i --save multicolour-polymer`

On installation; unless you have a `content/frontend/src` folder already, you'll
see a new folder `content/frontend/src` which contains `.jade` files.

These files are the default theme for your frontend, before Multicolour will
generate anything for you you need to add the below to your `app.js`.

```js
my_service.use(require("multicolour-frontend-polymer"))
  .request("frontend").generate().watch()
```

That will do an initial generate and then watch all the files in the `src`
directory and automagically reload the frontend for you.

### Why Jade?

Jade is a simple dynamic language that allows you to generate dynamic content without switching technologies or ideologies. A Jade template in Multicolour is turned into HTML and lets you generate these templates while being able to access all model data, type data and backend functionality while writing your themes.

### Customising your theme

Once Multicolour has done a generate, you'll see a `content/frontend/build`
folder, this contains html. By default Multicolour:

1. Generates, per blueprint:
  * `{entity}/read.html`
  * `{entity}/write.html`
  * `{entity}/list.html`
  * `{entity}/single.html`
2. Generates an `index.html` and an `elements.html`
3. Generates a `home.html`
4. Copies
  * `bower.json` & `bower_components` from `src`
  * `css` folder
  * `js` folder
  * `assets` folder

Multicolour will use `read.jade`, `create.jade`, `single.jade` and `list.jade`  to generate your frontend but you can override any of these for any blueprint by creating a folder with the same name as your blueprint. For instance, you'll see in your `src` directory a `user` folder which has `list.jade` in it. This is a custom list template for the user blueprint. You can do this for any of the default 4 templates, if it exists Multicolour will automatically find it and use it. Magic.

### Adding new templates

You can add new, entirely custom theme files are still `.jade` files. Multicolour won't automatically pick these up but you'll find a `frontend.json` in your `src` directory. Inside of this file is an array of template names.

Notice the lack of an extension, by default `home` is a "directive". 

#### What is expected of a "directive"?

A directive is a custom theme file that isn't one of the default 4 jade files. These templates should appear in your `frontend.json` files. It doesn't matter if they are in a folder or not but what you expect does. For example, if you have a `cool-stuff/amazing.jade` that you want rendering to html, add `"cool-stuff/amazing"` to the array in `frontend.json` and Multicolour will generate a `cool-stuff/amazing.html` for you.

### What data is passed into Jade as it compiles my templates?

When (all) your templates are compiled data is passed from the backend to the template:

```
{
    attributes: { ... Blueprint attributes ... },
    writable_attributes: { ... Blueprint attributes without id, createdAt or updatedAt ... },
    name: Blueprint identity, i.e "user",
    config: { Contents of config.js },
    package: { Contents of package.json },
    type_to_html_input_type: Function to convert basic attribute types to HTML input types,
    api_root: Full url to API
}
```
