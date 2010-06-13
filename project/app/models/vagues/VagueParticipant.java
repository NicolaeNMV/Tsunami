package models.vagues;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import com.google.gson.annotations.Expose;

import models.*;
import play.db.jpa.Model;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;


@Entity
public class VagueParticipant extends Model {
    
    public User user;
    
    @ManyToOne
    public Vague vague;
    
    @Type(type = "org.joda.time.contrib.hibernate.PersistentDateTime")
    public DateTime lastSeenDate;
    
    public BoxStatus status;
    
    public enum BoxStatus {
      INBOX, ARCHIVE, TRASH;
    }
    
    public VagueParticipant(User user) {
        this.user = user;
        this.lastSeenDate = new DateTime();
        this.status = BoxStatus.INBOX;
    }
    
    public VagueParticipant assignToVague(Vague v) {
        vague = v;
        // version = v.version;
        return this;
    }
    
    public VagueParticipant setStatus(BoxStatus s) {
    	status = s;
    	return this;
    }
    
    public void updateSeen() {
        lastSeenDate = new DateTime();
        save();
    }
}