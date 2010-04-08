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
  
  
  gui.WindowManager = function() {
    
    var windowHandle = null;
    var g_windows;
    var g_windowsReverse;
    var g_handlers;
    var g_windowsContainerNode;
    var HALF_SIZE_HANDLE = 2;
    
    var window_padding = 5;
    
    var handles_total_width = 0;
    
    var tpl_window = function(id) {
      return '<div id="'+id+'" class="window"></div>';
    };
    
    var tpl_handle = function() {
      return '<div class="window-handle"></div>';
    };
    
    var initWindows = function(windows) {
      var windowsNode = $('<div id="windows" />');
      var isFirst = true;
      for(var w in windows) {
        if(isFirst) 
          isFirst = false;
        else 
          windowsNode.append(tpl_handle());
        windowsNode.append(tpl_window(windows[w].id));
      }
      windowsNode.appendTo('#application');
      
      for(var w in windows) {
        var win = windows[w];
        win.node = $('#'+win.id);
        if(win.minWidth) {
          win.node.css('min-width', win.minWidth+'px');
        }
        if(win.maxWidth) win.node.css('max-width', win.maxWidth+'px');
      }
      g_windows = windows;
      g_windowsReverse = windows.slice().reverse();
    };
    
    var propageResize = function() {
      var width = handles_total_width+g_windows.length * 2 * window_padding;
      for(var w in g_windows)
        width += g_windows[w].node.width();
      var maxW = g_windowsContainerNode.width();
      var offset = maxW-width;
      applyOffset(offset, g_windowsReverse, maxW, offset);
      g_handlers.height(g_windowsContainerNode.height());
    };
    
    var altIfNaN = function(value, alt) {
      return isNaN(value) ? alt : value;
    };
    
    /**
     * return free space constraints of all windows give in arrayOfWindows
     * @param arrayOfWindows : array of { node<jQuery selector>, 
                                          minWidth<integer>, 
                                          maxWidth<integer> }
     * @return [l, r] : 
          l : the left free space
          r : the right free space
          l and r are positive integer OR NaN for no limit space
     */
    var computeFreeSpace = function(arrayOfWindows) {
      var free = [0, 0]; 
      for(var a in arrayOfWindows) {
        var win = arrayOfWindows[a];
        var width = win.node.width();
        if(!isNaN(free[0]))
          free[0] += (width-(win.minWidth ? win.minWidth : 0));
        if(!isNaN(free[1]))
          free[1] += (!win.maxWidth) ? NaN : (win.maxWidth-width);
      }
      return free;
    };
    
    /**
     * return free space constraints around handle
     * @param handleNode : the handle node
     * @return [l, r] : 
          l : the left free space
          r : the right free space
     */
    var computeHandleFreeSpace = function(windowsLeft, windowsRight, leftMax, rightMax) {
      var leftFreeSpace = computeFreeSpace(windowsLeft);
      var rightFreeSpace = computeFreeSpace(windowsRight);
      if(isNaN(leftFreeSpace[0])) leftFreeSpace[0] = leftMax;
      if(isNaN(leftFreeSpace[1])) leftFreeSpace[1] = rightMax;
      if(isNaN(rightFreeSpace[0])) rightFreeSpace[0] = leftMax;
      if(isNaN(rightFreeSpace[1])) rightFreeSpace[1] = rightMax;
      return [Math.min(leftFreeSpace[0], rightFreeSpace[1]), Math.min(leftFreeSpace[1], rightFreeSpace[0])];
    };
    
    var applyOffset = function(offset, arrayOfWindows, leftMax, rightMax) {
      if(!offset || !arrayOfWindows) return;
      for(var a in arrayOfWindows) {
        if(offset==0) return;
        var win = arrayOfWindows[a];
        var width = win.node.width();
        var diff = (offset<0) ? Math.max(altIfNaN(win.minWidth-width, leftMax), offset) : Math.min(altIfNaN(win.maxWidth-width, rightMax), offset);
        offset -= diff;
        win.node.width(width+diff);
      }
    };
    
    var updateHandle = function(clientX) {
      if(windowHandle) {
        var handlePosX = windowHandle.position().left+HALF_SIZE_HANDLE;
        var offset = !clientX ? 0 : clientX - handlePosX;
        
        var leftMax = handlePosX;
        var rightMax = g_windowsContainerNode.width()-handlePosX;
        
        var handleNumber = g_handlers.index(windowHandle);
        var windowsLeft = g_windows.slice(0, handleNumber+1).reverse();
        var windowsRight = g_windows.slice(handleNumber+1);
        var freeSpace = computeHandleFreeSpace(windowsLeft, windowsRight, leftMax, rightMax);
        
        offset = (offset<0) ? Math.max(-freeSpace[0], offset) : Math.min(freeSpace[1], offset);
        if(offset) {
          applyOffset(offset, windowsLeft, leftMax, rightMax);
          applyOffset(-offset, windowsRight, leftMax, rightMax);
          for(var w in g_windows)
            g_windows[w].node.trigger('resize');
        }
        propageResize();
      }
    };
    
    return {
      init: function() {
        
        
        initWindows([
          {id: 'contactList', minWidth: 250, maxWidth: 500},
          {id: 'vagueList', minWidth: 200, maxWidth: 500},
          {id: 'vague', minWidth: 250}
        ]);
        
        g_handlers = $('.window-handle');
        g_windowsContainerNode = $('#windows');
        
        handles_total_width = g_handlers.size()*g_handlers.width();
        propageResize();
        
        
        g_handlers.mousedown(function(){
          windowHandle = $(this);
        });
        $(window).mouseup(function(e){
          updateHandle(e.clientX);
          windowHandle = null;
        });
        $(window).mousemove(function(e){
          updateHandle(e.clientX);
        });
        $(window).resize(function(){
          propageResize();
        });
        
        
        var windowsLoaded = 0;
        for(var w in g_windows) {
          var win = g_windows[w];
          $(document).bind('window.'+win.id+'.ready', function() {
            if(windowsLoaded>=g_windows.length) return; // all windows are already loaded
            windowsLoaded ++;
            if(windowsLoaded>=g_windows.length)
              gui.StatusBar.hide();
            propageResize();
          });
        }
        
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
