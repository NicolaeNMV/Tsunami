package models.vagues.json;

import models.vagues.VagueParticipant;


public class VagueParticipantJson {
    
    public String userid;
    
    public VagueParticipantJson(VagueParticipant vp) {
        userid = vp.userid;
    }
}