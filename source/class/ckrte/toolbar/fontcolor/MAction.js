/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(CKEDITOR.style)
 */

qx.Mixin.define("ckrte.toolbar.fontcolor.MAction",
{
  statics :
  {
    /**
     * The style definition to be used to apply the font color in the text.
     */
    fontColor_style :
      {
        element   : 'span',
        styles    : { 'color' : '#(color)' },
        overrides : [ { element : 'font', attributes : { 'color' : null } } ]
      }
  },

  members :
  {
    /** 
     * Implement the action for this commmand
     * 
     * @lint ignoreUndefined(CKEDITOR)
     */
    _action : function(color)
    {
      var         ckeditor = this.getCkRte().getCkEditor();

      // Set the focus
      ckeditor.focus();

      // Make this undoable
      ckeditor.fire("saveSnapshot");

      // Get the color style configuration
      var colorStyle = ckrte.toolbar.fontcolor.MAction.fontColor_style;

      // Clean up any conflicting style within the range.
      var style = new CKEDITOR.style(colorStyle, { color : 'inherit' });
      style.remove(ckeditor.document);

      // Apply the selected color
      var _this = this;
      colorStyle.childRule = function(element)
      {
        // Fore color style must be applied inside links instead of
        // around it.
        return (element.getName() != 'a' || _this._isUnstylable(element));
      };

      style = new CKEDITOR.style(colorStyle, { color : color });
      style.apply(ckeditor.document);
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
    }    
  }
});
