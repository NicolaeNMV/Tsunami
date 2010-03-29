package models.contacts;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import play.db.jpa.Model;

import models.User;
import models.contacts.json.ContactJson;

@SuppressWarnings("serial")
@Entity
public class Contact extends Model {
    
    public static enum SyncStatus {
        INVITED,    /* the contact is invited by me         */
        REQUESTED,  /* the contact invited me               */
        CONFIRMED,  /* the contact accepted my invitation   */
        REFUSED,    /* the contact refused my invitation    */
        DELETED;    /* the contact deleted me               */
    };

    
    /**  the user relative to the contact */
    @OneToOne
    public User user;
    
    /** The current contact status in the ContactList context */
    public SyncStatus status;
    
    /** The group where the contact is */
    @ManyToOne
    public ContactsGroup group;
    
    /**
     * Create the contact by invitation (I invite him) or by request (He invites me).
     * @param user : the user relative to the contact
     * @param status : the initial sync status (INVITED or REQUESTED)
     */
    public Contact(User user, SyncStatus status) {
        this.user = user;
        this.status = status;
    }
   
    /**
     * Accept the contact invitation.
     */
    public Contact accept() {
        status = SyncStatus.CONFIRMED;
        return sync(SyncStatus.CONFIRMED);
    }
    
    /**
     * Refuse the contact invitation.
     */
    public void refuse() {
        sync(SyncStatus.REFUSED);
        group.removeContact(this);
    }
    
    public boolean isAccepted() {
        return (status==SyncStatus.CONFIRMED);
    }
    
    /**
     * Synchronize this contact with my contact instance into the contactList of this contact. 
     * @param myStatus : my new status into the contactList of this contact.
     * @return The synchronous contact
     */
    public Contact sync(SyncStatus myStatus) {
        User me = User.getConnected();
        Contact myself = user.contacts.findContact( me );
        if(myself==null && !(myStatus.equals(SyncStatus.INVITED)||myStatus.equals(SyncStatus.REQUESTED)) )
            return null;
        if(myself==null)
            myself = user.contacts.getDefaultGroup().addContact( new Contact(me,myStatus) );
        else
            myself.status = myStatus;
        myself.save();
        return this;
    }
    
    public ContactJson toJson() {
        return new ContactJson(this);
    }
}
