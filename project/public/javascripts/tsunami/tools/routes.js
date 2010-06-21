tsunami.tools.namespace('tsunami.tools');

(function(){
  
  var tools = tsunami.tools;
  var routes = tsunami.export.routes;
  
  tools.Router = function() {
    
    var regexpArgs = /\{(<([^>]+)>)?([a-zA-Z_0-9]+)\}/;
    
    var find = function(action) {
      for(i in routes)
        if(routes[i].a==action)
          return routes[i];
      return null;
    };
    
    var objectRemove = function(object, field) {
      if(!object || !field)
        return object;
      var newObject = {};
      for(i in object)
        if(i!=field)
          newObject[i] = object[i];
      return newObject;
    };
    
    var computeUrl = function(path, args) {
      var argsNotComputed=args;
      path = path.replace(/\/\?$/, '');
      var error = false;
      while( path.match(regexpArgs) ) {
        path=path.replace(regexpArgs, function() {
          var arg = arguments[3];
          if( args[arg] ) {
            argsNotComputed = objectRemove(argsNotComputed, arg);
            return args[arg];
          }
          else
            error = true;
        });
      };
      if(error)
        return null;
      return {url: path, args: argsNotComputed};
    };
    
    // clean undefined and null args
    var cleanArgs = function(args) {
      var _args={};
        for(i in args)
          if(args[i]!=null)
            _args[i]=args[i];
      return _args;
    };
    
    return {
      
      ajax: function(action, args, success, error) {
        var route = find(action);
        if(route==null)
          return true;
        
        var compute = computeUrl(route.p, cleanArgs(args) );
        if(!compute)
          return true;
        compute.args['userWindowId'] = tsunami.export.loadedat; // Sometimes we need to the window which send the request
        
        var options = {
          type: route.m,
          url: compute.url,
          data: compute.args,
          dataType: "json"
        };
        if(success)
          options.success = success;
        if(error)
          options.error = error;
        
        $.ajax(options);
        return false;
      },
      
      url: function(action, args) {
        var route = find(action);
        if(route==null)
          return null;
        
        var compute = computeUrl(route.p, cleanArgs(args) );
        if(compute.error)
          return null;
        
        return compute.url;
      }
    }
  }();
  
}());
