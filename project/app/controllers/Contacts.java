package controllers;

import java.io.File;

import play.Play;
import play.data.validation.MaxSize;
import play.data.validation.MinSize;
import play.data.validation.Required;
import play.data.validation.Validation;
import util.Avatar;
import models.User;
import models.contacts.Contact;
import models.contacts.ContactsGroup;
import models.contacts.ImStatus;
import models.contacts.json.ContactJson;
import models.json.PublicUserInfoJson;
import controllers.base.Application;
import exceptions.contacts.GroupNotEmpty;

/**
 * Controller for ContactList actions.
 * @author gren
 */
public class Contacts extends Application {

    public static void getAllContacts() {
        notFoundIfNotJSON();
        renderJSON(getConnectedUser().contacts.toJson());
    }
    
    public static void getContact(@Required String userid) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User contactUser = User.findByUserid(userid);
        if (contactUser == null)
            error("userNotFound");
        
        renderJSON(contactUser.toJson());
    }
    
    public static void searchContact(@Required String contact) {
        notFoundIfNotJSON();
        if(Validation.hasErrors()) {
            response.status = 400;
            renderJSON( Validation.errors() );
        }
        
        User contactUser = User.findByLogin(contact);
        if (contactUser == null)
            error("userNotFound");
        
        User currentUser = getConnectedUser();
        if( currentUser.equals(contactUser) )
            error("inviteYourselfForbidden");
        
        Contact existingContact = currentUser.contacts.findContact(contactUser);
        if(existingContact!=null) {
            if(existingContact.status==Contact.SyncStatus.REQUESTED) {
                existingContact.accept();
                existingContact.save();
                renderJSON(existingContact.toJson());
            }
            else
                error("contactExists");
        }
        
        renderJSON(contactUser.toJson());
    }
    
    public static void addContact (@Required String userid, @MinSize(3) @MaxSize(20) String groupname) {
        notFoundIfNotJSON();
        if(Validation.hasErrors()) {
            response.status = 400;
            renderJSON( Validation.errors() );
        }
        
        User contactUser = User.findByUserid(userid);
        if (contactUser == null)
            error("userNotFound");

        User currentUser = getConnectedUser();
        
        Contact existingContact = currentUser.contacts.findContact(contactUser);
        if(existingContact!=null) {
            if(existingContact.status==Contact.SyncStatus.REQUESTED) {
                existingContact.accept();
                existingContact.save();
                renderJSON(existingContact.toJson());
            }
            else
                error("contactExists");
        }
        
        if( currentUser.equals(contactUser) )
            error("inviteYourselfForbidden");
        
        // Get the contact group
        ContactsGroup group = null;
        if(groupname==null)
            group = currentUser.contacts.getDefaultGroup();
        else {
            group = currentUser.contacts.findGroupByName(groupname);
            if(group==null)
                group = currentUser.contacts.addGroup(new ContactsGroup(groupname));
        }
        
        // Put the contact in the group and render him
        Contact c = group.addContact(new Contact(contactUser, Contact.SyncStatus.INVITED));
        c.sync(Contact.SyncStatus.REQUESTED);
        // Notify the contactUser
        contactUser.sendComet("contacts.changes");
   		
        renderJSON(c.toJson());
    }
    
    public static void removeContact(@Required String userid) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User contactUser = User.findByUserid(userid);
        if (contactUser == null)
            error("userNotFound");
        
        User currentUser = getConnectedUser();
        Contact contact = currentUser.contacts.findContact(contactUser);
        if (contact==null)
            error("contactNotFound");
        ContactJson contactJson = contact.toJson();
        ContactsGroup group = contact.group;
        contact.sync(Contact.SyncStatus.DELETED); // TODO : we must improve something here : if the contact haven't validate the invitation, we can remove the self contact. 
        group.removeContact(contact);
        // Notify
        contactUser.sendComet("contacts.changes");
        renderJSON(contactJson);
    }
    
    public static void moveContact (@Required String userid, @MinSize(3) @MaxSize(20) String groupname) {
        notFoundIfNotJSON();
        if(Validation.hasErrors() || (groupname!=null && groupname.equals("")) )
            forbidden();
        
        User contactUser = User.findByUserid(userid);
        if (contactUser == null) 
            error("userNotFound");
        
        User currentUser = getConnectedUser();
        
        ContactsGroup group = currentUser.contacts.findGroupByName(groupname);
        if(group==null)
            group = currentUser.contacts.addGroup(new ContactsGroup(groupname));
        
        Contact contact = currentUser.contacts.findContact(contactUser);
        contact = currentUser.contacts.moveContact(contact, contact.group, group);
        renderJSON(contact.toJson());
    }
    
    public static void acceptContactInvitation (@Required String userid) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User contactUser = User.findByUserid(userid);
        if (contactUser == null) 
            error("userNotFound");
        
        User currentUser = getConnectedUser();
        Contact contact = currentUser.contacts.findContact(contactUser);
        if (contact==null)
            error("contactNotFound");
        if( !contact.status.equals(Contact.SyncStatus.REQUESTED) )
            error("NoRequestFromThisContact");
        
        contact = contact.accept();
        contact.save();
        contactUser.sendComet("contacts.changes");
        renderJSON(contact.toJson());
    }
    
    public static void refuseContactInvitation (@Required String userid) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User contactUser = User.findByUserid(userid);
        if (contactUser == null) 
            error("userNotFound");
        
        User currentUser = getConnectedUser();
        Contact contact = currentUser.contacts.findContact(contactUser);
        if (contact==null)
            error("contactNotFound");
        if( !contact.status.equals(Contact.SyncStatus.REQUESTED) )
            error("noRequestFromThisContact");
        
        ContactJson contactJson = contact.toJson();
        contact.refuse();
        contactUser.sendComet("contacts.changes");
        renderJSON(contactJson);
    }
    
    // Groups
    public static void getGroup(@Required Long groupid) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User currentUser = getConnectedUser();
        ContactsGroup group = currentUser.contacts.findGroupById(groupid);
        if( group==null )
            error("groupNotFound");
        
        renderJSON(group.toJson());
    }
    
    public static void addGroup(@Required @MinSize(3) @MaxSize(20) String groupname) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User currentUser = getConnectedUser();
        if( currentUser.contacts.findGroupByName(groupname)!=null )
            error("groupExists");
        
        ContactsGroup group = currentUser.contacts.addGroup(new ContactsGroup(groupname));
        renderJSON(group.toJson());
    }
    
    public static void removeGroup(@Required Long groupid) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User currentUser = getConnectedUser();
        ContactsGroup group = currentUser.contacts.findGroupById(groupid);
        if(group==null)
            error("groupNotFound");
        
        try {
            currentUser.contacts.removeGroup(group);
        }
        catch (GroupNotEmpty e) {
            error("GroupNotEmpty");
        }
        
        renderJSON(group.toJson());
    }
    
    public static void renameGroup (@Required Long groupid, @Required @MinSize(3) @MaxSize(20) String newgroupname) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        User currentUser = getConnectedUser();
        ContactsGroup group = currentUser.contacts.findGroupById(groupid);
        if(group==null)
            error("groupNotFound");
        
        if( currentUser.contacts.findGroupByName(newgroupname)!=null )
            error("groupNameExists");
        
        group = group.rename(newgroupname);
        currentUser.contacts.save();
        
        renderJSON(group.toJson());
    }
    
    // IM style personal actions
    public static void changeStatus (@Required String status) {
        notFoundIfNotJSON();
        if(Validation.hasErrors())
            forbidden();
        
        ImStatus newStatus = ImStatus.valueOf(status);
        if( newStatus==null || newStatus.equals(ImStatus.INACTIVE) || newStatus.equals(ImStatus.OFFLINE) )
            notFound();
        
        User currentUser = getConnectedUser();
        currentUser.changeStatus(newStatus);
        
        renderJSON(currentUser.toJson());
    }
    
    /**
     * Retrieve anyone's avatar
     * @param userid : userid of the person to retrieve.
     * @param size
     */
    public static void getAvatar(@Required String userid, @Required String size) {
        if(Validation.hasErrors()) {
            response.status = 400;
            renderJSON( Validation.errors() );
        }
        
        User user = User.findByUserid(userid);
        if(user==null || !Avatar.isAuthorizedSize(size))
            notFound();
        
        User me = getConnectedUser();
        if(!me.equals(user) && !me.isFriend(user)) // not me and not my friend
            unauthorized("notFriend");
        
        File defaultAvatar = Play.getFile("/public/images/avatar/"+size+".png");
        File avatar;
        if (user.avatar) {
            avatar = (new Avatar(user.getUserPath())).getFile(size);
            if(!avatar.exists()) {
                avatar = defaultAvatar;
                user.setAvatar(false);
            }
        }
        else
            avatar = defaultAvatar;
        
        if(avatar.exists())
            renderBinary(avatar);
        notFound("invalidFile");
    }
    
    public static void getOutOfListUser(@Required String user) {
        notFoundIfNotJSON();
        if(Validation.hasErrors()) {
            response.status = 400;
            renderJSON( Validation.errors() );
        }
        
        User userObj = User.findByLogin(user);
        if (userObj == null)
            error("userNotFound");
        
        User currentUser = getConnectedUser();

        if(currentUser.contacts.findContact(userObj)!=null)
            error("contactExists");
        
        if( currentUser.equals(userObj) )
            error("inviteYourselfForbidden");
        
        renderJSON(new PublicUserInfoJson(userObj));
    }
    
}
