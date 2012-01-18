/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(CKEDITOR.tools)
 */

qx.Class.define("ckrte.dialog.Image",
{
  extend : ckrte.dialog.AbstractDialog,
  
  construct : function(ckrte_editor)
  {
    // Call the superclass constructor
    this.base(arguments, this.tr("Image Properties"), ckrte_editor);
  },
  
  members :
  {
    _selectedImage : null,

    /**
     * //overridden
     * @lint ignoreUndefined(CKEDITOR,localfile)
     */
    _create : function(ckrte_editor)
    {
      var             selection;

      // Save the CkEditor editor object
      this.setCkEditor(ckrte_editor.getCkEditor());

      // Determine if we're editing an existing image, or creating a brand new
      // one.
      selection = this.getCkEditor().getSelection();
      this._selectedImage = selection.getSelectedElement();
      
      // Is the selected element an image?
      if (this._selectedImage && this._selectedImage.getName() == "img")
      {
        // Yup. Use this is our image element
        this._image = this._selectedImage;
      }
      else
      {
        // It's not an image, so ignore the selection for the time being.
        this._selectedImage = null;

        // Create a new image.
        this._image = this._makeElement("img", true);
      }

      // Specify the grid configuration for this dialog
      this.setGridConfiguration(
        function(grid)
        {
          grid.setSpacingX(5);
          grid.setSpacingY(15);
          grid.setColumnAlign(0, "right", "middle");
        });

      // Define the configuration of this dialog
      this.setDialogConfiguration(
        [
          {
            label : this.tr("Image file"),
            model : "txtDataUrl",
            type  : localfile.Retrieve,
            col   : 0,
            set   :
            {
              label : "Select"
            },
            setup : function(elem)
            {
              // Save the reference so we can associate a previewer later
              this._retrieve = elem;

              // If we're editing an existing image...
              if (this._selectedImage)
              {
                // ... then set and return the value.
                var src =  this._selectedImage.getAttribute("src") || "";
                elem.setValue(src);
                return src;
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Width"),
            model : "txtWidth",
            type  : qx.ui.form.TextField,
            col   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedImage)
              {
                return (
                  this._selectedImage.getAttribute("width")
                    || this._getPx(this._selectedImage.getStyle("width"))
                    || "");
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Height"),
            model : "txtHeight",
            type  : qx.ui.form.TextField,
            col   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedImage)
              {
                return (
                  this._selectedImage.getAttribute("height")
                    || this._getPx(this._selectedImage.getStyle("height"))
                    || "");
              }
              
              return undefined;
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
              if (this._selectedImage)
              {
                return (
                  this._getPx(this._selectedImage.getStyle("border-width"))
                    || "");
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Horizontal spacing"),
            model : "txtHSpace",
            type  : qx.ui.form.TextField,
            col   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedImage)
              {
                return (
                  this._getPx(this._selectedImage.getStyle("margin-left"))
                    || "");
              }
              
              return undefined;
            }
          },
          {
            label : this.tr("Vertical spacing"),
            model : "txtVSpace",
            type  : qx.ui.form.TextField,
            col   : 0,
            set   :
            {
              filter : /[0-9]/
            },
            setup : function(elem)
            {
              if (this._selectedImage)
              {
                return (
                  this._getPx(this._selectedImage.getStyle("margin-top"))
                    || "");
              }
              
              return undefined;
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
                label : this.tr("Right"),
                model : "right"
              }
            ],
            setup : function(elem)
            {
              if (this._selectedImage)
              {
                return this._selectedImage.getStyle("float") || "inherit";
              }
              
              return undefined;
            }
          },

          // Add the image previewer
          {
            label   : null,
            model   : "imgPreview",
            type    : ckrte.dialog.ImagePreviewer,
            col     : 3,
            row     : 0,
            rowSpan : 5,
            setup   : function(elem)
            {
              // Save this previewer
              this._previewer = elem;
              
              // Associate it with the Retrieve widget, for previewing images.
              this._retrieve.setPreviewer("image/*", elem);
              
              // If we're editing an existing image...
              if (this._selectedImage)
              {
                // ... then set and return the value.
                var src =  this._selectedImage.getAttribute("src") || "";
                elem.setSource(src);
                return src;
              }
              
              return undefined;
            }
          },

          // Define the properties for the dual-width fields at the bottom
          {
            label   : this.tr("Alternative Text"),
            model   : "txtAlt",
            type    : qx.ui.form.TextField,
            col     : 0,
            row     : "end",
            colSpan : 4,
            setup : function(elem)
            {
              if (this._selectedImage)
              {
                return this._selectedImage.getAttribute("alt") || "";
              }
              
              return undefined;
            }
          }
        ]);
      
      // Complete creation of the dialog with the part generic to all dialogs.
      this.base(arguments);
      
      // Bind the form properties to the preview image
      this._elements["txtWidth" ].bind("value", this._previewer, "imageWidth");
      this._elements["txtHeight"].bind("value", this._previewer, "imageHeight");
      this._elements["txtBorder"].bind("value", this._previewer, "borderWidth");
      this._elements["txtHSpace"].bind("value", this._previewer, "hSpace");
      this._elements["txtVSpace"].bind("value", this._previewer, "vSpace");
      this._elements["cmbAlign" ].bind("modelSelection[0]",
                                       this._previewer, 
                                       "align");
    },
    
    /**
     * Convert an alphanumeric string representing a number of pixels, e.g.,
     * "8px" to a string containing on the number, e.g., "8".
     * 
     * @param str {String}
     *   The string which (presumably) contains a number followed by "px"
     * 
     * @return {String}
     *   A string containing only the numeric portion of the number of pixels
     */
    _getPx : function(str)
    {
      // If there's a pixel string...
      if (str && str.length > 0)
      {
        // ... then extract the number from the beginning, and convert to string
        return "" + parseInt(str, 10);
      }
      
      // We were given no string to parse.
      return "";
    },

    /**
     * //overridden
     * @lint ignoreUndefined(CKEDITOR)
     */
    _onOk : function(model)
    {
      var             selection;
      var             bms;
      var             info;
      var             ckeditor;

      // Obtain the internal CKEDITOR editor object
      ckeditor = this.getCkEditor();
      
      selection = ckeditor.getSelection();
      bms = this._table && selection.createBookmarks();
      
      // Retrieve the entered info
      info = qx.util.Serializer.toNativeObject(this._model);
      
      // Apply image properties
      this._configureImageAttributes(this._image, info);

      // If we're creating the image element...
      if (! this._selectedImage)
      {
        // Insert the image element
        ckeditor.insertElement(this._image);
      }
      else
      {
        // Not a new image. Properly restore the selection, but don't break
        // because of this, e.g. updated table caption.
        try
        {
          selection.selectBookmarks(bms);
        }
        catch(e)
        {
        }
      }
      
      // Close the modal window
      this.close();
    },
    
    /**
     * Alter the attributes of an image based on provided data.
     * 
     * @param image {Node}
     *   The <image> node to be modified
     * 
     * @param info {Map}
     *   A map of data to apply to the image node.
     * 
     * @lint ignoreUndefined(CKEDITOR)
     */
    _configureImageAttributes : function(image, info)
    {
      // Add the source property
      info.txtDataUrl && info.txtDataUrl.length > 0
        ? image.setAttribute("src", info.txtDataUrl)
        : image.removeAttribute("src");
      
      // Add the alt property
      info.txtAlt && info.txtAlt.length > 0
        ? image.setAttribute("alt", info.txtAlt)
        : image.removeAttribute("alt");
      
      // Add the width property
      if (info.txtWidth && info.txtWidth.length > 0)
      {
        image.setStyle("width", CKEDITOR.tools.cssLength(info.txtWidth));
        image.setAttribute("width", info.txtWidth);
      }
      else
      {
        image.removeStyle("width");
        image.removeAttribute("width");
      }
      
      // Add the height property
      if (info.txtHeight && info.txtHeight.length > 0)
      {
        image.setStyle("height", CKEDITOR.tools.cssLength(info.txtHeight));
        image.setAttribute("height", info.txtHeight);
      }
      else
      {
        image.removeStyle("height");
        image.removeAttribute("height");
      }
      
      // Add the border width property
      if (info.txtBorder && info.txtBorder.length > 0)
      {
        image.setStyle("border-width", 
                       CKEDITOR.tools.cssLength(info.txtBorder));
        image.setStyle("border-style", "solid");
      }
      else
      {
        image.removeStyle("border-width");
        image.removeStyle("border-style");
      }
      
      // Add the horizontal space property
      if (info.txtHSpace && info.txtHSpace.length > 0)
      {
        image.setStyle("margin-left", 
                       CKEDITOR.tools.cssLength(info.txtHSpace));
        image.setStyle("margin-right", 
                       CKEDITOR.tools.cssLength(info.txtHSpace));
      }
      else
      {
        image.removeStyle("margin-left");
        image.removeStyle("margin-right");
      }
      
      // Add the vertical space property
      if (info.txtVSpace && info.txtVSpace.length > 0)
      {
        image.setStyle("margin-top", 
                       CKEDITOR.tools.cssLength(info.txtVSpace));
        image.setStyle("margin-bottom", 
                       CKEDITOR.tools.cssLength(info.txtVSpace));
      }
      else
      {
        image.removeStyle("margin-top");
        image.removeStyle("margin-bottom");
      }
      
      // Add the align property
      switch(info.cmbAlign)
      {
      case "left":
      case "right":
        image.setStyle("float", info.cmbAlign);
        break;

      default:
        image.removeStyle("float");
        break;
      }
    }
  }
});
