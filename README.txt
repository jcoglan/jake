= Jake

* http://github.com/jcoglan/jake

== Description

Jake is a tool for building JavaScript library packages from source code. It allows
builds to be specified using simple YAML files, and provides a command-line tool for
generating package files. It also allows ERB to be embedded in JavaScript source code
so that build data or new code can be generated during the build process.

== Features

* Easy automated builds of JavaScript packages with a single command
* Uses lightweight YAML to specify files and compression options
* Compression is configurable both globally and per-package
* Multiple builds with different compression setups
* Headers such as copyright information can be injected into all build files
* ERB can be used to inject code at build time using Ruby functions

== Usage

Jake builds are configured using a YAML file and (optionally) a 'Jakefile' containing
helper methods for use with Jake's ERB features. You place a file called <tt>jake.yml</tt>
in the root directory of your project (you will run the +jake+ command from this
directory). If you use a Jakefile, place this in the same directory.

This example <tt>jake.yml</tt> demonstrates the layout of the file:

  --
  source_directory:     src
  build_directory:      dist
  header:               COPYRIGHT
  packer:
    shrink_vars:        true
    private:            true
    base62:             true
  
  packages:
    foo:                foo
    
    bar:
      - bar_file1
      - bar_file2
    
    baz:
      directory:        baz
      header:           COPYRIGHT
      packer:
        base62:         false
      files:
        - model
        - view
        - controller
  
  bundles:
    my_lib:
      - foo
      - bar
      - baz

This configuration would match a project layed out as follows:

  - dist/
      - bar.js
      - baz.js
      - foo.js
      - my_lib.js
  - src/
      - baz/
          - controller.js
          - COPYRIGHT
          - model.js
          - view.js
      - bar_file1.js
      - bar_file2.js
      - foo.js
  - COPYRIGHT
  - jake.yml

== Requirements

* Rubygems
* Oyster
* PackR

== Installation

* sudo gem install jake -y

== License

(The MIT License)

Copyright (c) 2008 James Coglan

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
