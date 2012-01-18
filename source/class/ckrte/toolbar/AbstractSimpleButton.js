/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("ckrte.toolbar.AbstractSimpleButton",
{
  extend : ckrte.toolbar.AbstractToolbarEntry,
  
  construct : function(_ckrte, tooltip, image)
  {
    var             control;

    // Call the superclass constructor
    this.base(arguments, _ckrte);
    
    // Instantiate the control.
    control = new qx.ui.toolbar.Button(null, image),

    // Set common button properties
    control.set(
      {
        focusable   : false,
        keepFocus   : true,
        center      : true,
        toolTipText : tooltip || ""
      });

    // When the button is pressed, call the appropriate action
    control.addListener("execute", this._action, this);
    
    // Save this control
    this.setControl(control);
  }
});
