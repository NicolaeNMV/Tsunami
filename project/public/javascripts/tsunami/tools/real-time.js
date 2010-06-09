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
   *  minTextLength : if text length < minTextLength, considering no text changed except the empty update
   * 
   * @author Gaetan Renaudeau <pro@grenlibre.fr>
   */
  tools.RealTimeUpdate = function(options) {
    var self = this;
    
    self.onInputChange = function() {
      var now = new Date().getTime();
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
          self.lastCall = now;
        }
        else
          setTimeout(self.onInputChange, self.minInterval-(now-self.lastCall)+10);
      }
    };
    
    self.bindEvents = function() {
      $(self.node).keyup(function() {
        self.onInputChange();
      });
    };
    
    self.lastCall = new Date().getTime();
    self.node = options.node;
    self.callback = options.update || function(){};
    self.textChange = options.textChange || function(){};
    
    self.minInterval = options.minInterval || 1000; // min interval between each call to minimize requests
    self.minTextLength = options.minTextLength || 0;
    
    $(self.node).data('inputValue', $(self.node).val());
    self.bindEvents();
  };
  
  
}());
