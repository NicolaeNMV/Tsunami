tsunami.tools.namespace('tsunami.vagues_sync');
(function() {
    var dmp = (function() {
    	var dmp = new diff_match_patch();
    	dmp.Diff_Timeout = 1;
		dmp.Diff_EditCost = 4;
		return dmp;
    }());
    
    /*
    bindTextarea
    conf: {
        textarea: textaread to bind
        vagueletteId: the id of the vaguelette
    }
    */
    
    tsunami.vagues_sync.bindTextarea = function(conf) {
      textarea = conf.textarea;
      textarea.data('before',textarea.val());
      
      textarea.keyup(function(e) {
        if (textarea.data('before') == undefined) return;
        var text1 = textarea.data('before');
        var text2 = textarea.val();
        textarea.data('before',text2);
        
        var diff = dmp.diff_main(text1, text2);
        dmp.diff_cleanupEfficiency(diff);
		var patch_list = dmp.patch_make(text1, text2, diff);
		patch_text = dmp.patch_toText(patch_list);
		//      conf.vagueletteId
		//console.log(patch_text);
        $.post("/chat/send", { userid: extractUserId(id), msg: msg } );
      });
    }
}());