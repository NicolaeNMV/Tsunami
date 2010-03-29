package models;


import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import play.db.jpa.Model;

@SuppressWarnings("serial")
@MappedSuperclass
public class ActivityDate extends Model {

    @Type(type = "org.joda.time.contrib.hibernate.PersistentDateTime")
    public DateTime creationDate;

    @Type(type = "org.joda.time.contrib.hibernate.PersistentDateTime")
    public DateTime lastActivityDate;
    
    public void initActivity() {
        lastActivityDate = creationDate = new DateTime();
        save();
    }
    
    public void updateActivity() {
        lastActivityDate = new DateTime();
        save();
    }
}
