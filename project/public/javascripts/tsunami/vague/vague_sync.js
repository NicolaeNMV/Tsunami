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
		//console.log(patch_text);
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
        if (data.userId == exp.currentUser.userid && data.senderWindowId == exp.loadedat) {
            console.log('My update, do nothing');
            return;
        }
        var textarea = $('#vaguelette_'+data.vagueletteId+' textarea[tabindex!=-1]:first');
        //console.log(textarea);
        //console.log('Apply '+data.patch + ' was '+ textarea.val());
        var patches = dmp.patch_fromText(data.patch);
        
        var results = dmp.patch_apply(patches, textarea.val());
        //console.log( ' now ' + results[0]);
        //console.log( ' now ' + results);
        
        textarea.val(results[0]);
        /*answer.put("code","200");
        answer.put("codeText","OK");
        answer.put("version",vaguelette.version);
        answer.put("body",patch);
        answer.put("userId",currentUser.id);
        answer.put("senderWindowId",userWindowId);*/
        //if (obj.code == "200") {
            //obj.body
        //}
    }
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
    
    //vaguelette_1
    remoteBind('vaguelette.patch',patchArrive);
}());