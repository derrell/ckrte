/*
 * Copyright:
 *   2011 Derrell Lipman
 *   
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *   Derrell Lipman (derrell)
 */

/**
 * Image Previewer with properties to adjust characteristics of the image.
 * 
 * @lint ignoreUndefined(localfile)
 */
qx.Class.define("ckrte.dialog.ImagePreviewer",
{
  extend : qx.ui.embed.Html,
  
  implement : [ localfile.preview.IPreviewer ],
  
  properties :
  {
    source :
    {
      init     : null,
      nullable : true,
      apply    : "_applyPropertyChange"
    },

    imageWidth :
    {
      init     : 60,
      nullable : true,
      apply    : "_applyPropertyChange"
    },

    imageHeight :
    {
      init     : 60,
      nullable : true,
      apply    : "_applyPropertyChange"
    },

    borderWidth :
    {
      init     : 1,
      nullable : true,
      apply    : "_applyPropertyChange"
    },

    hSpace :
    {
      init     : null,
      nullable : true,
      apply    : "_applyPropertyChange"
    },

    vSpace :
    {
      init     : null,
      nullable : true,
      apply    : "_applyPropertyChange"
    },

    align :
    {
      init     : null,
      nullable : true,
      apply    : "_applyPropertyChange"
    }
  },

  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);
    
    // Make the previewer large enough to contain reasonable size preview images
    this.set(
      {
        width  : 200,
        height : 200
      });
  },
  
  statics :
  {
    DEFAULT_HEIGHT : 60,
    DEFAULT_WIDTH  : 60
  },

  members :
  {
    setData : function(dataUri)
    {
      this.setSource(dataUri);
    },
    
    _applyPropertyChange : function()
    {
      var             prop;
      var             html = [];
      var             style = [];
      
      // If there's no source, ...
      prop = this.getSource();
      if (! prop || prop.length == 0)
      {
        // ... then don't show anything
        this.setHtml("");
        return;
      }

      // Add the image tag
      html.push("<img");
      
      // Add the source property
      if (prop)
      {
        html.push("src='" + prop + "'");
      }
      
      // The remainder of the properties will be style settings
      html.push("style='");

      // Add the width property
      prop = this.getImageWidth();
      if (prop)
      {
        style.push("width:" + prop + "px;");
      }
      
      // Add the height property
      prop = this.getImageHeight();
      if (prop)
      {
        style.push("height:" + prop + "px;");
      }
      
      // Add the border width property
      prop = this.getBorderWidth();
      if (prop)
      {
        style.push("border-width:" + prop + "px;");
        style.push("border-style:solid;");
      }
      
      // Add the horizontal space property
      prop = this.getHSpace();
      if (prop)
      {
        style.push("margin-left:" + prop + "px;");
        style.push("margin-right:" + prop + "px;");
      }
      
      // Add the vertical space property
      prop = this.getVSpace();
      if (prop)
      {
        style.push("margin-top:" + prop + "px;");
        style.push("margin-bottom:" + prop + "px;");
      }
      
      // Add the align property
      prop = this.getAlign();
      switch(prop)
      {
      case "left":
        style.push("float:left;");
        break;

      case "right":
        style.push("float:right;");
        break;

      default:
        break;
      }
      
      // Terminate the style attribute
      html.push(style.join(""));
      html.push("'");
      
      // Terminate the image tag
      html.push("/>");

      // Combine it all together
      this.setHtml(html.join(" "));
    }
  }
});
