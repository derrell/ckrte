/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(CKEDITOR.dom.element)
 */

qx.Class.define("ckrte.dialog.AbstractDialog",
{
  extend : qx.ui.window.Window,
  
  construct : function(title, ckrte_editor)
  {
    // Call the superclass constructor
    this.base(arguments, title);
    
    // Create the window
    this._create(ckrte_editor);
  },
  
  properties :
  {
    /** The CkEditor editor object */
    ckEditor :
    {
      init : null
    },

    /** A function to configure the grid layout for this dialog */
    gridConfiguration :
    {
      check : "Function",
      init  : function(grid)
      {
        this.warn("No grid configuration defined");
      }
    },
    
    /** Setup configuration for the dialog */
    dialogConfiguration :
    {
      check : "Array"
    }
  },
  
  members :
  {
    /** Model skeleton */
    _skeleton : null,

    /** The elements added to the form */
    _elements : null,

    /** Data model */
    _model : null,
    
    /** Controller */
    _controller : null,

    /** Ok button control */
    _okButton : null,
    
    /** Cancel button control */
    _cancelButton : null,

    /** Id of Ok listener, to remove listener if Cancel is pressed */
    _okListener : null,
    
    /** Id of Cancel listener, to remove listener if Ok is pressed */
    _cancelListener : null,
    
    /**
     *  The maximum column number, determined dynamically. This is used to
     *  place the Ok and Cancel buttons right justified.
     */
    _maxCol : -1,
    
    /** Input element to get the initial focus */
    _focusElement : null,

    /**
     * Create the dialog, using the provided dialog configuration
     *
     * @param columns {Integer?}
     *   The number of columns of label/field pairs to expect. If this value
     *   is 2 or is not provided at all, then a separator column will be added
     *   between two columns of label/field pairs. The other supported value
     *   is 1, meanining expect only a single column of label/field pairs, so
     *   no additional separator column need be added.
     *
     * @lint ignoreUndefined(localfile)
     */
    _create : function(columns)
    {
      var             grid;
      var             container;
      var             data;
      var             nextRow;
      var             maxRow;
      var             hBox;
      var             command;


      // Initialize the model skeleton
      this._skeleton = {};

      // Initialize the elements map
      this._elements = {};

      if (qx.core.Environment.get("qx.debug"))
      {
        this.assert((typeof columns == "undefined" || 
                     columns === 1 ||
                     columns === 2),
                    "The only supported values for the 'columns' parameter " +
                    "are 1 or 2. The parameter may also be excluded, to " +
                    "yield the default value of 2.");
      }

      // Set window characteristics
      this.set(
        {
          layout : new qx.ui.layout.VBox(30),
          modal  : true
        });

      // The layout of the properties page will be a grid
      grid = new qx.ui.layout.Grid();
      this.getGridConfiguration()(grid);

      // Create a container for the grid
      container = new qx.ui.container.Composite(grid);
      this.add(container);

      // Add a spacer in column 2, to separate the two columns
      if (columns !== 1)
      {
        container.add(new qx.ui.core.Spacer(30), { row : 0, column : 2 });
      }

      // Retrieve the dialog configuration
      data = this.getDialogConfiguration();

      // Add fields to the form
      maxRow = -1;
      nextRow = 0;
      data.forEach(
        function(item, i)
        {
          // If a row number is specified...
          switch(typeof item.row)
          {
          case "number":
            // ... then reset row decrement to make this one appear as specified
            nextRow = item.row;
            break;

          case "string":
            if (qx.core.Environment.get("qx.debug"))
            {
              this.assertEquals("end", item.row);
            }
            nextRow = maxRow + 1;
            break;

          case "undefined":
          default:
            // just use nextRow as it is
            break;
          }

          // Is colSpan the string "end"?
          if (item.colSpan == "end")
          {
            // Yup. Set it to the number of remaining columns
            item.colSpan = this._maxCol - item.col;
          }
          
          // Similarly, is rowSpan the string "end"?
          if (item.rowSpan == "end")
          {
            // Yup. Set it to the number of remaining rows
            item.rowSpan = maxRow - nextRow;
          }

          // Add this item at the calculated row
          this._addField(container, nextRow, item, data);

          // Track the maximum row number used so far
          if (nextRow > maxRow)
          {
            maxRow = nextRow;
          }

          // Increment nextRow for next time
          ++nextRow;
        },
        this);

      // Create the model
      this._model = qx.data.marshal.Json.createModel(this._skeleton);

      // Create the controller
      this._controller = new qx.data.controller.Object(this._model);

      // Connect the model to the appropriate events
      data.forEach(
        function(item)
        {
          if (item.type === qx.ui.form.SelectBox)
          {
            this._controller.addTarget(item.input,
                                       "modelSelection[0]",
                                       item.model,
                                       true);
          }
          else if (item.type === qx.ui.form.TextField)
          {
            this._controller.addTarget(item.input,
                                       "value",
                                       item.model,
                                       true);
          }
          else if (item.type === localfile.Retrieve)
          {
            this._controller.addTarget(item.input,
                                       "value",
                                       item.model,
                                       true);
          }
        },
        this);

      // Create a horizontal box to hold the buttons
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

      // Add spacer to right-align the buttons
      hBox.add(new qx.ui.core.Spacer(null, 1), { flex : 1 });

      // Add the Ok button
      this._okButton = new qx.ui.form.Button(this.tr("Ok"));
      this._okButton.setWidth(100);
      this._okButton.setHeight(30);
      hBox.add(this._okButton);

      this._okListener = this._okButton.addListenerOnce(
        "execute", 
        function(e)
        {
          // ensure we're focused if Enter is pressed
          this._okButton.focus(); 
          qx.html.Element.flush();
          
          this._onOk();

          // This listener has fired. Be sure the other one never does now.
          this._cancelButton.removeListenerById(this._cancelListener);

          // New instance is created each time. Be sure this one gets disposed.
          qx.util.TimerManager.getInstance().start(
            function()
            {
              this.dispose();
            },
            this);
        },
        this);
      
      // If Enter is pressed, it should act as if the Ok button were clicked.
      command = new qx.ui.core.Command("Enter");
      this._okButton.setCommand(command);
      
      // Add the Cancel button
      this._cancelButton = new qx.ui.form.Button(this.tr("Cancel"));
      this._cancelButton.setWidth(100);
      this._cancelButton.setHeight(30);
      hBox.add(this._cancelButton);

      // Close the window if the cancel button is pressed
      this._cancelListener = this._cancelButton.addListenerOnce(
        "execute",
        function(e)
        {
          this.close();

          // This listener has fired. Be sure the other one never does now.
          this._okButton.removeListenerById(this._okListener);

          // New instance is created each time. Be sure this one gets disposed.
          qx.util.TimerManager.getInstance().start(
            function()
            {
              this.dispose();
            },
            this);
        },
        this);

      // Add the button bar to the window
      this.add(hBox);
    },

    _addField : function(container, row, item, data)
    {
      var             startCol = item.col;
      var             value;

      // Add the label 
      container.add(new qx.ui.basic.Label(item.label), 
                    { 
                      row    : row, 
                      column : startCol
                    });
      
      // Create the input field
      item.input = new (item.type)();
      
      // Is this a select box?
      if (item.type === qx.ui.form.SelectBox)
      {
        // Yup. Add the list items.
        item.items.forEach(
          function(listItem)
          {
            item.input.add(new qx.ui.form.ListItem(listItem.label,
                                                   null,
                                                   listItem.model));
          });
      }
      
      // Are there any characteristics to set for this field?
      if (item.set)
      {
        // Yup. Set them.
        item.input.set(item.set);
      }
      
      // Add the input field
      container.add(item.input,
                    {
                      row     : row,
                      column  : startCol + 1, 
                      colSpan : item.colSpan || 1, 
                      rowSpan : item.rowSpan || 1
                    });

      // Add this field to the model skeleton. Use setup function's return
      // value, if there's such a function; or initial value, if provided; or
      // null. If setup function returns undefined, use the item value.
      if (item.setup)
      {
        value = qx.lang.Function.bind(item.setup, this)(item.input, data);
        if (typeof value == "undefined")
        {
          value = item.value;
        }
      }
      else
      {
        value = item.value;
      }

      // Save the initial value for this item in the data model
      this._skeleton[item.model] = value || null;
      
      // Save the element reference
      this._elements[item.model] = item.input;

      // Track the maximum column number used
      if (startCol + 1 > this._maxCol)
      {
        this._maxCol = startCol + 1;
      }
      
      // If there is not yet a focused field, or if this field is specifically
      // marked to receive the focus...
      if ((! this._focusElement || item.focus) && item.input.getEnabled())
      {
        // ... then record that we're setting the focus to this element, ...
        this._focusElement = item.input;
        
        // ... and actually do so.
        qx.util.TimerManager.getInstance().start(
          function()
          {
            // If this is a text field (with a selectAllText method)...
            if (this._focusElement.selectAllText)
            {
              // ... then select all text.
              this._focusElement.selectAllText();
            }
            
            // Now we can set the focus.
            this._focusElement.focus();
          },
          0,
          this);
      }
    },
    
    /**
     * Create a new element in the editor
     * 
     * @param type {String}
     *   The element type to be created
     * 
     * @param bDocument {Boolean}
     *   Whether to use the document object
     * 
     * @return {Object}
     *   A CkEditor representation of a DOM element
     *
     * @lint ignoreUndefined(CKEDITOR)
     */
    _makeElement : function(type, bDocument)
    {
      return new CKEDITOR.dom.element(type,
                                      (bDocument
                                       ? this.getCkEditor().document
                                       : undefined));
    }
  } 
});
