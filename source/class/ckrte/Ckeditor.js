/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
     2011      Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gregory Beaver
     * Norbert Schroeder
     * Derrell Lipman

#ignore(CKEDITOR)
#ignore(CKEDITOR.config)

#use(qx.ui.menu.Menu)
#use(ckrte.plugins.ContextMenu)

************************************************************************ */

qx.Class.define("ckrte.Ckeditor", 
{
  extend: qx.ui.form.TextArea,

  /**
   * @lint ignoreUndefined(CKEDITOR)
   */
  construct: function(value, ckeditorConfig)
  {
    // Call the superclass constructor
    this.base(arguments, value);

    // Once this widget appears, instantiate CkEditor instance
    this.addListenerOnce(
      "appear",
      function(e)
      {
        // Get the DOM element that was generated for the qx.ui.form.TextArea
        var el = this.getContentElement().getDomElement();
        
        // Get its initial size
        var hint = this.getBounds();
        
        // Replace that element with a CkEditor instance
        this.__ckEditor = CKEDITOR.replace(
          el,
          {
            height: hint.height - 4, // leave room for focus border
//            width: hint.width,
            resize_enabled: false,
            tabIndex: this.getTabIndex(),
            skin: "kama",
            toolbar : []
          });

        this.addListener("resize", this._onResize, this);

        // When the CkEditor instance is ready...
        this.__ckEditor.on(
          "instanceReady",
          function(e)
          {
            // ... then fire an event to notify listeners.
            this.fireDataEvent("instanceReady", this.__ckEditor);
          },
          this);
      }, 
      this);
    
    // Basic CKEDITOR configuration
    CKEDITOR.config.contentsCss = 'styles.css';
    CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;
    
    // Do not include a number of plugins from the standard distribution
    CKEDITOR.config.removePlugins =
      [
        "button",
        "colorbutton",
        "colordialog",
        "contextmenu",
        "dialogadvtab",
        "elementspath",
        "filebrowser",
        "flash",
        "font",
        "forms",
        "iframe",
        "maximize",
        "menu",
        "newpage",
        "pagebreak",
        "pastefromword",
        "pastetext",
        "popup",
        "preview",
        "print",
        "resize",
        "save",
        "toolbar"
      ].join(",");
    
    // Include our extra plugins
    CKEDITOR.config.extraPlugins =
      [
        // Our replacement for contextmenu and menu
        "qxcontextmenu"
      ].join(",");
    
    // Initialize an empty map for function references
    this.__debugMostEventsFunctions = {};
  },

  events :
  {
    afterCommandExec    : "qx.event.type.Data",
    afterPaste          : "qx.event.type.Data",
    afterSetData        : "qx.event.type.Data",
    afterUndoImage      : "qx.event.type.Data",
    beforeCommandExec   : "qx.event.type.Data",
    beforeGetData       : "qx.event.type.Data",
    beforeModeUnload    : "qx.event.type.Data",
    beforePaste         : "qx.event.type.Data",
    beforeSetMode       : "qx.event.type.Data",
    beforeUndoImage     : "qx.event.type.Data",
    blur                : "qx.event.type.Data",
    click               : "qx.event.type.Data",
    contentDirChanged   : "qx.event.type.Data",
    contentDom          : "qx.event.type.Data",
    contentDomUnload    : "qx.event.type.Data",
    customConfigLoaded  : "qx.event.type.Data",
    dataReady           : "qx.event.type.Data",
    destroy             : "qx.event.type.Data",
    dirChanged          : "qx.event.type.Data",
    doubleclick         : "qx.event.type.Data",
    editingBlockReady   : "qx.event.type.Data",
    elementsPathUpdate  : "qx.event.type.Data",
    focus               : "qx.event.type.Data",
    getData             : "qx.event.type.Data",
    getSnapshot         : "qx.event.type.Data",
    insertElement       : "qx.event.type.Data",
    insertHtml          : "qx.event.type.Data",
    insertText          : "qx.event.type.Data",
    instanceDestroyed   : "qx.event.type.Data",
    instanceReady       : "qx.event.type.Data",
    key                 : "qx.event.type.Data",
    keydown             : "qx.event.type.Data",
    loadSnapshot        : "qx.event.type.Data",
    loaded              : "qx.event.type.Data",
    menuShow            : "qx.event.type.Data",
    mode                : "qx.event.type.Data",
    mousemove           : "qx.event.type.Data",
    mouseup             : "qx.event.type.Data",
    paste               : "qx.event.type.Data",
    pasteDialog         : "qx.event.type.Data",
    pasteState          : "qx.event.type.Data",
    readOnly            : "qx.event.type.Data",
    ready               : "qx.event.type.Data",
    removeFormatCleanup : "qx.event.type.Data",
    reset               : "qx.event.type.Data",
    resize              : "qx.event.type.Data",
    saveSnapshot        : "qx.event.type.Data",
    scaytDialog         : "qx.event.type.Data",
    scaytReady          : "qx.event.type.Data",
    selectionChange     : "qx.event.type.Data",
    showScaytState      : "qx.event.type.Data",
    themeLoaded         : "qx.event.type.Data",
    themeSpace          : "qx.event.type.Data",
    uiReady             : "qx.event.type.Data",
    updateSnapshot      : "qx.event.type.Data"
  },

  properties:
  {
    /** 
     * The appearance to use for this widget.
     * We revert to a plain widget appearance instead of TextField's
     */
    appearance:
    {
      refine: true,
      init: "widget"
    },
    
    /**
     * When true, write a debug message whenever any of the supported CkEditor
     * events is fired. The exception is that "mouseover" events are ignored, as
     * they clutter the console too much.
     */
    debugMostEvents :
    {
      check : "Boolean",
      init  : false,
      apply : "_applyDebugMostEvents"
    }
  },

  members :
  {
    /** The CkEditor object (which is actually a map) */
    __ckEditor: null,

    /** Whether a resize is in progress (prevents recursion) */
    __resizeInProgress : false,

    /**
     * Retrieve the CkEditor editor object.
     * 
     * @return {Map}
     */
    getCkEditor : function()
    {
      return this.__ckEditor;
    },
    
    /** A map of event handler functions, allowing easy removal of handlers */
    __debugMostEventsFunctions : null,

    // property apply function
    _applyDebugMostEvents : function(value, old)
    {
      var eventTypes = 
        qx.lang.Object.getKeys(ckrte.event.Handler.SUPPORTED_TYPES);

      eventTypes.forEach(
        function(eventType)
        {
          // Ignore too-frequent mousemove event
          if (eventType == "mousemove") 
          {
            return;
          }

          if (value)
          {
            // Display a message for each event
            this.addListener(
              eventType,
              this.__debugMostEventsFunctions[eventType] = function(e)
              {
                this.debug("Got event: " + eventType);
              },
              this);
          }
          else
          {
            // Remove the listener for this event type
            this.removeListener(
              eventType,
              this.__debugMostEventsFunctions[eventType],
              this);
          }
        },
        this);
    },
    

    /**
     * Handler for the resize event. Resize the CkEditor to available space.
     */
    _onResize : function()
    {
      // Is this a recursive call?
      if (this.__resizeInProgress)
      {
        // Yup. Ignore it.
        return;
      }
      
      // Lock to prevent recursive calls to this code
      this.__resizeInProgress = true;

      // Get its initial size
      var hint = this.getBounds();
      
      // Resize the editor
      this.__ckEditor.resize(hint.width, hint.height - 4);
      
      // Unlock recursion protection
      this.__resizeInProgress = false;
    }
  }
});
