package models.vagues;

import javax.persistence.*;

import org.joda.time.DateTime;

import java.util.*;

import play.db.helper.SqlQuery;
import play.db.jpa.Model;

import models.ActivityDate;
import models.User;

import controllers.base.Application;

@Entity
public class Vague extends ActivityDate {
    /** The subject of the vague
     *  But normally this is generated from the messages of the vague.
     *  So this could be deleted.  
    **/
    
    public String subject;
    public String preview; // preview of the first vaguelette
    
    @OneToMany(mappedBy="vague", cascade=CascadeType.ALL)
    public List<Vaguelette> vaguelettes;
    
    @OneToMany(mappedBy="vague", cascade=CascadeType.ALL)
    public List<VagueParticipant> participants;
    
    public Vague(String subject) {
        participants = new ArrayList<VagueParticipant>();
        initActivity();
        this.subject = subject;
        this.vaguelettes = new ArrayList<Vaguelette>();
        updatePreview();
    }
    
    public Vague addParticipant(VagueParticipant vp) {
        vp.vague = this;
        vp.save();
        participants.add(vp);
        save();
        return this;
    }

    public Vague updatePreview() {
        String body = (vaguelettes==null||vaguelettes.isEmpty()) ? "" : vaguelettes.get(0).body;
        int i = body.indexOf("\n");
        if(i==-1) {
          subject = body;
          preview = "";
        }
        else {
          subject = body.substring(0,i);
          preview = body.substring(i, body.length());
        }
        return this;
    }
    
    public Vague addVaguelette(Vaguelette o, User addedBy) {
        o.vague = this;
        o.initHistory(addedBy);
        o.save();
        updatePreview();
        updateActivity(); // will save too ( FIXME: not save() ) 
        // save();
        return this;
    }
    
    public Vague setSubject(String subject) {
        this.subject = subject;
        updateActivity();
        return this;
    }
    
    public Object getParticipant(String userid) {
        for(VagueParticipant vp : participants)
            if(vp.user.userid.equals(userid))
                return vp;
        return new Object();
    }

    public boolean containsUser(String userid) {
        return this.getParticipant(userid) instanceof VagueParticipant;
    }
    
    public boolean containsUser(User user) {
    	return containsUser(user.userid);
    }
    
    public void updateParticipantSeen(String userid) {
        Object participant = getParticipant(userid);
        if (participant instanceof VagueParticipant) {
            ((VagueParticipant)participant).updateSeen();
        }
    }
    
    public List<Vaguelette> getVaguelettes(String userid) {
        List<Vaguelette> filteredVaguelettes = new ArrayList<Vaguelette>();
        for(Vaguelette v : vaguelettes)
            if(v.containsUser(userid))
                filteredVaguelettes.add(v);
        return filteredVaguelettes;
    }

    public static List<Vague> findByUserid(String userid, String search) {
        Set<Long> vagueIds = new HashSet<Long>();
        List<Vague> all = findAll();
        for(Vague v : all)
            if(v.containsUser(userid))
                vagueIds.add(v.id);
        if(vagueIds.size()==0)
            return new ArrayList<Vague>();
        if(search!=null && search.length()>0)
            return find("id IN "+SqlQuery.inlineParam(vagueIds)+" AND (lower(subject) LIKE ?1 OR lower(preview) LIKE ?1) ORDER BY lastActivityDate DESC", "%"+search.toLowerCase()+"%").fetch();
        return find("id IN "+SqlQuery.inlineParam(vagueIds)+" ORDER BY lastActivityDate DESC").fetch();
    }
    
    // Send an event to all contacts of the user
    public void sendCometAllParticipants(String event,Object data) {
    	for (VagueParticipant vp : participants) {
    		Application.sendComet(vp.user,event,data);
    	}
    }
}
