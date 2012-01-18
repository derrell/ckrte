/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("ckrte.toolbar.alignright.MAction",
{
  members :
  {
    /** Implement the action for this commmand */
    _action : function()
    {
      // Issue the editor command
      this.getCkRte().getCkEditor().execCommand("justifyright");
    }
  }
});
