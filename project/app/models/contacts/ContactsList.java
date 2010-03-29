package models.contacts;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.OneToMany;

import exceptions.contacts.GroupNotEmpty;

import play.db.jpa.Model;

import models.User;
import models.contacts.json.ContactsListJson;

@SuppressWarnings("serial")
@Entity
public class ContactsList extends Model {
    @OneToMany
    public List<ContactsGroup> groups;
    
    public ContactsList() {
        this.groups = new ArrayList<ContactsGroup>();
    }
    
    /**
     * return the default group (create if it not exists).
     * @return the default group
     */
    public ContactsGroup getDefaultGroup() {
        ContactsGroup group = findGroupByName(ContactsGroup.defaultGroupName); 
        if(group==null)
            group = addGroup(new ContactsGroup(ContactsGroup.defaultGroupName));
        return group;
    }
    
    public ContactsGroup findGroupById(Long id) {
        for(ContactsGroup group : groups)
            if(group.id.equals(id))
                return group;
        return null;
    }
    
    public ContactsGroup findGroupByName(String name) {
        for(ContactsGroup group : groups)
            if(group.name.equals(name))
                return group;
        return null;
    }
    
    /**
     * Add a group without verify if groupname already exists.
     * @param group
     * @return the added group.
     */
    public ContactsGroup addGroup(ContactsGroup group) {
        group.save();
        groups.add(group);
        save();
        return group;
    }
    
    /**
     * Remove the group from the ContactsList if it is empty
     * @param emptyGroup : an empty group
     * @throws GroupNotEmpty 
     * @return true if the group was present.
     */
    public boolean removeGroup(ContactsGroup emptyGroup) throws GroupNotEmpty {
        if( !emptyGroup.contacts.isEmpty() )
            throw new GroupNotEmpty();
        if( groups.remove(emptyGroup) ) {
            save();
            emptyGroup.delete();
            return true;
        }
        return false;
    }
    
    /**
     * Move 'contact' from the group 'from', to the group 'to'
     * @param contact
     * @param from
     * @param to
     * @return the contact moved.
     */
    public Contact moveContact(Contact contact, ContactsGroup from, ContactsGroup to) {
        if( from.contacts.remove(contact) )
            from.save();
        to.addContact(contact);
        return contact;
    }
    
    /**
     * find an user contact in all groups 
     * @param user
     * @return the Contact relative to user if found, null else
     */
    public Contact findContact(User user) {
        for(ContactsGroup group : groups) {
            Contact contact = group.findContact(user);
            if(contact!=null)
                return contact;
        }
        return null;
    }
    
    
    public ContactsListJson toJson() {
        return new ContactsListJson(this);
    }
    
}
