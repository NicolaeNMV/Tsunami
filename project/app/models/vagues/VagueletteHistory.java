package models.vagues;

import javax.persistence.*;

import com.google.gson.annotations.Expose;

import play.db.jpa.Model;

@Entity
public class VagueletteHistory extends Model {
    
    @ManyToOne
    public Vaguelette vaguelette;
    
    @Lob
    public String body;
    
    public int version;
    
    public VagueletteHistory(String body, int version) {
        this.body = body;
        this.version = version;
    }
}