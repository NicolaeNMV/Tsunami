tsunami.tools.namespace('tsunami.vagues.sync');
(function() {
    var sync = tsunami.vagues.sync;
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
    
    sync.bindTextarea = function(textarea) {
      textarea.data('sync.before',textarea.val());
      var keyup = function(e) {
        if (textarea.data('sync.before') == undefined) return;
        var text1 = textarea.data('sync.before');
        var text2 = textarea.val();
        textarea.data('sync.before',text2);
        
        var diff = dmp.diff_main(text1, text2);
        dmp.diff_cleanupEfficiency(diff);
		var patch_list = dmp.patch_make(text1, text2, diff);
		patch_text = dmp.patch_toText(patch_list);
		//      conf.vagueletteId
        var vaguelette = textarea.data('object');
        $.post("/vaguelettes/"+ vaguelette.id +"/sync", 
            { vagueletteId: vaguelette.id, patch: patch_text, userWindowId: tsunami.export.loadedat }
        );
      };
      new tsunami.tools.RealTimeUpdate({
          node: textarea,
          update: keyup,
          minInterval: 100,
          maxInterval: 300
        });
     
    }
    
    var patchArrive = function(e,data) {
        var exp = tsunami.export;
        if (data.code != "200") return;
        // Check if this is my patch
        if (data.userId == exp.currentUser.userid && data.senderWindowId == exp.loadedat) return;
        var textarea = $('#vaguelette_'+data.vagueletteId+' textarea[tabindex!=-1]:first');
        
        var patches = dmp.patch_fromText(data.patch);
        
        var results = dmp.patch_apply(patches, textarea.val());
        
        textarea.val(results[0]);
    }
    
    //vaguelette_1
    remoteBind('vaguelette.patch',patchArrive);
}());