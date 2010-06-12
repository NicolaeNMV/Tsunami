package models.vagues;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.*;
import models.vagues.json.*;

import models.ActivityDate;

import util.diff_match_patch;


@Entity
public class Vaguelette extends ActivityDate {
    
    /** text of the ondelette **/
    /** @Lob annotation to tell JPA to use a large text database type to **/
    @Lob
    public String body;
    
    @ManyToOne
    public Vague vague;
    
    public Long parentId;
    
    public int version;
    
    @OneToMany(mappedBy="vaguelette", cascade=CascadeType.ALL)
    public List<VagueletteHistory> histories;
    
    public Vaguelette(String body, Vague vague) {
      histories = new ArrayList<VagueletteHistory>();
      this.vague = vague;
      this.body = body;
      this.version = 0;
      initActivity();
    }
    
    public List<VagueParticipant> getParticipants() {
        return vague.participants;
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
        return vague.containsUser(userid);
    }
    
    public VagueletteJson toJson() {
      return new VagueletteJson(this);
    }
    
    public Vaguelette addHistory(String patch, int version) {
        VagueletteHistory vh = new VagueletteHistory(patch, version);
        vh.vaguelette = this;
        vh.save();
        histories.add(vh);
        save();
        return this;
    }
    
    public Vaguelette patch(String patch) {
        return this;
    }
}