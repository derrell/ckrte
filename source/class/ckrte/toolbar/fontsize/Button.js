/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("ckrte.toolbar.fontsize.Button",
{
  extend    : ckrte.toolbar.AbstractToolbarEntry,
  include   : ckrte.toolbar.fontsize.MAction,
  
  construct : function(_ckrte, fontSizes)
  {
    var             control;

    // Call the superclass constructor
    this.base(arguments, _ckrte);
    
    // Instantiate the control.
    control = new qx.ui.form.SelectBox();

    // Set common button properties
    control.set(
      {
        toolTipText: "Change Font Size",
        focusable: false,
        keepFocus: true,
        width: 50,
        height: 16,
        margin: [ 4, 0 ] 
      });

    // If the list of font sizes wasn't provided...
    if (! fontSizes)
    {
      // ... then use the default list
      fontSizes = ckrte.toolbar.fontsize.Button.fontSizes;
    }

    // Add each of the font sizes to the select box
    fontSizes.forEach(
      function(fontSize, i)
      {
        var listItem = new qx.ui.form.ListItem(fontSize.nickname);
        listItem.setUserData("size", fontSize.size);
        listItem.set(
          {
            focusable : false,
            keepFocus : true,
            font      : qx.bom.Font.fromString(fontSize.size)
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
                          var             size = data.getUserData("size");
                          
                          // Call the action function
                          this._action(nickname, size);
                        },
                        this);

    // Save this control
    this.setControl(control);
  },

  statics :
  {
    /**
     * The list of fonts size to be displayed in the Font Size combo in the
     * toolbar.
     *
     * The nickname is displayed in the pull-down list.
     *
     * Any kind of "CSS like" size values can be used, like "12px", "2.3em",
     * "130%", "larger" or "x-small".
     */
    fontSizes :
    [
      {
        nickname : "8",
        size     : "8px"
      },
      {
        nickname : "9",
        size     : "9px"
      },
      {
        nickname : "10",
        size     : "10px"
      },
      {
        nickname : "11",
        size     : "11px"
      },
      {
        nickname : "12",
        size     : "12px"
      },
      {
        nickname : "14",
        size     : "14px"
      },
      {
        nickname : "16",
        size     : "16px"
      },
      {
        nickname : "18",
        size     : "18px"
      },
      {
        nickname : "20",
        size     : "20px"
      },
      {
        nickname : "22",
        size     : "22px"
      },
      {
        nickname : "24",
        size     : "24px"
      },
      {
        nickname : "26",
        size     : "26px"
      },
      {
        nickname : "28",
        size     : "28px"
      },
      {
        nickname : "36",
        size     : "36px"
      },
      {
        nickname : "48",
        size     : "48px"
      },
      {
        nickname : "72",
        size     : "72px"
      }
    ]
  }
});
