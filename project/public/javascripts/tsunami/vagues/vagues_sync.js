tsunami.tools.namespace('tsunami.vagues_sync');

(function() {
    var sync = tsunami.vagues_sync;
    var tools = tsunami.tools;
    var vtools = tsunami.vagues.tools;
    /** 
    onVagueNewParticipant
    If data.userId is our Id, this mean we got acces to a new vague.
    If participant is added to an opened vague, we need to participants list.
    */
    var onVagueNewParticipant = function(e,data) {
    	// Acces to a new vague
    	if (tools.isMyUserId(data.userId)) {
    		tsunami.vagues.List.reloadVagues();
    		return;
    	}
    	// New participant in the opened vague
    	if (vtools.getOpenedVagueId() == data.vagueId) {
    		// tsunami.vague.reloadParticipant()
    	}
    }
    
    remoteBind('vague.newParticipant',onVagueNewParticipant);
    
}());