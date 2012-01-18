/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(CKEDITOR)
#ignore(CKEDITOR.style)
#ignore(CKEDITOR.plugins)
#ignore(CKEDITOR.dom.text)
 */

qx.Class.define("ckrte.dialog.Link",
{
  extend : ckrte.dialog.AbstractDialog,
  
  construct : function(ckrte_editor)
  {
    // Call the superclass constructor
    this.base(arguments, this.tr("Link Properties"), ckrte_editor);
  },
  
  members :
  {
    /** Saved selection, to avoid changes while a modal window appears */
    _savedSelection : null,

    /**
     * overridden
     * @lint ignoreUndefined(CKEDITOR)
     */
    _create : function(ckrte_editor)
    {
      var             selection;
      var             plugin;
      var             element;
      var             value;

      // Save the CkEditor editor object
      this.setCkEditor(ckrte_editor.getCkEditor());

      // Determine if we're editing an existing link, or creating a brand new
      // one.
      selection = this.getCkEditor().getSelection();
      
      // Save the selection since the modal window can make it go missing
      this._savedSelection = selection;

      plugin = CKEDITOR.plugins.link;
      element = plugin.getSelectedLink(this.getCkEditor());
      value = (element && element.getAttribute("href")) || "";
      
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
            label   : this.tr("URL"),
            model   : "txtUrl",
            type    : qx.ui.form.TextField,
            value   : value,
            col     : 0,
            set     :
            {
              minWidth : 200
            }
          }
        ]);
      
      // Complete creation of the dialog with the part generic to all dialogs.
      this.base(arguments, 1);
    },

    /**
     * //overridden
     * @lint ignoreUndefined(CKEDITOR)
     */
    _onOk : function(model)
    {
      var             ckeditor;
      var             selection;
      var             selectedText;
      var             plugin;
      var             ranges;
      var             element;
      var             info;
      var             text;
      var             style;

      // Obtain the internal CKEDITOR editor object
      ckeditor = this.getCkEditor();
      
      // Retrieve the selection, previously saved
      selection = this._savedSelection;
      selectedText = selection && selection.getSelectedText();

      // See if there is a link selected
      plugin = CKEDITOR.plugins.link;
      element = plugin.getSelectedLink(ckeditor);
      
      // Retrieve the entered info
      info = qx.util.Serializer.toNativeObject(this._model);
      
      // Is there a selected link?
      if (! element || ! element.hasAttribute("href"))
      {
        // No. Create the link on the selected text
        ranges = selection.getRanges(true);
        if (ranges.length == 1 && ranges[0].collapsed)
        {
          text = new CKEDITOR.dom.text(
            (selectedText && selectedText.length > 0
             ? selectedText
             : info.txtUrl),
            ckeditor.document);
          ranges[0].insertNode(text);
          ranges[0].selectNodeContents(text);
          selection.selectRanges(ranges);
        }
        
        // Apply style
        style = new CKEDITOR.style(
          {
            element : "a",
            attributes :
            {
              href : info.txtUrl
            }
          });
        style.type = CKEDITOR.STYLE_INLINE;
        style.apply(ckeditor.document);
      }
      else
      {
        // We're editing an existing link. Overwrite its attributes
        selection.selectElement(element);
        element.setAttributes(
          {
            href : info.txtUrl
          });
      }

      // Close the modal window
      this.close();
    }
  }
});
