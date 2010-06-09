package models.vagues.json;

import java.util.ArrayList;
import java.util.List;

import models.vagues.VagueParticipant;
import models.vagues.Vaguelette;


public class VagueletteJson {
    
    public Long id;
  
    public String body;
    
    public Long creationDate;
    public Long lastActivityDate;
    
    public Long parentId;
    
    public VagueletteJson(Vaguelette v) {
        id = v.id;
        parentId = v.parentId==null ? 0 : v.parentId;
        body = v.body;
        creationDate = v.creationDate.getMillis();
        lastActivityDate = v.lastActivityDate.getMillis();
    }
    
}