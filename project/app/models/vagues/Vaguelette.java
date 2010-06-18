package models.vagues;

import java.util.ArrayList;
import java.util.List;
import java.util.LinkedList;
import javax.persistence.*;

import models.vagues.json.*;

import models.ActivityDate;
import models.User;

import util.diff_match_patch;
import util.diff_match_patch.Patch;



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
    
    public void initHistory(User user) {
        VagueletteHistory vh = new VagueletteHistory("", user, version);
        vh.vaguelette = this;
        vh.save();
    }
    
    public Vaguelette addHistory(String patch, User user) {
        VagueletteHistory vh = new VagueletteHistory(patch, user, version);
        vh.vaguelette = this;
        vh.save();
        histories.add(vh);
        save();
        return this;
    }
    

    public boolean patch(String patch, User user) {
        diff_match_patch dmp = new diff_match_patch();
        
        LinkedList<Patch> patches = new LinkedList<Patch>(dmp.patch_fromText(patch));
        if (patches.isEmpty()) {
            return true;
        }
        
        Object[] results = dmp.patch_apply(patches, this.body);
        boolean[] boolArray = (boolean[]) results[1];
        // Look if all the patches were applied cleanly
        boolean appliedCleanly = true;
        for (boolean bool : boolArray) {
            if (bool == false) {
                appliedCleanly = false;
                break;
            }
        }
        
        // Unable to apply the patch
        if (appliedCleanly == false) return false;
        
        this.setBody(results[0].toString()); // new patched text
        this.version++;
        this.addHistory(patch, user);
        
        this.vague.updateActivity();
        
        return true;
    }
}