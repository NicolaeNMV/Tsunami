package models.vagues;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import com.google.gson.annotations.Expose;

import models.*;
import play.db.jpa.Model;

@Entity
public class VagueParticipant extends Model {
    
    public User user;
    
    @ManyToOne
    public Vague vague;
    
    public Long version;
    public BoxStatus status;
    
    public enum BoxStatus {
      INBOX, ARCHIVE, TRASH;
    }
    
    public VagueParticipant(User user) {
        this.user = user;
        this.version = 1L;
        this.status = BoxStatus.INBOX;
    }
    
    public VagueParticipant assignToVague(Vague v) {
        vague = v;
        // version = v.version;
        return this;
    }
}