tsunami.tools.namespace('tsunami.vagues.bold');

(function() {
    var bold = tsunami.vagues.bold;
    var currentOpenedVagueId;
    
    var tpl_loading_icon_node =
        $('<img src="/public/images/loading.gif" class="searchIndicator" style="display: none;"/>');
    
    var onVagueOpen = function(e, vagueId) {
        $('#vague_'+vagueId).removeClass("new");
        currentOpenedVagueId = vagueId;
    }
    
    var onVagueClose = function(e, vagueId) {
        $('#vague_'+vagueId).removeClass("new");
        currentOpenedVagueId = vagueId;
    }
    
    var onVagueClose = function(e, vagueId) {
        currentOpenedVagueId = null;
    }
    
    var onVagueChangePatch = function(e, data) {
        if (currentOpenedVagueId != data.vagueletteId) {
            $('#vague_'+data.vagueId+':not(.new)').addClass("new");
        }
    }
    
    $(document).bind('vague.opened', onVagueOpen);
    $(document).bind('vague.closed', onVagueClose);
    remoteBind('vaguelette.patch',onVagueChangePatch);
    
}());