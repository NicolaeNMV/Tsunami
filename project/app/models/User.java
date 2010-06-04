package models;

import java.io.File;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.OneToOne;

import org.joda.time.DateTime;

import play.Play;
import play.data.validation.Validation;
import play.db.jpa.JPASupport;
import play.libs.Codec;
import play.mvc.Scope.Session;

import models.contacts.Contact;
import models.contacts.ContactsList;
import models.contacts.ImStatus;
import models.json.UserJson;

import controllers.base.Application;

@SuppressWarnings("serial")
@Entity
public class User extends ActivityDate {

    public String userid;

    // required
    public String username;
    public String password;

    // supplements
    public String email;
    public String firstName;
    public String lastName;
    
    // Contacts List
    @OneToOne
    public ContactsList contacts;
    
    @Enumerated(EnumType.STRING)
    public ImStatus imStatus; // The real imStatus computed with timeout (logout timeout, ...)
    
    @Enumerated(EnumType.STRING)
    public ImStatus selectedStatus; // The imStatus selected by the user

    public String submessage;

    public boolean avatar;
    
    public User(String login, String password) {
        this.username = login;
        this.password = password;
        this.userid = Codec.UUID();
        this.imStatus = ImStatus.OFFLINE;
        while(findByUserid(this.userid)!=null)
            this.userid = Codec.UUID();
        this.contacts = new ContactsList();
        contacts.save();
        avatar = false;
        initActivity();
    }
    
    public void setAvatar(boolean exists) {
        if(exists!=avatar) {
            avatar=exists;
            save();
        }
    }
    
    public void setSubmessage(String str) {
        submessage = str;
        save();
    }
    
    public File getUserPath() {
        File f = Play.getFile("/data/"+userid+"/");
        if(!f.exists())
            f.mkdirs();
        return f;
    }
    
    public void changeStatus (ImStatus status) {
        imStatus = status;
        if(!imStatus.equals(ImStatus.OFFLINE) && !imStatus.equals(ImStatus.INACTIVE))
            selectedStatus=status;
        save();
    }
    
    /**
     * Update the last activity and set the default user status (the last selected status) if current status is offline
     */
    @Override
    public void updateActivity() {
        super.updateActivity();
        if( imStatus.equals(ImStatus.OFFLINE) ) {
            if(selectedStatus==null)
                selectedStatus = ImStatus.AVAILABLE;
            imStatus = selectedStatus;
            save();
        }
    }
    
    private static final Long LogOutTimeOut = 300000L;
    private static final Long InactiveTimeOut = 120000L;
    
    /**
     * Refresh the user status with lastActivityDate and timeout.
     * @return the ImStatus.
     * TODO : replace the current logout by timeout by the comet logout  
     */
    public ImStatus updateStatusTimeOut() {
        if(imStatus.equals(ImStatus.OFFLINE))
            return ImStatus.OFFLINE; // We can't decrease the ImStatus under OFFLINE
        
        Long msDiff = (new DateTime()).getMillis() - lastActivityDate.getMillis();
        if(msDiff>LogOutTimeOut)
            imStatus = ImStatus.OFFLINE;
        else if(msDiff>InactiveTimeOut && !imStatus.equals(ImStatus.INACTIVE) )
            imStatus = ImStatus.INACTIVE;
        else 
            return imStatus; // Nothing has changed
        save();
        return imStatus;
    }
    
    /**
     * Delete an user is forbidden for the moment
     */
    @Override
    public <T extends JPASupport> T delete() {
        return null;
    }
    
    public boolean equals(User other) {
        return userid.equals(other.userid);
    }
    
    public static boolean isValidUsername (String username) {
        return username.matches("^[a-zA-Z0-9]{4,32}$");
    }
    
    public static boolean isEmail (String username) {
        return Validation.email("username", username).ok;
    }

    public static User findByUserid(String userid) {
        return find("userid = ?", userid).first();
    }

    public static User findByUsername(String username) {
        return find("username = ?", username).first();
    }

    public static User findByEmail(String email) {
        return find("email = ?", email).first();
    }
    
    /**
     * @param login : email or username of the user
     */
    public static User findByLogin(String login) {
        if( isValidUsername(login) )
            return findByUsername(login);
        else if( isEmail(login) )
            return findByEmail(login);
        return null;
    }
    
    public static User getConnected() {
        return findByUserid( Session.current().get("uid") );
    }
    
    /**
     * check if two users are confirmed in their contact list
     * @return
     * @deprecated (not object oriented)
     * @see userA.isFriend(userB)
     */
    public static boolean areFriend(User userA, User userB) {
        return userA.isFriend(userB); // TODO
    }
    
    /**
     * Check if the specified user is a friend <em>(confirmed in contact list)</em>
     * @param user
     * @return true if the specified user is a friend.
     */
    public boolean isFriend(User user) {
        Contact c = contacts.findContact(user);
        if(c==null) return false;
        return c.isAccepted();
    }

    /**
     * TODO : si les intéractions sont assez complexes avec comet, 
     *        ajouter des méthodes dans CometHelper.
     * @return true if user is comet connected
     */
    public boolean isConnected() {
        return true;
    }
    
    
    public UserJson toJson() {
        return new UserJson(this);
    }
    
    public boolean sendComet(String event, Object data) {
    	return Application.sendComet(this,event,data);
    }
    
    public boolean sendComet(String event) {
    	return Application.sendComet(this,event,true);
    }
    
    // Send an event to all contacts of the user
    public void sendCometAllContacts(String event,Object data) {
    	for (Contact c : contacts.list()) {
    		Application.sendComet(c.user,event,data);
    	}
    }
}
