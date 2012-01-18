This is the ckrte/qooxdoo integration, sponsored by Arcode Corp., and
developed by Derrell Lipman.

Using this contrib requires a little more setup than with most. As you'll see
in this contrib's demo, there are a bunch of ckeditor files and directories
that you must copy to the 'source' directory of your application, and modify
your application's index.html to load the ckeditor.js file.

* Specifically, the following files and directories from demo/source must be
  copied to your application's source directory:

    ckeditor.js
    config.js
    contents.css
    lang/
    plugins/
    skins/
    styles.css (empty)

* Also, in index.html, the ckeditor.js script is loaded immediately before the
  application script. See demo/source/index.html

In theory, you should be able to drop in a more recent version of ckeditor.js
than this one from summer of 2011, but I haven't tried that.

The demo also requires code from  the following  git repositories.

To run the demo, clone these repositories:

  git://github.com/qooxdoo-contrib/ckrte.git
  git://github.com/qooxdoo-contrib/localfile.git
  git://github.com/qooxdoo-contrib/uploadwidget.git
  git://github.com/qooxdoo/qooxdoo.git

I recommend putting ckrte, localfile, uploadwidget, and qooxdoo at the same
hierarchy level. That is the structure assumed by the demo's config.json file.

Then change directory into ckrte/demo, run "./generate.py source", and browse
to source/index.html

Enjoy.

Derrell
