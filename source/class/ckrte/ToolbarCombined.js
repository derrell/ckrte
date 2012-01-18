/* ************************************************************************

   Copyright:
     2011      Derrell Lipman
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php

   Authors:
     * Derrell Lipman (derrell)
     * Alexander Steitz (aback)
     * Jonathan Weiß (jonathan_rass)

   This class was initially derived from the toolbar portion of the
   demobrowser's HtmlArea demo.

   ------------------------------------------------------------------------

   Portions of this code are modified versions of code from CKEditor
   (plugins), which bears the following notice:

   Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.

   CKEditor is licensed under the terms of any of the following:
     GPL: http://www.gnu.org/licenses/gpl.html
     LGPl: http://www.gnu.org/licenses/lgpl.html
     MPL: http://www.mozilla.org/MPL/MPL-1.1.html

   The explicit license for CKEditor is at http://ckeditor.com

************************************************************************ */

/*
#asset(qx/icon/Oxygen/16/actions/format-*.png)
#asset(qx/icon/Oxygen/16/actions/edit-*.png)
#asset(qx/icon/Oxygen/16/actions/insert-image.png)
#asset(qx/icon/Oxygen/16/actions/insert-link.png)
#asset(qx/icon/Oxygen/16/actions/insert-text.png)
#asset(rte/toolbar/*)

#ignore(CKEDITOR.style)
#ignore(CKEDITOR.dom.element)
*/

/**
 * A toolbar for controlling a CKEDITOR
 */
qx.Class.define("ckrte.ToolbarCombined",
{
  extend : qx.ui.toolbar.ToolBar,

  construct : function(ckrte)
  {
    // Call the superclass constructor
    this.base(arguments);
    
    // Save the provided ckeditor object
    this._ckrte = ckrte;
    
    // Once the CkEditor instance is ready...
    ckrte.addListener(
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

    // Initialize the command map, for context menu and double-click use
    this._commands = 
      {
        "tableProperties" : this._insertTableToolbarHandler,
        "image"           : this._insertImageToolbarHandler
      };

    // Initilaize the styles maps
    this._fontStyles = {};
    this._fontSizeStyles = {};

    // Set up this tool bar
    this._setupToolbar();
  },

  statics :
  {
    /**
     * The list of fonts to be available in the Font combo in the toolbar. The
     * nickname is displayed in the toolbar, and the complete family is used
     * in the editor.
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
    ],

    /**
     * The text to be displayed in the Font combo is none of the available
     * values matches the current cursor position or text selection.
     * 
     * If the default site font is Arial, we may make it more explicit to the
     * end user.
     */
    font_defaultLabel : "",

    /**
     * The style definition to be used to apply the font in the text.
     */
    font_style :
      {
        element	  : "span",
        styles	  : { "font-family" : "#(family)" },
        overrides : [ { element : "font", attributes : { "face" : null } } ]
      },

    /**
     * The list of fonts size to be displayed in the Font Size combo in the
     * toolbar.
     *
     * The nickname is displayed in the pull-down list.
     *
     * Any kind of "CSS like" size values can be used, like "12px", "2.3em",
     * "130%", "larger" or "x-small".
     */
    fontSize_sizes :
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
    ],

    /**
     * The text to be displayed in the Font Size combo is none of the
     * available values matches the current cursor position or text selection.
     */
    fontSize_defaultLabel : "",

    /**
     * The style definition to be used to apply the font size in the text.
     */
    fontSize_style :
      {
        element	  : "span",
        styles	  : { "font-size" : "#(size)" },
        overrides : [ { element : "font", attributes : { "size" : null } } ]
      }
  },

  members :
  {
    /** The editor object, an instance of ckrte.Ckeditor */
    _ckrte : null,
    
    /** CKEDITOR.style return values for each font. */
    _fontStyles : null,

    /** CKEDITOR.style return values for each font size. */
    _fontSizeStyles : null,

    _commands : null,

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
      var             cmd = this._commands[commandName];
      return cmd ? qx.lang.Function.bind(cmd, this._ckrte) : null;
    },


    /**
     * Determine if an element is stylable or not.
     * 
     * @param elem {Element}
     *   The element to be tested
     * 
     * @return {Boolean}
     *   true if the element is not stylable; false otherwise
     */
    _isUnstylable : function(elem)
    {
      return (elem.getAttribute("contentEditable") == 'false' ||
              elem.getAttribute("data-nostyle"));
    },

    /**
     * Common color setting function, used for both foreground and background
     * colors.
     *
     * @param button {qx.ui.form.Button}
     *   The button object being created and being monitored for clicks
     *
     * @param type {String}
     *   One of "fore" or "back" to indicate whether the foreground or
     *   background color, respectively, is to be set.
     *
     * @lint ignoreUndefined(CKEDITOR)
     */
    _colorToolbarEntry : function(button, type)
    {
      // Create the color popup
      var colorPopup = new qx.ui.control.ColorPopup();
      colorPopup.exclude();

      // Arrange to show the color pop-up when the button is pressed
      button.addListener(
        "execute",
        function(e)
        {
          colorPopup.placeToWidget(button);
          colorPopup.show();
        }, 
        this._ckrte);

      // When a color is selected, set the font color
      colorPopup.addListener(
        "changeValue",
        function(e)
        {
          var ckeditor = this._ckrte.getCkEditor();
          var config = ckeditor.config;
          var color = e.getData();

          // Set the focus
          ckeditor.focus();
          
          // Make this undoable
          ckeditor.fire("saveSnapshot");
          
          // Get the color style configuration
          var colorStyle = config["colorButton_" + type + "Style"];

	  // Clean up any conflicting style within the range.
	  var style = new CKEDITOR.style(colorStyle, { color : 'inherit' });
          style.remove(ckeditor.document);
          
          // Apply the selected color
          var _this = this;
	  colorStyle.childRule = 
            (type == "fore"
             ? function(element) // foreground color
               {
                 // Fore color style must be applied inside links instead of
                 // around it.
                 return (element.getName() != 'a' ||
                         _this._isUnstylable(element));
               }
             : function(element) // background color
               {
		 // It's better to apply background color as the innermost
		 // style, except for "unstylable elements".
		 return _this._isUnstylable(element);
               }
            );

	  style = new CKEDITOR.style(colorStyle, { color : color });
          style.apply(ckeditor.document);
        },
        this);
    },

    /**
     * Creates the "text color" toolbar color selector
     *
     * @return {qx.ui.form.Button} 
     *   The button to use in the toolbar
     */
    _textColorToolbarEntry : function()
    {
      // Create the button
      var button = 
        new qx.ui.form.Button(null, "rte/toolbar/format-text-color.png");
      button.set(
        {
          toolTipText: "Text Color",
          focusable: false,
          keepFocus: true,
          width: 50,
          height: 16,
          margin: [ 4, 0 ] 
        });

      // Add the handlers for this button
      this._colorToolbarEntry(button, "fore");
      
      // Return the button to be added to the toolbar
      return button;
    },


    /**
     * Creates the "background color" toolbar color selector
     *
     * @return {qx.ui.form.Button} 
     *   The button to use in the toolbar
     */
    _backgroundColorToolbarEntry : function()
    {
      // Create the button
      var button = 
        new qx.ui.form.Button(null, "rte/toolbar/format-fill-color.png");
      button.set(
        {
          toolTipText: "Background Color",
          focusable: false,
          keepFocus: true,
          width: 50,
          height: 16,
          margin: [ 4, 0 ] 
        });

      // Add the handlers for this button
      this._colorToolbarEntry(button, "back");
      
      // Return the button to be added to the toolbar
      return button;
    },


    /**
     * Handler method for inserting images
     */
    _insertImageToolbarHandler : function()
    {
      var dialog = new ckrte.dialog.Image(this); // 'this' is our CkRte object
      dialog.moveTo(150, 150);
      dialog.open();
    },

    /**
     * Generate the Insert Table dialog as a modal window
     */
    _insertTableToolbarHandler : function()
    {
      var dialog = new ckrte.dialog.Table(this); // 'this' is our CkRte object
      dialog.moveTo(150, 150);
      dialog.open();
    },

    /**
     * Generate the Insert Link dialog as a modal window
     */
    _insertLinkToolbarHandler : function()
    {
      var dialog = new ckrte.dialog.Link(this); // 'this' is our CkRte object
      dialog.moveTo(150, 150);
      dialog.open();
    },

    /**
     * Creates the "font-family" toolbar dropdown
     *
     * @return {qx.ui.form.SelectBox} 
     *   Select box button for the toolbar
     *
     * @lint ignoreUndefined(CKEDITOR)
     */
    _fontFamilyToolbarEntry : function()
    {
      var             button;
      var             fonts;
      
      // This button will be a select box.
      button = new qx.ui.form.SelectBox();

      // Set its characteristics
      button.set(
        {
          toolTipText: "Change Font Family",
          focusable: false,
          keepFocus: true,
          width: 120,
          height: 16,
          margin: [ 4, 0 ]
        });

      // Get the list of fonts
      fonts = this.constructor.fonts;
      
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
          button.add(listItem);
          
          // If this is the first element in the list...
          if (i == 0)
          {
            // ... then select this one.
            button.setSelection([ listItem ]);

          }
        });

      // Arrange to apply the selected font when selection changes
      button.addListener(
        "changeSelection",
        function(e)
        {
          var             ckeditor = this._ckrte.getCkEditor();
          var             nickname = e.getData()[0].getLabel();

          // See if we've already created a CKEDITOR style for this font. 
          if (! this._fontStyles[nickname])
          {
            // We haven't. Create it now.
            // Retrieve the font list associated with the selected font
            var family = e.getData()[0].getUserData("family");

            // Save the generated style
            this._fontStyles[nickname] =
              new CKEDITOR.style(this.constructor.font_style, 
                                 { family : family });
          }
          
          // Set the focus
          ckeditor.focus();
          
          // Make this undoable
          ckeditor.fire("saveSnapshot");
          
          // Apply this style
          this._fontStyles[nickname].apply(ckeditor.document);

          // Make this undoable
          ckeditor.fire("saveSnapshot");
        }, 
        this);

      return button;
    },


    /**
     * Creates the "font-size" toolbar dropdown
     *
     * @return {qx.ui.form.SelectBox} 
     *   Select box button for the toolbar
     *
     * @lint ignoreUndefined(CKEDITOR)
     */
    _fontSizeToolbarEntry : function()
    {
      var             button;
      var             fontSizes;
      
      // This button will be a select box.
      button = new qx.ui.form.SelectBox();

      // Set its characteristics
      button.set(
        {
          toolTipText: "Change Font Size",
          focusable: false,
          keepFocus: true,
          width: 50,
          height: 16,
          margin: [ 4, 0 ] 
        });

      // Get the list of fonts
      fontSizes = this.constructor.fontSize_sizes;
      
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
          button.add(listItem);
          
          // If this is the first element in the list...
          if (i == 0)
          {
            // ... then select this one.
            button.setSelection([ listItem ]);

          }
        });

      // Arrange to apply the selected font when selection changes
      button.addListener(
        "changeSelection",
        function(e)
        {
          var             ckeditor = this._ckrte.getCkEditor();
          var             nickname = e.getData()[0].getLabel();

          // See if we've already created a CKEDITOR style for this font size. 
          if (! this._fontSizeStyles[nickname])
          {
            // We haven't. Create it now.
            // Retrieve the font size list associated with the selected nickname
            var size = e.getData()[0].getUserData("size");

            // Save the generated style
            this._fontSizeStyles[nickname] =
              new CKEDITOR.style(this.constructor.fontSize_style, 
                                 { size : size });
          }
          
          // Set the focus
          ckeditor.focus();
          
          // Make this undoable
          ckeditor.fire("saveSnapshot");
          
          // Apply this style
          this._fontSizeStyles[nickname].apply(ckeditor.document);

          // Make this undoable
          ckeditor.fire("saveSnapshot");
        }, 
        this);

      return button;
    },


    /**
     * Creates the "Edit Source" toggle button
     *
     * @return {qx.ui.form.ToggleButton} 
     *   Toggle button for the toolbar
     */
    _editSourceToolbarEntry : function()
    {
      var             button;
      
      // This button will be a select box.
      button = new qx.ui.form.ToggleButton(null, "rte/toolbar/insert-text.png");

      // Set its characteristics
      button.set(
        {
          toolTipText: "Edit Source",
          focusable: false,
          keepFocus: true,
          width: 16,
          height: 16,
          margin: [ 4, 0 ]
        });

      // Arrange to apply the selected font when selection changes
      button.addListener(
        "execute",
        function(e)
        {
          var             ckeditor = this._ckrte.getCkEditor();
          var             mode = button.getValue() ? "source" : "wysiwyg";
          
          // Make this undoable
          ckeditor.fire("saveSnapshot");
          
          // Enable or disable "Source" mode"
          ckeditor.setMode(mode);

          // Enable or disable all other buttons
          this._disableDuringSourceEdit.forEach(
            function(button)
            {
              button.setEnabled(mode == "wysiwyg");
            });

          // Make this undoable
          ckeditor.fire("saveSnapshot");
        }, 
        this);

      return button;
    },


    /**
     * Retrieve the toolbar entries
     *
     * @return {Array} 
     *   Array of toolbar entry descriptions from which to build the toolbar
     */
    _getToolbarEntries : function()
    {
      var _this = this;

      return (
        [
          {
            bold:
            {
              text: "Format Bold",
              image: "qx/icon/Oxygen/16/actions/format-text-bold.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("bold");
              }
            },
            
            italic:
            {
              text: "Format Italic",
              image: "qx/icon/Oxygen/16/actions/format-text-italic.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("italic");
              }
            },
            
            underline:
            {
              text: "Format Underline",
              image: "qx/icon/Oxygen/16/actions/format-text-underline.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("underline");
              }
            },
            
            strikethrough:
            {
              text: "Format Strikethrough",
              image: "qx/icon/Oxygen/16/actions/format-text-strikethrough.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("strike");
              }
            },
            
            removeFormat:
            {
              text: "Remove Format",
              image: "qx/icon/Oxygen/16/actions/edit-clear.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("removeFormat");
              }
            }
          },

          {
            alignLeft:
            {
              text: "Align Left",
              image: "qx/icon/Oxygen/16/actions/format-justify-left.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("justifyleft");
              }
            },
            
            alignCenter:
            {
              text: "Align Center",
              image: "qx/icon/Oxygen/16/actions/format-justify-center.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("justifycenter");
              }
            },
            
            alignRight:
            {
              text: "Align Right",
              image: "qx/icon/Oxygen/16/actions/format-justify-right.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("justifyright");
              }
            },
            
            alignJustify:
            {
              text: "Align Justify",
              image: "qx/icon/Oxygen/16/actions/format-justify-fill.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("justifyblock");
              }
            }
          },

          {
            fontFamily:
            {
              custom: this._fontFamilyToolbarEntry 
            },
            
            fontSize:
            { 
              custom: this._fontSizeToolbarEntry 
            },
            
            fontColor:
            {
              custom : this._textColorToolbarEntry
            },
            
            textBackgroundColor:
            {
              custom : this._backgroundColorToolbarEntry
            }
          },

          {
            indent:
            {
              text: "Indent More",
              image: "qx/icon/Oxygen/16/actions/format-indent-more.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("indent");
              }
            },
            
            outdent:
            {
              text: "Indent Less",
              image: "qx/icon/Oxygen/16/actions/format-indent-less.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("outdent");
              }
            }
          },

          {
            insertImage:
            {
              text: "Insert Image",
              image: "qx/icon/Oxygen/16/actions/insert-image.png",
              action: _this._insertImageToolbarHandler
            },
            
            insertTable:
            {
              text: "Insert Table",
              image: "rte/toolbar/insert-table.png",
              action: _this._insertTableToolbarHandler
            },
            
            insertLink:
            {
              text: "Insert Link",
              image: "qx/icon/Oxygen/16/actions/insert-link.png",
              action: _this._insertLinkToolbarHandler
            },
            
            insertHR:
            {
              text: "Insert Horizontal Ruler",
              image: "rte/toolbar/insert-horizontal-rule.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("horizontalrule");
              }
            },

            editSource:
            {
              custom       : _this._editSourceToolbarEntry,
              sourceEditor : true
            }
          },

          {
            ol:
            {
              text: "Insert Ordered List",
              image: "rte/toolbar/format-list-ordered.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("numberedlist");
              }
            },
            
            ul:
            {
              text: "Inserted Unordered List",
              image: "rte/toolbar/format-list-unordered.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("bulletedlist");
              }
            }
          },

          {
            undo:
            {
              text: "Undo Last Change",
              image: "qx/icon/Oxygen/16/actions/edit-undo.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("undo");
              }
            },
            redo:
            {
              text: "Redo Last Undo Step",
              image: "qx/icon/Oxygen/16/actions/edit-redo.png",
              action: function()
              {
                _this._ckrte.getCkEditor().execCommand("redo");
              }
            }
          }
      ]);
    },


    /**
     * Creates the toolbar entries
     */
    _setupToolbar : function()
    {
      var toolbar = this;
      toolbar.setDecorator("main");

      // Prepare to save all buttons which must be disabled during source edit.
      this._disableDuringSourceEdit = [];

      // Put together toolbar entries
      var button;
      var toolbarEntries = this._getToolbarEntries();
      for (var i = 0, j = toolbarEntries.length; i < j; i++)
      {
        var part = new qx.ui.toolbar.Part();
        toolbar.add(part);

        for (var entry in toolbarEntries[i])
        {
          var info = toolbarEntries[i][entry];

          if (info.custom)
          {
            button = info.custom.call(this);
            if (! button)
            {
              continue;
            }
          }
          else
          {
            button = new qx.ui.toolbar.Button(null, info.image);
            button.set(
              {
                focusable : false,
                keepFocus : true,
                center : true,
                toolTipText : info.text ? info.text : "" 
              });
            
            if (typeof info.action === "function")
            {
              button.addListener("execute", info.action, this._ckrte);
            }
            else
            {
              this.error("Missing action for " + entry);
            }
          }

          part.add(button);
          
          // Save all buttons other than the source editor button, so they can
          // be disabled during source editing.
          if (! info.sourceEditor)
          {
            this._disableDuringSourceEdit.push(button);
          }
        }
      }
    }
  }
});
