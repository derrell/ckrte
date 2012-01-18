/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("ckrte.toolbar.AbstractToolbarEntry",
{
  extend : qx.core.Object,
  type   : "abstract",
  
  properties :
  {
    /** The ckrte.CkEditor instance to which this toolbar is associated */
    ckRte :
    {
      check : "ckrte.Ckeditor",
      init  : null
    },

    /** The control displayed in the toolbar */
    control :
    {
      init : null
    }
  },

  construct : function(_ckrte, bDisable)
  {
    // Call the superclass constructor
    this.base(arguments);
    
    // Save the ckrte reference. It may be needed in the action method.
    this.setCkRte(_ckrte);
    
    // Determine whether we should disable this button when in editing mode
    if (typeof(bDisable) == "undefined" || bDisable)
    {
      // Wait for the editor to be available.
      _ckrte.addListener(
        "instanceReady",
        function(e)
        {
          // When Edit HTML mode is entered/exited, disable/enable this button.
          _ckrte.addListener("mode", this._onModeChange, this);
        },
        this);
    }
  },
  
  members :
  {
    /**
     *  Called when the Edit Source button toggled. Disable this button when
     *  HTML mode is entered; enable it when WYSIWYG mode is exited.
     */
    _onModeChange : function()
    {
      var         bEnabled = this.getCkRte().getCkEditor().mode == "wysiwyg";
      this.getControl().setEnabled(bEnabled);
    }
  }
});
