package models.contacts;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.OneToMany;

import play.db.jpa.Model;

import models.User;
import models.contacts.json.ContactsGroupJson;


@SuppressWarnings("serial")
@Entity
public class ContactsGroup extends Model {
    public static final String defaultGroupName = "Contacts";
    
    public String name;
    
    @OneToMany
    public List<Contact> contacts;
    
    public ContactsGroup(String name) {
        this.name = name;
        this.contacts = new ArrayList<Contact>();
    }
    
    /**
     * find an user contact in the group 
     * @param user
     * @return the Contact relative to user if found, null else
     */
    public Contact findContact(User user) {
        for(Contact contact : contacts)
            if(contact.user.equals(user))
                return contact;
        return null;
    }
    
    /**
     * Add a contact in the group without verify if he is already added and without sync him. 
     * @param contact
     * @return the added contact
     */
    public Contact addContact(Contact contact) {
        contact.group = this;
        contact.save();
        contacts.add(contact);
        save();
        return contact;
    }
    
    /**
     * Remove a specific contact from the group without sync him.
     * @param contact
     * @return true if contact existed.
     */
    public boolean removeContact(Contact contact) {
        if( contacts.remove(contact) ) {
            save();
            contact.delete();
            return true;
        }
        return false;
    }
    
    /**
     * Rename this group.
     * @param name
     * @return this group
     */
    public ContactsGroup rename(String name) {
        if(name==null)
            throw new NullPointerException();
        this.name = name;
        save();
        return this;
    }
    
    public ContactsGroupJson toJson() {
        return new ContactsGroupJson(this);
    }
    
}
