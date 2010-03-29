package models.vagues;

import javax.persistence.*;

import org.joda.time.DateTime;

import java.util.*;

import play.db.helper.SqlQuery;
import play.db.jpa.Model;

import models.ActivityDate;
import models.User;

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
    
    public Vague(String subject) {
        initActivity();
        this.subject = subject;
        this.vaguelettes = new ArrayList<Vaguelette>();
        updatePreview();
    }
    
    // TODO : will also update the subject (subject is the first vaguelette line)
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
        o.save();
        o.addParticipant(new VagueParticipant(addedBy));
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
    
    public List<Vaguelette> getVaguelettes(String userid) {
        List<Vaguelette> filteredVaguelettes = new ArrayList<Vaguelette>();
        for(Vaguelette v : vaguelettes)
            if(v.containsUser(userid))
                filteredVaguelettes.add(v);
        return filteredVaguelettes;
    }

    public static List<Vague> findByUserid(String userid, String search) {
        Set<Long> vagueIds = new HashSet<Long>();
        for(Vaguelette o : Vaguelette.findByUserid(userid))
            vagueIds.add(o.vague.id);
        if(vagueIds.size()==0)
            return new ArrayList<Vague>();
        if(search!=null && search.length()>0)
            return find("id IN "+SqlQuery.inlineParam(vagueIds)+" AND (subject LIKE ?1 OR preview LIKE ?1) ORDER BY lastActivityDate DESC", "%"+search+"%").fetch();
        return find("id IN "+SqlQuery.inlineParam(vagueIds)+" ORDER BY lastActivityDate DESC").fetch();
    }
    
}
