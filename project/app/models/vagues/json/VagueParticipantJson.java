package models.vagues.json;

import models.vagues.VagueParticipant;
import models.vagues.VagueParticipant.*;

public class VagueParticipantJson {
    
    public String userid;
    public String username;
    
    public BoxStatus status;
    
    public VagueParticipantJson(VagueParticipant vp) {
        userid = vp.user.userid;
        username = vp.user.username;
        status = vp.status;
        if(status==null)
          status = BoxStatus.INBOX;
    }
}