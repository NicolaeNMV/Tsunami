tsunami.tools.namespace('tsunami.tools');

(function(){

  var vagues = tsunami.vagues;
  var tools = tsunami.tools;
  
  /**
   * Manage input (or textarea) smart callback on change
   * @args options :
   *  node [required] : input or textarea node
   *  update (function): called callback
   *  textChange (function): same as update ignoring the time interval
   *  minInterval : min time interval between each update (ms)
   *  maxInterval : max time interval, used when user write something, and minInterva is ignored
   *  minTextLength : if text length < minTextLength, considering no text changed except the empty update
   * 
   * @author Gaetan Renaudeau <pro@grenlibre.fr>
   */
  tools.RealTimeUpdate = function(options) {
    var self = this;
    self.timer = false;
    
    var getTime = function() {
        return new Date().getTime();
    }
    
    self.onInputChange = function() {
      var now = getTime();
      var newInputValue = $(self.node).val();
      var inputValue = $(self.node).data('inputValue');
      if(/* text has changed */ inputValue!=newInputValue 
      && /* enough letters to update */ (newInputValue.length==0 || newInputValue.length>=self.minTextLength) ) {
        self.textChange(inputValue);
        if(now-self.lastCall>self.minInterval) { /* min interval elapsed */
          /// UPDATE
          inputValue = newInputValue;
          $(self.node).data('inputValue', inputValue);
          self.callback(inputValue);
          self.lastCall = getTime();
          self.timer = false;
        }
        else {
          self.timer = setTimeout(self.onInputChange, self.minInterval-(now-self.lastCall)+10);
        }
      }
    };
    
    self.bindEvents = function() {
        var f = function() {
          if (self.timer === false) {
              self.lastCall = getTime();
              self.timerStarted = getTime();
              self.ignoredKeys = 0;
              self.onInputChange();
          } else {
              if ( /* maxInterval */ (getTime() - self.timerStarted) > self.maxInterval ) {
                clearTimeout(self.timer); // Don't need the timer anymore
                self.timer = false;
                self.lastCall = self.timerStarted; // Force to execute the update code
                self.onInputChange();
              } else {
                  self.lastCall = getTime();
              }
          }
        };
        $(self.node).keyup(f);
    };
    
    self.lastCall = getTime();
    self.node = options.node;
    self.callback = options.update || function(){};
    self.textChange = options.textChange || function(){};
    
    self.minInterval = options.minInterval || 1000; // min interval between each call to minimize requests
    self.maxInterval = options.maxInterval || 1000; // max interval, to allow some updates
    self.minTextLength = options.minTextLength || 0;
    
    if (self.minInterval > self.maxInterval) self.maxInterval = self.minInterval + 100;
    
    $(self.node).data('inputValue', $(self.node).val());
    self.bindEvents();
  };
  
  
}());
