/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(CKEDITOR)
#ignore(CKEDITOR.env);
#ignore(CKEDITOR.tools);
#ignore(CKEDITOR.dom.text)
#ignore(CKEDITOR.dom.range)
#ignore(CKEDITOR.dom.walker);
 */

qx.Class.define("ckrte.dialog.Table",
{
  extend : ckrte.dialog.AbstractDialog,
  
  construct : function(ckrte_editor)
  {
    // Call the superclass constructor
    this.base(arguments, this.tr("Table Properties"), ckrte_editor);
  },
  
  members :
  {
    /** The selected table, if we're editing an existing table */
    _selectedTable : null,

    /** The table element we're working with */
    _table : null,

    /**
     * //overridden
     * @lint ignoreUndefined(CKEDITOR)
     */
    _create : function(ckrte_editor)
    {
      var             selection;
      var             ranges;

      // Save the CkEditor editor object
      this.setCkEditor(ckrte_editor.getCkEditor());

      // Determine if we're editing an existing table, or creating a bran new
      // one.
      selection = this.getCkEditor().getSelection();
      ranges = selection.getRanges();
      this._selectedTable = selection.getSelectedElement();

      if (this._selectedTable)
      {
        // Find a table among our ancestors
        this._selectedTable =
          this._selectedTable.getAscendant("table", true);
      }
      else if (ranges.length > 0)
      {
        // Webkit could report the following range on cell selection (#4948):
        // <table><tr><td>[&nbsp;</td></tr></table>]
        if (CKEDITOR.env.webkit)
        {
          ranges[0].shrink(CKEDITOR.NODE_ELEMENT);
        }

        var rangeRoot = ranges[0].getCommonAncestor(true);
        this._selectedTable = rangeRoot.getAscendant("table", true);
      }
      
      // Use the selected table, if there is one.
      this._table = this._selectedTable;

      // If we still don't have a table element...
      if (! this._table)
      {
        // ... then create a new one.
        this._table = this._makeElement("table", true);
      }

      // Specify the grid configuration for this dialog
      this.setGridConfiguration(
        function(grid)
        {
          grid.setSpacingX(5);
          grid.setSpacingY(15);
          grid.setColumnAlign(0, "right", "middle");
          grid.setColumnAlign(3, "right", "middle");
        });

      // Define the configuration of this dialog
      this.setDialogConfiguration(
        [
          // First column of fields
          {
            label : this.tr("Rows"),
            model : "txtRows",
            type  : qx.ui.form.TextField,
            value : "2",
            col   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedTable)
              {
                elem.setEnabled(false);
                return this._selectedTable.getAttribute("data-cke-rows") || "";
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Columns"),
            model : "txtCols",
            type  : qx.ui.form.TextField,
            value : "3",
            col   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedTable)
              {
                elem.setEnabled(false);
                return this._selectedTable.getAttribute("data-cke-cols") || "";
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Headers"),
            model : "selHeaders",
            type  : qx.ui.form.SelectBox,
            col   : 0,
            items : 
              [ 
                {
                  label : this.tr("None"),
                  model : "none"
                },
                {
                  label : this.tr("First Row"),
                  model : "row"
                },
                {
                  label : this.tr("First Column"),
                  model : "col"
                },
                {
                  label : this.tr("Both"),
                  model : "both"
                }
              ],
            setup : function(elem)
            {
              // Brand new tables default to no header
              if (! this._selectedTable)
              {
                return "none";
              }

              // Fill in the headers field.
              this.setUserData("hasColumnHeaders", true);

              // Check if all the first cells in every row are TH
              for ( var row = 0 ;
                    row < this._table.$.rows.length ;
                    row++ )
              {
                // If just one cell isn't a TH then it isn't a header column
                var nodeName =
                  this._table.$.rows[row].cells[0].nodeName;
                if (nodeName.toLowerCase() != "th")
                {
                  this.setUserData("hasColumnHeaders", false);
                  break;
                }
              }

              // Check if the table contains <thead>.
              if ((this._table.$.tHead !== null))
              {
                return(this.getUserData("hasColumnHeaders")
                       ? "both"
                       : "row");
              }
              else
              {
                return(this.getUserData("hasColumnHeaders")
                       ? "col" 
                       : "none");
              }
            }
          },
          {
            label : this.tr("Border size"),
            model : "txtBorder",
            type  : qx.ui.form.TextField,
            value : "1",
            col   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              return this._table.getAttribute("border") || undefined;
            }
          },
          {
            label : this.tr("Alignment"),
            model : "cmbAlign",
            type  : qx.ui.form.SelectBox,
            col   : 0,
            items : 
            [
              {
                label : this.tr("<not set>"),
                model : "inherit"
              },
              {
                label : this.tr("Left"),
                model : "left"
              },
              {
                label : this.tr("Center"),
                model : "center"
              },
              {
                label : this.tr("Right"),
                model : "right"
              }
            ],
            setup : function(elem)
            {
              return this._table.getAttribute("align") || "inherit";
            }
          },

          // Second column of fields
          {
            label : this.tr("Width"),
            model : "txtWidth",
            type  : qx.ui.form.TextField,
            value : "500",
            col   : 3,
            row   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedTable)
              {
                return this._selectedTable.getAttribute("width") || "";
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Height"),
            model : "txtHeight",
            type  : qx.ui.form.TextField,
            col   : 3,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedTable)
              {
                return this._selectedTable.getAttribute("height") || "";
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Cell spacing"),
            model : "txtCellSpace",
            type  : qx.ui.form.TextField,
            col   : 3,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedTable)
              {
                return (this._selectedTable.getAttribute("cellSpacing") || "");
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Cell padding"),
            model : "txtCellPad",
            type  : qx.ui.form.TextField,
            col   : 3,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedTable)
              {
                return (this._selectedTable.getAttribute("cellPadding") || "");
              }
              
              return undefined;
            }
          },

          // Define the properties for the dual-width fields at the bottom
          {
            label   : this.tr("Caption"),
            model   : "txtCaption",
            type    : qx.ui.form.TextField,
            col     : 0,
            row     : "end",
            colSpan : 4,
            setup   : function(elem)
            {
              // save caption element for Ok process
              this._caption = elem;
              
              if (this._selectedTable)
              {
                var nodeList = this._selectedTable.getElementsByTag("caption");
                if (nodeList.count() > 0)
                {
                  var caption = nodeList.getItem(0);
                  var firstElementChild = 
                    caption.getFirst(
                      CKEDITOR.dom.walker.nodeType(CKEDITOR.NODE_ELEMENT));

                  if ( firstElementChild &&
                       ! firstElementChild.equals(caption.getBogus()))
                  {
                    elem.setEnabled(false);
                    caption = caption.getText();
                    return caption;
                  }

                  caption = CKEDITOR.tools.trim(caption.getText());
                  return caption;
                }
              }

              return undefined;
            }
          },
          {
            label   : this.tr("Summary"),
            model   : "txtSummary",
            type    : qx.ui.form.TextField,
            col     : 0,
            colSpan : 4,
            setup   : function(elem)
            {
              return this._table.getAttribute("summary");
            }
          }
        ]);
      
      // Complete creation of the dialog with the part generic to all dialogs.
      this.base(arguments);
    },
    
    /**
     * //overridden
     * @lint ignoreUndefined(CKEDITOR)
     */
    _onOk : function(model)
    {
      var             i;
      var             j;
      var             info;
      var             table = this._table;
      var             thead;
      var             tbody;
      var             rows;
      var             cols;
      var             row;
      var             cell;
      var             headers;
      var             th;
      var             prevFirstRow;
      var             selection;
      var             bms;
      var             ckeditor;
      var             caption;
      var             captionElement;
      var             summary;

      // Obtain the internal CKEDITOR editor object
      ckeditor = this.getCkEditor();
      
      selection = ckeditor.getSelection();
      bms = this._table && selection.createBookmarks();
      
      // Retrieve the entered info
      info = qx.util.Serializer.toNativeObject(this._model);
      
      // If we're creating a new table...
      if  (! this._selectedTable)
      {
        // Determine the number of rows and columns
        rows = parseInt(info.txtRows, 10) || 0;
        cols = parseInt(info.txtCols, 10) || 0;

        // Create the table body
        tbody = table.append(this._makeElement("tbody", true));

        // Build the table. For each row...
        for (i = 0; i < rows; i++)
        {
          // Create this row
          row = tbody.append(this._makeElement("tr", true));

          // For each column...
          for (j = 0; j < cols; j++)
          {
            cell = row.append(this._makeElement("td", true));

            // Ensure the cell takes up space. (Not in IE)
            if (! CKEDITOR.env.ie)
            {
              cell.append(this._makeElement("br", true));
            }
          }
        }
      }
      
      // Modify the table headers. Should we make a <thead>?
      headers = info.selHeaders;
      if (! table.$.tHead && (headers == "row" || headers == "both"))
      {
        thead = this._makeElement(table.$.createTHead());
        tbody = table.getElementsByTag("tbody").getItem(0);
        row = tbody.getElementsByTag("tr").getItem(0);
        
        // Change TD to TH
        for (i = 0; i < row.getChildCount(); i++)
        {
          th = row.getChild(i);
          
          // Skip bookmark nodes
          if (th.type == CKEDITOR.NODE_ELEMENT && ! th.data('cke-bookmark'))
          {
            th.renameNode("th");
            th.setAttribute("scope", "col");
          }
        }
        thead.append(row.remove());
      }
      
      if (table.$.tHead !== null && ! (headers == "row" || headers == "both"))
      {
        // Move the row out of the THead and put it in the TBody
        thead = this._makeElement(table.$.tHead);
        tbody = table.getElementsByTag("tbody").getItem(0);
        
        prevFirstRow = tbody.getFirst();
        while (thead.getChildCount() > 0)
        {
          row = thead.getFirst();
          for (i = 0; i < row.getChildCount(); i++)
          {
            cell = row.getChild(i);
            if (cell.type == CKEDITOR.NODE_ELEMENT)
            {
              cell.renameNode("td");
              cell.removeAttribute("scope");
            }
          }
          
          row.insertBefore(prevFirstRow);
        }
        
        thead.remove();
      }
      
      // Should we make all first cells in a row TH?
      if (! this.getUserData("hasColumnHeaders") &&
          (headers == "col" || headers == "both"))
      {
        for (row = 0; row < table.$.rows.length; row++)
        {
          cell = this._makeElement(table.$.rows[row].cells[0]);
          cell.renameNode("th");
          cell.setAttribute("scope", "row");
        }
      }
      
      // Should we make all first TH-cells in a row make TD? If yes, we do it
      // the other way round.
      if (this.getUserData("hasColumnHeaders") &&
          ! (headers == "col" || headers == "both"))
      {
        for (i = 0; i < table.$.rows.length; i++)
        {
          row = this._makeElement(table.$.rows[i]);
          if (row.getParent().getName() == "tbody")
          {
            cell = this._makeElement(row.$.cells[0]);
            cell.renameNode("td");
            cell.removeAttribute("scope");
          }
        }
      }
      
      // Set the width and height styles
      info.txtHeight 
        ? table.setStyle("height", info.txtHeight)
        : table.removeStyle("height");
      info.txtWidth 
        ? table.setStyle("width", info.txtWidth)
        : table.removeStyle("width");
      
      // If we're creating the table element...
      if (! this._selectedTable)
      {
        // Insert the table element
        try
        {
          ckeditor.insertElement(table);
        }
        catch(e)
        {
        }
        
        // Override the default cursor position after insertElement, to place
        // the cursor inside the first cell. IE needs a while.
        qx.util.TimerManager.getInstance().start(
          function()
          {
            var firstCell = this._makeElement(table.$.rows[0].cells[0]);
            var range = new CKEDITOR.dom.range(ckeditor.document);
            range.moveToPosition(firstCell, CKEDITOR.POSITION_AFTER_START);
            range.select(1);
          },
          this);
      }
      else
      {
        // Not a new table. Properly restore the selection, but don't break
        // because of this, e.g. updated table caption.
        try
        {
          selection.selectBookmarks(bms);
        }
        catch(e)
        {
        }
      }

      // Set additional table attributes
      [
        {
          fieldName : "txtRows",
          attrName  : "data-cke-rows"
        },
        {
          fieldName : "txtCols",
          attrName  : "data-cke-cols"
        },
        {
          fieldName : "txtWidth",
          attrName  : "width"
        },
        {
          fieldName : "txtHeight",
          attrName  : "height"
        },
        {
          fieldName : "txtBorder",
          attrName  : "border"
        },
        {
          fieldName : "cmbAlign",
          attrName  : "align",
          valid     : [ "left", "center", "right" ]
        },
        {
          fieldName : "txtCellSpace",
          attrName  : "cellSpacing"
        },
        {
          fieldName : "txtCellPad",
          attrName  : "cellPadding"
        }
      ].forEach(
        function(attr)
        {
          // Ensure we have a valid value to set
          if (attr.valid &&
              ! qx.lang.Array.contains(attr.valid, info[attr.fieldName]))
          {
            // We had valid choices, and this isn't one of them. Remove the
            // attribute.
            table.removeAttribute(attr.attrName);
          }
          else if (info[attr.fieldName] && info[attr.fieldName].length > 0)
          {
            // We're given an attribute value. Set the attribute.
            table.setAttribute(attr.attrName, info[attr.fieldName]);
          }
          else
          {
            // No attribute value was given. Remove the attribute.
            table.removeAttribute(attr.attrName);
          }
        });

      //
      // caption
      //
      if (this._caption.getEnabled())
      {
        // Get the caption data
        caption = info["txtCaption"];
        captionElement = table.getElementsByTag("caption");

        // Is there a caption?
        if (caption && caption.length > 0)
        {
          // Yup. Was there a previous caption?
          if (captionElement.count() > 0)
          {
            // Yes. Remove it.
            captionElement = captionElement.getItem(0);
            captionElement.setHtml("");
          }
          else
          {
            // No previous caption element. Create one.
            captionElement = this._makeElement("caption", true);
            
            // Is there anything currently in the table?
            if (table.getChildCount())
            {
              // Yes. Insert the caption before the first element.
              captionElement.insertBefore(table.getFirst());
            }
            else
            {
              // Nothing in the table yet, so the caption comes first.
              captionElement.appendTo(table);
            }
          }

          // Now add the caption to its element
          captionElement.append(new CKEDITOR.dom.text(caption,
                                                      ckeditor.document));
        }
        else if (captionElement.count() > 0)
        {
          // No current caption. Remove the previous caption
          for (i = captionElement.count() - 1; i >= 0; i--)
          {
            captionElement.getItem(i).remove();
          }
        }
      }
      
      // Get and save the summary data
      summary = info["txtSummary"];
      this._table.setAttribute("summary", summary);

      this.close();
    }
  }
});
