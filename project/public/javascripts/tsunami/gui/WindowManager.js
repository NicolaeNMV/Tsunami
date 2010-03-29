tsunami.tools.namespace('tsunami.gui');

/* TODO
 * * find a hack to bugfix the resizable bug on chrome when double click
 *
 * * Refactoring window manager idea :
 * * Propaging resizing :
 *    when a window is resizing :
 *    - if a window is min size and have left neighboor, resizing left neighboor (how to manage that ?)
 *    - same rule with max size and right neighboor
 *    when the global window is resizing :
 *    - resize all window (begin to right) to the min size (but the maximize will not un min size them)
 */

(function() {
  
  var contacts = tsunami.contacts;
  var tools = tsunami.tools;
  var gui = tsunami.gui;
  
  gui.Globals = {
    base: null
  };
  
  /**
   * Define constraints on an axis
   * @args min : minimum size of the window
   * @args max : maximum size of the window
   */
  gui.Constraints = function(min, max) {
    this.min = min;
    this.max = max;
  };
  
  gui.Window = function(id, xConstraints, yConstraints, options) {
    var self = this;
    
    this.id = id;
    this.constraints = {x: xConstraints, y: yConstraints};
    this.options = options || {};
    
    this.getNode = function() {
      if(this._node) return this._node;
      this.appendToBase();
      return this._node = $('#'+this.id, gui.Globals.base);
    };
    
    this.appendToBase = function() {
      if(!$('#'+this.id).size()) {
        var width = this.constraints.x.min;
        gui.Globals.base.append($('<div id="'+id+'" class="window'+(!self.options.notResizable?' ui-resizable':'')+'" />').width(width));
      }
      return this;
    };
    
    this.applyConstraints = function() {
      var node = this.getNode();
      return this;
    };
    
    this.bindAll = function() {
      if(!self.options.notResizable)
        self.getNode().resizable({
          containment: '#windows',
          handles: 'e',
          maxWidth: self.constraints.x.max,
          minWidth: self.constraints.x.min
        });
    };
    
  };
  
  // TODO : dynamic management of position and window size (absolute with #windows)
  
  gui.WindowManager = function() {
    
    var margin = 15;
    var minDefault = 100;
    
    // side by side windows
    var currentWindows = [
      new gui.Window('contactList', new gui.Constraints(250,400), new gui.Constraints(400)),
      new gui.Window('vagueList', new gui.Constraints(250,400), new gui.Constraints(400)),
      new gui.Window('vague', new gui.Constraints(250), new gui.Constraints(400), {notResizable: true, autoresize:true})
    ];
    
    var tpl_resizer = function() {
      return $('<div class="resizer">&nbsp;</div>');
    };
    
    var getMinWidth = function() {
      var width=margin;
      for(var w in currentWindows)
        width+=((currentWindows[w].options.notResizable?currentWindows[w].constraints.x.min:currentWindows[w].getNode().width())||minDefault)+margin;
      return width;
    };
    
    var getMinHeight = function() {
      var minHeight = 0;
      for(var w in currentWindows)
        if(currentWindows[w].constraints.y.min&&currentWindows[w].constraints.y.min>minHeight)
          minHeight = currentWindows[w].constraints.y.min;
      return minHeight+margin;
    };
    
    var computeWindowsWidth = function() {
      var total = $(window).width();
      var minWidth = getMinWidth();
      if(total<minWidth)
        total = minWidth;
      $('#windows').width(total);
      $('#banner').width(total-20);
      var totalAllocateSpace = margin;
      var countAutoResizeWindows = 0;
      for(var w in currentWindows)
        if(!currentWindows[w].options.autoresize)
          totalAllocateSpace += $(currentWindows[w].getNode()).width()+margin;
        else
          ++countAutoResizeWindows;
      var eachSpace = countAutoResizeWindows>0 ? Math.floor((total-totalAllocateSpace)/countAutoResizeWindows) : 0;
      for(var w in currentWindows)
        if(currentWindows[w].options.autoresize)
          currentWindows[w].getNode().width(eachSpace);
    };
    
    var computeWindowsHeight = function() {
      var minHeight = getMinHeight();
      var height = ($(window).height()-Math.floor($('#application').position().top));
      if(height<minHeight)
        height=minHeight;
      height-= 10;
      for(var w in currentWindows)
        currentWindows[w].getNode().height(height);
      $('#windows').height(height);
    };
    
    var onGlobalWindowResize = function() {
      computeWindowsHeight();
      computeWindowsWidth();
    };
    
    var onWindowResize = function() {
      computeWindowsWidth();
    };
    
    return {
      init: function() {
        node = $('<div id="windows" />').appendTo('#application');
        gui.Globals.base = node;
        
        for(var w=0; w<currentWindows.length; ++w) {
          /*if(w!=0)
            gui.Globals.base.append(tpl_resizer());*/
          var currentWindow = currentWindows[w];
          currentWindow.appendToBase().applyConstraints();
        }
        var windowsLoaded = 0;
        for(var w=0; w<currentWindows.length; ++w) {
          var currentWindow = currentWindows[w];
          var node = currentWindow.getNode();
          $(document).bind('window.'+currentWindow.id+'.ready', function() {
            if(windowsLoaded>=currentWindows.length) return; // all windows are already loaded
            windowsLoaded ++;
            if(windowsLoaded>=currentWindows.length) {
              gui.StatusBar.hide();
              for(var w=0; w<currentWindows.length; ++w)
                currentWindows[w].bindAll();
            }
          });
          $(node).bind('resize', computeWindowsWidth);
        }
        
        onGlobalWindowResize();
        $(window).resize(onGlobalWindowResize);
        $('#windows .window').resize(onWindowResize);
        $('#windows .window').hide();
        gui.StatusBar.showLoad('Chargement de comet...');
        $(document).one('comet.connect', function() {
            gui.StatusBar.showLoad('Chargement des fenêtres...');
        	$('#windows .window').show();
	        $(document).trigger('WindowManager.ready');
	    });
      }
    }
  }();
  
  $(document).ready(gui.WindowManager.init);
}());
