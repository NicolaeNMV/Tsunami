tsunami.tools.namespace('tsunami.vagues.sync');
(function() {
    var sync = tsunami.vagues.sync;
    var tools = tsunami.tools;
    var dmp = (function() {
    	var dmp = new diff_match_patch();
    	dmp.Diff_Timeout = 1;
		dmp.Diff_EditCost = 4;
		return dmp;
    }());
    
    // This will try to have a local copy of the server vagulette
    sync.mirrorServerVagulette = (function() {
        /*var reloadServerCopyVagulette = function(vaguletteTextarea) {
            console.log("Reload");
        }*/
        var patchArrive = function(e,data) {
            var textarea = tools.getVaguletteTextarea(data.vagueletteId);
            if (textarea == false) return;
            
            if (data.version != (textarea.data('object').version + 1) ) {
                //console.log("Not the good version");
                reloadServerCopyVagulette(textarea);
                return;
            }
            
            var serverObject = textarea.data('object');
            
            var patches = dmp.patch_fromText(data.patch);
            serverObject.body = dmp.patch_apply(patches, serverObject.body)[0];
            serverObject.version = data.version;
            
            textarea.data('object', serverObject );
            //console.log("Server history "+serverObject.body);
            $(document).trigger('vaguelette.patchApplied', data);
        }
        
        remoteBind('vaguelette.patch',patchArrive);
    }());
    
    var computePatch = function(text1,text2) {
        var diff = dmp.diff_main(text1, text2);
        dmp.diff_cleanupEfficiency(diff);
		var patch_list = dmp.patch_make(text1, text2, diff);
		return dmp.patch_toText(patch_list);
    }
    
    sync.bindTextarea = function(textarea) {
      textarea.data('sync.before',textarea.val());
      
        sync.syncNowTextarea = function(e,textarea,serverUpdated) {
            if (serverUpdated == true) textarea.data('sync.before',textarea.val());
            if (textarea.data('sync.before') == undefined) return;
            var text1 = textarea.data('sync.before');
            var text2 = textarea.val();
            
            // Nothing to do
            if (text1 == text2) {
                return;
            }
            
            textarea.data('sync.before',text2);
            
            patch_text = computePatch(text1, text2);
    		//      conf.vagueletteId
            var vaguelette = textarea.data('object');
            
            var patchTime = (new Date).getTime();
            textarea.data('sync.history_'+patchTime, text2);
            
            $.post("/vaguelettes/"+ vaguelette.id +"/sync", 
                { vagueletteId: vaguelette.id, patch: patch_text, userWindowId: tsunami.export.loadedat, patchTime: patchTime },
                function(e,data) {
                    if (data.code != "200") {
                        // Patch was not applyed
                    }
                }
            );
          };
      
      new tools.RealTimeUpdate({
          node: textarea,
          update: sync.syncNowTextarea,
          minInterval: 100,
          maxInterval: 300
        });
     
    }
    
    /* syncConflictDetected
     @param textarea, of the vagulette
     @param data, the patch */
    var syncConflictDetected = function(textarea,data) {
        /* Conflict resolution plan
            - Diff current server copy with our copy.
            - Send the patch to the server
            - Reload conflicted vagulette
        */
        
        if (textarea.attr('readonly') == 'readonly') return; // already locked
        // lock the textarea
        textarea.attr('readonly','readonly');
        
        var vagulette = textarea.data('object');
        
        var patch_text = computePatch(textarea.val(),""+vagulette.body);
        //console.log(patch_text);
        $.post("/vaguelettes/"+ vagulette.id +"/sync", 
            { vagueletteId: vaguelette.id, patch: patch_text, userWindowId: tsunami.export.loadedat, patchTime: (new Date).getTime(),
              getVagulette: true },
            function(e,data) {
                //if (data.code != "200") {
                    // Patch was not applyed
                //    return;
                //}
                var vagulette = textarea.data('object');
                vagulette.body = data.body;
                vagulette.version = data.version;
                
                //console.log("resync complete");
                textarea.val(data.body);
                textarea.data('sync.before',data.body);
            }
        );
        
    }
    
    var myPatchArrived = function(data) {
        var textarea = tools.getVaguletteTextarea(data.vagueletteId);
        if (textarea == false) return;
        
        var h = textarea.data('sync.history_'+data.patchTime);
        if (h == null) return;
        // If the historical copy doesnt correspond to our copy, then we need to resync
        /*if (textarea.data('object').body !== h) {
            console.log("Conflict detected");
            console.log("server copy: " + textarea.data('object').body + " != " + h);
            //syncConflictDetected(textarea,data);
        } else {
            console.log("No nonflict, cool");
        }*/
    }
    
    $(document).bind('vaguelette.patchApplied', function(e, data) {
        if (tools.isMyUserId(data.userId) && tools.isMyWindowId(data.senderWindowId)) {
            myPatchArrived(data);
        }
    });
    
    var patchArrive = function(e,data) {
        // Check if this is my patch
        if (tools.isMyUserId(data.userId) && tools.isMyWindowId(data.senderWindowId)) return;
        var textarea = tools.getVaguletteTextarea(data.vagueletteId);
        
        if (textarea == false) return;
        
        sync.syncNowTextarea("",textarea);
        
        var patches = dmp.patch_fromText(data.patch);
        
        var results = dmp.patch_apply(patches, textarea.val());
        
        var new_text = results[0];
        results = results[1];
        /*for (var x = 0; x < results.length; x++) {
           if (!results[x]) {
               console.log("Cannot apply patch");
               //syncConflictDetected(textarea);
               return;
           }
        }*/
        
        textarea.val(new_text);
        sync.syncNowTextarea("",textarea,true);
        textarea.data('inputValue',new_text); // For real-time.js
    }
    
    var onCreateVaguelette = function(e,data) {
        // Look if the vagueltte was not created by us
        if (false == tools.isMyWindowId(data.senderWindowId)) {
            tsunami.vagues.Vague.onCreateVaguelette(data);
        }
    }
    
    var updateParticipants = function(e,data) {
        var textarea = tools.getVaguletteTextarea(data.vagueletteId);
        if (textarea == false) return;
        
        vaguelette = textarea.data('object');
        
        var isNew = true;
        // Check if participant is in the list
        for(var p in vaguelette.participants) {
            var participant = vaguelette.participants[p];
            if (participant.userid == data.userId) {
                vaguelette.participants[p].timestamp = new Date().getTime();
                isNew = false;
            }
        }
        
        var Vague = tsunami.vagues.Vague;
        // New participant that we don't have in our list
        if (isNew) {
            Vague.reloadVagueletteParticipants(data.vagueletteId);
            Vague.reloadVagueParticipants(data.vagueId);
            return;
        }
        Vague.updateVagueletteParticipants(vaguelette.participants, Vague.vagueletteId2node(data.vagueletteId));
    }
    
    remoteBind('vaguelette.patch',patchArrive);
    remoteBind('vaguelette.patch',updateParticipants);
    remoteBind('vaguelette.create',onCreateVaguelette);
}());