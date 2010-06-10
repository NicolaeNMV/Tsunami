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
      
      textarea.keyup(function(e) {
        if (textarea.data('sync.before') == undefined) return;
        var text1 = textarea.data('sync.before');
        var text2 = textarea.val();
        textarea.data('sync.before',text2);
        
        var diff = dmp.diff_main(text1, text2);
        dmp.diff_cleanupEfficiency(diff);
		var patch_list = dmp.patch_make(text1, text2, diff);
		patch_text = dmp.patch_toText(patch_list);
		//      conf.vagueletteId
		//console.log(patch_text);
        var vaguelette = textarea.data('object');
        return;
        $.post("/vaguelettes/"+ vaguelette.id +"/sync", 
            { vagueletteId: vaguelette.id, patch: patch_text,
              windowsession: tsunami.export.loadedat }
        );
      });
    }
    
    var patchArrive = function(obj) {
        /*
        var patches = dmp.patch_fromText(patch_text);
var results = dmp.patch_apply(patches, text1);
//document.getElementById('text2b').value = results[0];

  results = results[1];
  var html = '';
  for (var x = 0; x < results.length; x++) {
    if (results[x]) {
      html += '<LI><FONT COLOR="#009900">Ok</' + 'FONT>';
    } else {
      html += '<LI><FONT COLOR="#990000">Fail</' + 'FONT>';
    }
  }
        */
    }
    
    //vaguelette_1
    remoteBind('vaguelette.patch',patchArrive);
}());