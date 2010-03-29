package models.vagues;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import com.google.gson.annotations.Expose;

import models.User;
import play.db.jpa.Model;

@Entity
public class VagueParticipant extends Model {
    
    public String userid;
    
    @ManyToOne
    public Vaguelette vaguelette;
    
    public VagueParticipant(User user) {
        this.userid = user.userid;
    }
}