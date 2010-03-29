package models.vagues.json;

import java.util.ArrayList;
import java.util.List;

import models.vagues.VagueParticipant;
import models.vagues.Vaguelette;


public class VagueletteJson {
    
    public Long id;
  
    public String body;
    public List<VagueParticipantJson> participants;
    
    public Long creationDate;
    public Long lastActivityDate;
    
    public Long parentId;
    
    public VagueletteJson(Vaguelette v) {
        id = v.id;
        parentId = v.parentId==null ? 0 : v.parentId;
        body = v.body;
        participants = new ArrayList<VagueParticipantJson>();
        for(VagueParticipant vp : v.participants)
            participants.add(new VagueParticipantJson(vp));
        creationDate = v.creationDate.getMillis();
        lastActivityDate = v.lastActivityDate.getMillis();
    }
    
}