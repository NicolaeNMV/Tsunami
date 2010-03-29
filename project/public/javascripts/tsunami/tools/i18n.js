(function() { 
  
  if(!window.tsunami)
    window.tsunami={};
  if(!window.tsunami.tools)
    window.tsunami.tools={};
    
  var i18nMessages = tsunami.export.i18nMessages;
  
  tsunami.tools.i18n = function(code) {
      if( arguments.length > 1 ) {
          var message = i18nMessages[code] || code;
          for( var i=1; i< arguments.length; i++ ) {
              message = message.replace( /%\w/, arguments[i]);
          }
          return message;
      }
      return i18nMessages && i18nMessages[code] || code;
 };
 
}());