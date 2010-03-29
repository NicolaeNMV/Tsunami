package models.contacts.json;

import java.util.ArrayList;
import java.util.List;

import models.contacts.Contact;
import models.contacts.ContactsGroup;

public class ContactsGroupJson {

    public String name;
    public Long id;
    
    public List<ContactJson> contacts;
    
    public ContactsGroupJson(ContactsGroup group) {
        name = group.name;
        id = group.id;
        contacts = new ArrayList<ContactJson>();
        for(Contact c : group.contacts)
            contacts.add( c.toJson() );
    }
}
