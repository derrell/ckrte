/* ************************************************************************

   Copyright:
     2011 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php

   Authors:
     * Derrell Lipman (derrell)

#ignore(CKEDITOR)
#ignore(CKEDITOR.env)
#ignore(CKEDITOR.tools)
#ignore(CKEDITOR.plugins)
#ignore(CKEDITOR.plugins.contextMenu)
#ignore(CKEDITOR.menuItem)
#ignore(CKEDITOR.document)

************************************************************************ */

qx.Class.define("ckrte.plugins.ContextMenu",
{
  /**
   * @lint ignoreUndefined(CKEDITOR)
   */
  defer : function()
  {
    /*
    Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
    For licensing, see LICENSE.html or http://ckeditor.com/license
    */

    CKEDITOR.plugins.add('qxcontextmenu',
    {
      // Make sure the base class (CKEDITOR.menu) is loaded before it (#3318).
      onLoad : function()
      {
        CKEDITOR.plugins.contextMenu = CKEDITOR.tools.createClass(
        {
          $ : function(editor)
          {
            // Save the editor
            this.editor = editor;

            // Initialize the listeners array
            this._.listeners = [];

            // Instantiate a menu
            this._.menu = new qx.ui.menu.Menu();

            // Don't display the icon column
            this._.menu.set(
              {
                spacingX : 0,
                spacingY : 0,
                iconColumnWidth : 0
              });
          },

          proto :
          {
            _ : {},

            addListener : function(listenerFn)
            {
              // Save this listener function. We'll call it when menu is built.
              this._.listeners.push(listenerFn);
            },

            addTarget : function(element, nativeContextMenuOnCtrl)
            {
              element.on( 'contextmenu', function( event )
                {
                  var domEvent = event.data;

                  var offsetParent =
                    domEvent.getTarget().getDocument().getDocumentElement(),
                    offsetX = domEvent.$.clientX,
                    offsetY = domEvent.$.clientY;

                  // Open the menu
                  this.open(offsetParent, null, offsetX, offsetY, domEvent);
                },
                this );

              if ( CKEDITOR.env.opera )
              {
                // 'contextmenu' event triggered by Windows menu key is
                // unpreventable, cancel the key event itself. (#6534)
                element.on( 'keypress' , function ( evt )
                {
                  var domEvent = evt.data;

                  if ( domEvent.$.keyCode === 0 )
                  {
                    domEvent.preventDefault();
                  }
                });
              }

              if ( CKEDITOR.env.webkit )
              {
                var holdCtrlKey,
                  onKeyDown = function( event )
                  {
                    holdCtrlKey =
                      CKEDITOR.env.mac
                      ? event.data.$.metaKey
                      : event.data.$.ctrlKey ;
                  },
                  resetOnKeyUp = function()
                  {
                    holdCtrlKey = 0;
                  };

                element.on( 'keydown', onKeyDown );
                element.on( 'keyup', resetOnKeyUp );
                element.on( 'contextmenu', resetOnKeyUp );
              }
            },

            open : function(offsetParent, corner, offsetX, offsetY, domEvent)
            {
              this.editor.focus();
              offsetParent = 
                offsetParent || CKEDITOR.document.getDocumentElement();

              // Get the current selection
              var selection = this.editor.getSelection();

              // Selection will be unavailable after menu shows up in IE, so
              // lock it now.
              if (CKEDITOR.env.ie)
              {
                selection && selection.lock();
              }

              // Determine what element we're building the context menu for
              var element = selection && selection.getStartElement();

              // Remove all items from the menu
              this._.menu.removeAll();

              // Get the root object to add the context menu to.
              var root = qx.core.Init.getApplication().getRoot();

              // Call all listeners, filling the list of items to be displayed
              this._.listeners.forEach(
                function(listenerFn)
                {
                  // Call the provided listener function
                  var listenerItems = listenerFn(element, selection);

                  // Did we get any result?
                  if (listenerItems)
                  {
                    // Yup. The result is a map. Retrieve the keys.
                    qx.lang.Object.getKeys(listenerItems).forEach(
                      function(itemName)
                      {
                        // Determine the label and command for this menu item
                        var item = this.editor.getMenuItem(itemName);
                        if (item && 
                            item.command &&
                            this.editor.getCommand(item.command))
                        {
                          // Create a menu button for this item
                          var menuItem = new qx.ui.menu.Button(item.label);

                          // Add the button to the menu
                          this._.menu.add(menuItem);

                          // Arrange to run its command when the button is
                          // pressed
                          menuItem.addListener(
                            "execute",
                            function(e)
                            {
                              var             cmd;
                              var             commandName = item.command;

                              // Run either our toolbar's command, if we have
                              // one, or the native one in CkEditor.
                              cmd = 
                                this.editor._qxtoolbar.getCommand(commandName);
                              (cmd
                               ? cmd()
                               : this.editor.execCommand(commandName));
                            },
                            this);
                        }
                      },
                      this);

                    // Cancel the browser context menu.
                    domEvent.preventDefault();

                    // We added things to the context menu. Enable it.
                    root.setContextMenu(this._.menu);
                  }
                  else
                  {
                    // We added things to the context menu. Enable it.
                    root.setContextMenu(null);
                  }
                },
                this);

              // Show the context menu. Convert to a qooxdoo event...
              var e = new qx.event.type.Mouse();
              e.init(domEvent.$);
              
              // ... so we can use it to place the menu to the mouse position.
              this._.menu.placeToMouse(e);

              // Now show the context menu.
              this._.menu.show();
            }
          }
        });
      },

      beforeInit : function( editor )
      {
        var groups = editor.config.menu_groups.split( ',' );
        var groupsOrder = editor._.menuGroups = {};
        var menuItems = editor._.menuItems = {};

        for (var i = 0 ; i < groups.length ; i++)
        {
          groupsOrder[groups[i]] = i + 1;
        }

        /**
         * Registers an item group to the editor context menu in order to make
         * it possible to associate it with menu items later.
         * @name CKEDITOR.editor.prototype.addMenuGroup
         * @param {String} name Specify a group name.
         * @param {Number} [order=100] Define the display sequence of this group
         *      inside the menu. A smaller value gets displayed first.
         */
        editor.addMenuGroup = function( name, order )
        {
          groupsOrder[name] = order || 100;
        };

        /**
         * Adds an item from the specified definition to the editor context
         * menu.
         * @name CKEDITOR.editor.prototype.addMenuItem
         * @param {String} name The menu item name.
         * @param {CKEDITOR.menu.definition} definition
         *   The menu item definition.
         *
         * @lint ignoreUndefined(CKEDITOR)
         */
        editor.addMenuItem = function( name, definition )
        {
          if (groupsOrder[ definition.group ])
          {
            menuItems[name] = new CKEDITOR.menuItem(this, name, definition);
          }
        };

        /**
         * Adds one or more items from the specified definition array to the
         * editor context menu.
         * @name CKEDITOR.editor.prototype.addMenuItems
         * @param {Array} definitions
         *   List of definitions for each menu item as if {@link
         *   CKEDITOR.editor.addMenuItem} is called.
         */
        editor.addMenuItems = function( definitions )
        {
          for (var itemName in definitions)
          {
            this.addMenuItem(itemName, definitions[ itemName ]);
          }
        };

        /**
         * Retrieves a particular menu item definition from the editor context
         * menu.
         * @name CKEDITOR.editor.prototype.getMenuItem
         * @param {String} name The name of the desired menu item.
         * @return {CKEDITOR.menu.definition}
         */
        editor.getMenuItem = function(name)
        {
          return menuItems[name];
        };

        /**
         * Removes a particular menu item added before from the editor context
         * menu.
         * @name CKEDITOR.editor.prototype.removeMenuItem
         * @param {String} name The name of the desired menu item.
         * @since 3.6.1
         */
        editor.removeMenuItem = function( name )
        {
          delete menuItems[ name ];
        };

        editor.contextMenu = new CKEDITOR.plugins.contextMenu( editor );
      }
    });
  }
});
