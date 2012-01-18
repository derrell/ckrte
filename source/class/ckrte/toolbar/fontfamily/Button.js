/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("ckrte.toolbar.fontfamily.Button",
{
  extend    : ckrte.toolbar.AbstractToolbarEntry,
  include   : ckrte.toolbar.fontfamily.MAction,
  
  construct : function(_ckrte, fonts)
  {
    var             control;

    // Call the superclass constructor
    this.base(arguments, _ckrte);
    
    // Instantiate the control.
    control = new qx.ui.form.SelectBox();

    // Set common button properties
    control.set(
      {
        toolTipText : "Change Font Family",
        focusable   : false,
        keepFocus   : true,
        width       : 120,
        height      : 16,
        margin      : [ 4, 0 ]
      });

    // If the list of fonts wasn't provided...
    if (! fonts)
    {
      // ... then use the default list
      fonts = this.constructor.fonts;
    }

    // Add each of the fonts to the select box
    fonts.forEach(
      function(font, i)
      {
        var listItem = new qx.ui.form.ListItem(font.nickname);
        listItem.setUserData("family", font.family);
        listItem.set(
          {
            focusable : false,
            keepFocus : true,
            font      : qx.bom.Font.fromString("12px " + font.nickname)
          });
        control.add(listItem);

        // If this is the first element in the list...
        if (i == 0)
        {
          // ... then select this one.
          control.setSelection([ listItem ]);
        }
      });

    // When the selection changes, call the appropriate action
    control.addListener("changeSelection", 
                        function(e)
                        {
                          // Retrieve event data
                          var             data = e.getData()[0];
                          var             nickname = data.getLabel();
                          var             family = data.getUserData("family");
                          
                          // Call the action function
                          this._action(nickname, family);
                        },
                        this);

    // Save this control
    this.setControl(control);
  },

  statics :
  {
    /**
     * The default list of fonts to be available in the Font combo in the
     * toolbar. The nickname is displayed in the toolbar, and the complete
     * family is used in the editor.
     */
    fonts :
    [
      {
        nickname : "Arial",
        family   : "Arial, Helvetica, sans-serif;"
      },
      {
        nickname : "Comic Sans MS",
        family   : "Comic Sans MS, cursive;"
      },
      {
        nickname : "Courier New",
        family   : "Courier New, Courier, monospace;"
      },
      {
        nickname : "Georgia",
        family   : "Georgia, serif;"
      },
      {
        nickname : "Lucida Sans Unicode",
        family   : "Lucida Sans Unicode, Lucida Grande, sans-serif;"
      },
      {
        nickname : "Tahoma",
        family   : "Tahoma, Geneva, sans-serif;"
      },
      {
        nickname : "Times New Roman",
        family   : "Times New Roman, Times, serif;"
      },
      {
        nickname : "Trebuchet MS",
        family   : "Trebuchet MS, Helvetica, sans-serif;"
      },
      {
        nickname : "Verdana",
        family   : "Verdana, Geneva, sans-serif"
      }
    ]
  }
});
