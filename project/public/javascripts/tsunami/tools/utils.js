(function() {

  if(!window.tsunami)
    window.tsunami={};
  if(!window.tsunami.tools)
    window.tsunami.tools={};

  tsunami.tools.namespace = function() {
    var a = arguments, o = null, i, j, d;
    for (i = 0; i < a.length; i = i + 1) {
      d = a[i].split(".");
      o = window;
      for (j = 0; j < d.length; j = j + 1) {
        o[d[j]] = o[d[j]] || {};
        o = o[d[j]];
      }
    }
    return o;
  };

  tsunami.tools.escapeHtml = function(str) {
    return (!str)? '' : str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  };
  
  tsunami.tools.log = function(obj) {
    if(!window.console || !window.console.log)
      return;
    console.log(obj);
  };
  
  /**
    This function look for the underscore character(_) and return the string after it
    Useful in the something_id construction, id is returned.
  **/
  tsunami.tools.afterUnderscore = function(s) {
    return s.substr(s.indexOf("_")+1);
  }
  
  // Validation de formulaires et gestion d'erreur //
  tsunami.tools.validation = function(){

    // Private //

    var playValidationMessageToString = function(message, variables) {
      switch(message) {
        case 'validation.required': return "Ce champ est requis.";
        case 'validation.email'   : return "Ce champ doit être un email valide.";
        case 'validation.minSize' : return "Ce champ doit faire au moins "+variables[0]+" caractères.";
        case 'validation.maxSize' : return "Ce champ doit faire au plus "+variables[0]+" caractères.";
      }
      return message;
    };

    var resetErrors = function(formNode) {
      $('.errorContainer',formNode).remove();
      $('.errorField',formNode).removeClass('errorField');
    };

    var createNode = function(errorMessage) {
      var formLine = $('<div />').addClass('formline').addClass('errorContainer');
      var node = $('<span />')
      .addClass('error')
      .text( errorMessage )
      .appendTo(formLine);
      return formLine;
    };

    return {

      // Public //

      showErrors : function(data, formNode) {
        if(!formNode) {
          formNode = $('form').get(0);
          if(!formNode)
            return;
        }
        resetErrors(formNode);
        var focus = false;
        for(i in data) {
          var error = playValidationMessageToString(data[i].message, data[i].variables)
          var node = $('*[name='+data[i].key+']',formNode)
          .addClass('errorField')
          .after(createNode(error));
          if(!focus) {
            focus=true;
            node.focus();
          }
        }
      },

      globalError : function(error, formNode) {
        if(!error)
          return;
        if(!formNode) {
          formNode = $('form').get(0);
          if(!formNode)
            return;
        }
        resetErrors(formNode);
        $(formNode).append(createNode(error));
      },
      
      getResponseTextError : function(responseText) {
        try {
          var error = eval('('+responseText+')');
          if(error.type && error.type=='play.mvc.results.Error')
            return tsunami.tools.i18n('error.'+error.message);
          else if(error instanceof Array && error[0].message) {
            var messages = "";
            for(var i=0; i<error.length; ++i) {
              if(i!=0)
              messages += ', ';
              messages += playValidationMessageToString(error[0].message, error[0].variables);
            }
            return messages;
          }
        }
        catch(e) {
          return responseText.toString();
        }
      }
    }

  }();

}());
