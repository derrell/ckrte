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

qx.Mixin.define("ckrte.toolbar.backgroundcolor.MAction",
{
  statics :
  {
    /**
     * The style definition to be used to apply the font color in the text.
     */
    backColor_style :
      {
	element : 'span',
	styles  : { 'background-color' : '#(color)' }
      }
  },

  members :
  {
    /**
     *  Implement the action for this commmand 
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
      var colorStyle = ckrte.toolbar.backgroundcolor.MAction.backColor_style;

      // Clean up any conflicting style within the range.
      var style = new CKEDITOR.style(colorStyle, { color : 'inherit' });
      style.remove(ckeditor.document);

      // Apply the selected color
      var _this = this;
      colorStyle.childRule = function(element)
      {
	// It's better to apply background color as the innermost style,
	// except for "unstylable elements".
	return _this._isUnstylable(element);
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
