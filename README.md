The language
============

Check out [MellowD](https://github.com/SpencerPark/MellowD) which is the language these tools were created to support.

Brackets Extension
==================

For developers hacking with [Brackets](http://brackets.io/) you can grab this extension to get some syntax highlighting for `.mlod` files.

1. Download/open Brackets
2. Click on the lego icon on the right to open the extensions window
3. In the `Available` tab search for `MellowD` and install the `MellowD Syntax Highlighter` plugin by `Spencer Park`. (That's me!)
4. The theme I use (which also looks great with this syntax highlighter) is [Default Dark - Base16](https://github.com/skjnldsv/default-dark)
   
CodeMirror Mode
===============

[CodeMirror](https://codemirror.net/) is a fantastic project that is open source on GitHub at [https://github.com/codemirror/CodeMirror/](https://github.com/codemirror/CodeMirror/). It is essentially a code editor written in javascript that Brackets has made use of under the hood.

To support a new language in CodeMirror you need to write a `mode` that teaches it how to highlight the syntax and that is exactly what this project did. You can find the mode in the `codemirror` directory written in typescript. If you want to embed a MellowD editor on a website this is the mode you will need to use.
 
Building
========

The project uses `npm` for dependency management and `gulp` for building. If you don't have `npm` you will need to install [NodeJS](https://nodejs.org/en/download/) for your system. This should include `npm` so just make sure it is included in your `PATH` by running `npm -version`.

1. Clone this repository
   ```bash
   git clone https://github.com/SpencerPark/mellowd-lang-support.git
   ```
2. Install all the required packages
   ```bash
   cd mellowd-lang-support/
   npm install
   cd codemirror
   npm install
   cd ../../
   ```
3. Build the projects:
   If you have `gulp` installed globally (you ran `npm install -g gulp`) then just run
   ```bash
   cd mellowd-lang-support/
   gulp build
   ```
   Otherwise you can skip the global install and just use the local one you just installed
   ```bash
   cd mellowd-lang-support/
   ./node_modules/.bin/gulp build
   ```