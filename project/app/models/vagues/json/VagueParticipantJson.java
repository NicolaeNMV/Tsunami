package models.vagues.json;

import models.vagues.VagueParticipant;


public class VagueParticipantJson {
    
    public String userid;
    public String username;
    
    public VagueParticipantJson(VagueParticipant vp) {
        userid = vp.user.userid;
        username = vp.user.username;
    }
}