/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#asset(qx/icon/Oxygen/16/actions/format-*.png)
#asset(qx/icon/Oxygen/16/actions/edit-*.png)
#asset(qx/icon/Oxygen/16/actions/insert-image.png)
#asset(qx/icon/Oxygen/16/actions/insert-link.png)
#asset(qx/icon/Oxygen/16/actions/insert-text.png)
#asset(rte/toolbar/*)
 */

qx.Class.define("ckrte.Toolbar",
{
  extend : qx.ui.toolbar.ToolBar,

  /**
   * Constructor for a Toolbar
   *
   * @param ckrte {ckrte.CkEditor}
   *   The editor instance which this toolbar is controlling
   *
   * @param toolbarConfig {Array?}
   *   The optional configuration of the toolbar is specified by an array of
   *   parts (arrays), with each inner array containing the list of the
   *   buttons to be inserted into the toolbar. Each list element is a map
   *   containing two members: "button" is a reference to the class to be
   *   instantiated for the button, and "set" is an optional map which will be
   *   passed to the instantiated button's set() method if provided.
   *
   *   Example:
   *
   *   [
   *     [
   *       { button : ckrte.toolbar.bold.Button },
   *       { button : ckrte.toolbar.italic.Button }
   *     ],
   *     [
   *       { button : ckrte.toolbar.fontcolor.Button, { minWidth : 50 } },
   *       { button : ckrte.toolbar.fontsize.Button },
   *     ]
   *   ]
   * 
   *   If this parameter is not provided, a default toolbar configuration will
   *   be used.
   */
  construct : function(_ckrte, toolbarConfig)
  {
    this.base(arguments);

    // Initialize the command map, for context menus and dialogs
    this._commandButtons = {};

    // If no toolbar configuration was provided...
    if (! toolbarConfig)
    {
      // ... then use a default configuration
      toolbarConfig = ckrte.Toolbar.DefaultConfiguration;
    }

    // For each part...
    toolbarConfig.forEach(
      function(partConfig)
      {
        var             part;

        // Create a new part and add it to ourself (i.e., to the toolbar)
        part = new qx.ui.toolbar.Part();
        this.add(part);

        // For each button in this part...
        partConfig.forEach(
          function(buttonConfig)
          {
            var             button;
            var             control;

            // Instantiate the specified button
            button = new buttonConfig.button(_ckrte);
            
            // Get the button's control
            control = button.getControl();

            // If there is a "set" map...
            if (buttonConfig.set)
            {
              // ... then call the button's set() method with it
              control.set(buttonConfig.set);
            }
            
            // If this is a command for context menu or doubleclick...
            if (buttonConfig.command)
            {
              // ... then save the button
              this._commandButtons[buttonConfig.command] = button;
            }

            // Add the button's control to the current part in the toolbar.
            part.add(control);
          },
          this);
      },
      this);
    
    // Once the CkEditor instance is ready...
    _ckrte.addListener(
      "instanceReady",
      function(e)
      {
        // ... retrieve the CkEditor instance
        var             ckeditor = e.getData();

        // Ensure that our CkEditor plugins can get at this toolbar
        ckeditor._qxtoolbar = this;
        
        // We don't want any native CkEditor dialogs to open. Create our own
        // function and handle it.
        ckeditor.openDialog = qx.lang.Function.bind(
          function(dialogName)
          {
            var             cmd = this.getCommand(dialogName);
            cmd && cmd();
          },
          this);

      },
      this);
  },
  
  statics :
  {
    /** 
     * Default toolbar configuration. The elements of each top-level array
     * element's sub-array are all placed into the same menu "part".
     */
    DefaultConfiguration :
      [
        [
          { button : ckrte.toolbar.bold.Button },
          { button : ckrte.toolbar.italic.Button },
          { button : ckrte.toolbar.underline.Button },
          { button : ckrte.toolbar.strikethrough.Button },
          { button : ckrte.toolbar.removeformat.Button }
        ],
        [
          { button : ckrte.toolbar.alignleft.Button },
          { button : ckrte.toolbar.aligncenter.Button },
          { button : ckrte.toolbar.alignright.Button },
          { button : ckrte.toolbar.alignjustify.Button }
        ],
        [
          { button : ckrte.toolbar.fontfamily.Button },
          { button : ckrte.toolbar.fontsize.Button },
          { button : ckrte.toolbar.fontcolor.Button },
          { button : ckrte.toolbar.backgroundcolor.Button }
        ],
        [
          { button : ckrte.toolbar.outdent.Button },
          { button : ckrte.toolbar.indent.Button }
        ],
        [
          {
            button  : ckrte.toolbar.insertimage.Button,
            command : "image"
          },
          {
            button  : ckrte.toolbar.inserttable.Button,
            command : "tableProperties" 
          },
          {
            button  : ckrte.toolbar.insertlink.Button,
            command : "link"
          },
          { button : ckrte.toolbar.inserthr.Button },
          { button : ckrte.toolbar.editsource.Button }
        ],
        [
          { button : ckrte.toolbar.orderedlist.Button },
          { button : ckrte.toolbar.unorderedlist.Button }
        ],
        [
          { button : ckrte.toolbar.undo.Button },
          { button : ckrte.toolbar.redo.Button }
        ]
      ]
  },
  
  members :
  {
    /** Map of command names to buttons, for context menus and double clicks */
    _commandButtons : null,

    /**
     * Get the command to execute for a CkEditor command name. These may
     * replace the internal CkEditor commands that attempt to bring up dialogs
     * that are disabled in our environment.
     *
     * @param commandName {String}
     *   The CkEditor command name
     *
     * @return {Function|null}
     *   If the command name has a locally-established function, it is
     *   returned; otherwise null is returned.
     */
    getCommand : function(commandName)
    {
      var             cmdButton = this._commandButtons[commandName];
      
      if (qx.core.Environment.get("qx.debug"))
      {
        if (! cmdButton)
        {
          this.debug("No command for '" + commandName + "'");
        }
      }
      
      return (cmdButton 
              ? qx.lang.Function.bind(cmdButton._action, cmdButton)
              : null);
    }
  }
});
