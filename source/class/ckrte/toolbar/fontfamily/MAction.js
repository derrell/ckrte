/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(CKEDITOR.style)
 */

qx.Mixin.define("ckrte.toolbar.fontfamily.MAction",
{
  construct : function()
  {
    // Initialize the font style map
    this._fontStyles = {};
  },

  statics :
  {
    /**
     * The style definition to be used to apply the font in the text.
     */
    font_style :
      {
        element	  : "span",
        styles	  : { "font-family" : "#(family)" },
        overrides : [ { element : "font", attributes : { "face" : null } } ]
      }
  },

  members :
  {
    /** Font style map */
    _fontStyles : null,

    /**
     *  Implement the action for this commmand 
     *
     * @lint ignoreUndefined(CKEDITOR)
     */
    _action : function(nickname, family)
    {
      var         ckeditor = this.getCkRte().getCkEditor();

      // See if we've already created a CKEDITOR style for this font. 
      if (! this._fontStyles[nickname])
      {
        // We haven't. Create it now. Save the generated style
        this._fontStyles[nickname] =
          new CKEDITOR.style(ckrte.toolbar.fontfamily.MAction.font_style, 
                             { family : family });
      }

      // Set the focus
      ckeditor.focus();

      // Make this undoable
      ckeditor.fire("saveSnapshot");

      // Apply this style
      this._fontStyles[nickname].apply(ckeditor.document);

      // Make this undoable
      ckeditor.fire("saveSnapshot");
    }
  }
});
