package models.vagues.json;

import java.util.ArrayList;
import java.util.List;
import models.vagues.*;


public class VagueJson {
  
    public Long id;
    public String subject;
    public String preview;
    
    public List<VagueletteJson> vaguelettes;

    public Long creationDate;
    public Long lastActivityDate;
    
    
    public VagueJson(Vague v) {
        id = v.id;
        subject = v.subject;
        preview = v.preview;
        vaguelettes = new ArrayList<VagueletteJson>();
        for(Vaguelette va : v.vaguelettes)
            vaguelettes.add(new VagueletteJson(va));
        creationDate = v.creationDate.getMillis();
        lastActivityDate = v.lastActivityDate.getMillis();
    }
}
