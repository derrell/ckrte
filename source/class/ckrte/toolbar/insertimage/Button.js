/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("ckrte.toolbar.insertimage.Button",
{
  extend    : ckrte.toolbar.AbstractSimpleButton,
  include   : ckrte.toolbar.insertimage.MAction,

  construct : function(_ckrte)
  {
    // Define the tooltip and image to use for this button
    var             tooltip = "Insert Image";
    var             image = "qx/icon/Oxygen/16/actions/insert-image.png";

    // Call the superclass constructor
    this.base(arguments, _ckrte, tooltip, image);
  }
});
