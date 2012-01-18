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

qx.Mixin.define("ckrte.toolbar.fontsize.MAction",
{
  construct : function()
  {
    // Initialize the font size style map
    this._fontSizeStyles = {};
  },

  statics :
  {
    /**
     * The style definition to be used to apply the font size in the text.
     */
    fontSize_style :
      {
        element	  : "span",
        styles	  : { "font-size" : "#(size)" },
        overrides : [ { element : "font", attributes : { "size" : null } } ]
      }
  },

  members :
  {
    /** Font size style map */
    _fontSizeStyles : null,

    /** 
     * Implement the action for this commmand
     *
     * @lint ignoreUndefined(CKEDITOR)
     */
    _action : function(nickname, size)
    {
      var         ckeditor = this.getCkRte().getCkEditor();

      // See if we've already created a CKEDITOR style for this font size. 
      if (! this._fontSizeStyles[nickname])
      {
        // We haven't. Create it now. Save the generated style.
        this._fontSizeStyles[nickname] =
          new CKEDITOR.style(ckrte.toolbar.fontsize.MAction.fontSize_style, 
                             { size : size });
      }

      // Set the focus
      ckeditor.focus();

      // Make this undoable
      ckeditor.fire("saveSnapshot");

      // Apply this style
      this._fontSizeStyles[nickname].apply(ckeditor.document);

      // Make this undoable
      ckeditor.fire("saveSnapshot");
    }
  }
});
