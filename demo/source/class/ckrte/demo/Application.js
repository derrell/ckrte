/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("ckrte.demo.Application",
{
 extend : qx.application.Standalone,

 members :
 {
   /**
    * This method contains the initial application code and gets called
    * during startup of the application
    *
    * @lint ignoreDeprecated(alert)
    */
   main : function()
   {
     // Call super class
     this.base(arguments);

     // Enable logging in debug variant
     if (qx.core.Environment.get("qx.debug"))
     {
       var appender;
       appender = qx.log.appender.Native;
       appender = qx.log.appender.Console;
     }

     var vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
     this.getRoot().add(vbox, { edge : 10 });

     var ckrte_editor = new ckrte.Ckeditor("hello world");
     var toolbar = new ckrte.Toolbar(ckrte_editor);
     vbox.add(toolbar);
     vbox.add(ckrte_editor, { flex : 1 } );
     
     ckrte_editor.addListener(
       "instanceReady",
       function(e)
       {
         this.debug("Got instanceReady event");
         
         // Turn on event debugging
//         this.setDebugMostEvents(true);
       });
   }
 }
});
