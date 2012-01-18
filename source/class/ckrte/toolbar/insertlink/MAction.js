/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("ckrte.toolbar.insertlink.MAction",
{
  members :
  {
    /** Implement the action for this commmand */
    _action : function()
    {
      var             dialog;
      
      // Instantiate and open the dialog
      dialog = new ckrte.dialog.Link(this.getCkRte());
      dialog.center();
      dialog.open();
    }
  }
});
