package models.vagues;

import java.util.Date;

import javax.persistence.*;

import models.User;

import com.google.gson.annotations.Expose;

import play.db.jpa.Model;

@Entity
public class VagueletteHistory extends Model {
    
    @ManyToOne
    public Vaguelette vaguelette;
    
    @Lob
    public String body;
    
    public int version;
    
    public User user;
    
    public Long timestamp;
    
    public VagueletteHistory(String body, User user, int version) {
        this.body = body;
        this.user = user;
        this.version = version;
        timestamp = new Date().getTime();
    }
}