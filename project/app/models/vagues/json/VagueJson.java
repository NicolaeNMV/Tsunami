package models.vagues.json;

import java.util.ArrayList;
import java.util.List;
import models.vagues.*;


public class VagueJson {
  
    public Long id;
    public String subject;
    public String preview;
    
    public List<VagueletteJson> vaguelettes;
    public List<VagueParticipantJson> participants;

    public Long creationDate;
    public Long lastActivityDate;
    
    public boolean bold; // if unseen last modification, then bold
    
    public VagueJson(Vague v) {
        id = v.id;
        subject = v.subject;
        preview = v.preview;
        vaguelettes = new ArrayList<VagueletteJson>();
        for(Vaguelette va : v.vaguelettes)
            vaguelettes.add(new VagueletteJson(va));
        participants = new ArrayList<VagueParticipantJson>();
        for(VagueParticipant vp : v.participants)
            participants.add(new VagueParticipantJson(vp));
        creationDate = v.creationDate.getMillis();
        lastActivityDate = v.lastActivityDate.getMillis();
        
        bold = false;
    }
    
    public VagueJson(Vague v, String userid) {
        this(v);
        updateBold(v,userid);
    }
    
    public void updateBold(Vague v,String userid) {
        Object participant = v.getParticipant(userid);
        if (participant instanceof VagueParticipant) {
            bold = ((VagueParticipant)participant).lastSeenDate.isBefore( v.lastActivityDate );
        }
    }
}
