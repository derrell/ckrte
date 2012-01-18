/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("ckrte.toolbar.alignjustify.Button",
{
  extend    : ckrte.toolbar.AbstractSimpleButton,
  include   : ckrte.toolbar.alignjustify.MAction,

  construct : function(_ckrte)
  {
    // Define the tooltip and image to use for this button
    var             tooltip = "Align Justify";
    var             image = "qx/icon/Oxygen/16/actions/format-justify-fill.png";

    // Call the superclass constructor
    this.base(arguments, _ckrte, tooltip, image);
  }
});
