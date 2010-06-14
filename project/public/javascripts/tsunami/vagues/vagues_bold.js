tsunami.tools.namespace('tsunami.vagues.bold');

(function() {
    var bold = tsunami.vagues.bold;
    var ajax = tsunami.tools.Router.ajax;
    var vtools = tsunami.vagues.tools;
    
    var tpl_loading_icon_node =
        $('<img src="/public/images/loading.gif" class="searchIndicator" style="display: none;"/>');
    
    var onVagueOpen = function(e, vagueId) {
        $('#vague_'+vagueId).removeClass("new");
    }
    
    var onVagueClose = function(e, vagueId) {
        $('#vague_'+vagueId).removeClass("new");
    }
    
    var onVagueChangePatchTimers = [];
    
    var onVagueChangePatch = function(e, data) {
    	var vagueId = data.vagueId;
        if (vtools.getOpenedVagueId() != vagueId) {
            $('#vague_'+vagueId+':not(.new)').addClass("new");
        }
        /* If the patch is for the current opened vague
        then we should tell the server that we have seen it.
        To avoid flood, send after 10 seconds after receiving last update */
        if (vtools.getOpenedVagueId() != vagueId) return;
        if ((typeof onVagueChangePatchTimers[vagueId]) == "undefined") onVagueChangePatchTimers[vagueId] = null; // Initializing
        
        if (onVagueChangePatchTimers[vagueId] !== null) return; // Timer is already running
        var updateSeenTime = function() {
        	ajax("Vagues.saw", {vagueId: vagueId}, function(data) {
        		onVagueChangePatchTimers[vagueId] = null;
        	});
        }
        onVagueChangePatchTimers[vagueId] = setTimeout(updateSeenTime,5000);
    }
    
    $(document).bind('vague.opened', onVagueOpen);
    $(document).bind('vague.closed', onVagueClose);
    remoteBind('vaguelette.patch',onVagueChangePatch);
}());