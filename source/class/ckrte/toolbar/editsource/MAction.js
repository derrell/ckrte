/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("ckrte.toolbar.editsource.MAction",
{
  members :
  {
    /** Implement the action for this commmand */
    _action : function()
    {
      var         ckeditor = this.getCkRte().getCkEditor();
      var         mode = this.getControl().getValue() ? "source" : "wysiwyg";

      // Make this undoable
      ckeditor.fire("saveSnapshot");

      // Enable or disable "Source" mode"
      ckeditor.setMode(mode);

      // Make this undoable
      ckeditor.fire("saveSnapshot");
    }
  }
});
