package models.vagues;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.*;
import models.vagues.json.*;

import models.ActivityDate;


@Entity
public class Vaguelette extends ActivityDate {
    
    /** text of the ondelette **/
    /** @Lob annotation to tell JPA to use a large text database type to **/
    @Lob
    public String body;
    
    @OneToMany(mappedBy="vaguelette", cascade=CascadeType.ALL)
    public List<VagueParticipant> participants;
    
    @ManyToOne
    public Vague vague;
    
    public Long parentId;
    
    public Vaguelette(String body, Vague vague) {
      participants = new ArrayList<VagueParticipant>();
      this.vague = vague;
      this.body = body;
      initActivity();
    }
    
    public Vaguelette addParticipant(VagueParticipant vp) {
        vp.vaguelette = this;
        vp.save();
        participants.add(vp);
        save();
        return this;
    }
    
    public Vaguelette setBody(String body) {
        this.body = body;
        if(vague!=null)
            vague.updatePreview().updateActivity();
        else
            play.Logger.debug("vague is null");
        updateActivity(); // will save too
        return this;
    }
    
    public static List<Vaguelette> findByUserid(String userid) {
        return find("select distinct v.vaguelette from VagueParticipant v where v.userid = ?", userid).fetch();
    }
    
    public boolean containsUser(String userid) {
        for(VagueParticipant vp : participants)
            if(vp.userid.equals(userid))
                return true;
        return false;
    }
    
    public VagueletteJson toJson() {
      return new VagueletteJson(this);
    }
}