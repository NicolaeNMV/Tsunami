package models.contacts.json;

import java.util.ArrayList;
import java.util.List;

import models.contacts.ContactsGroup;
import models.contacts.ContactsList;

public class ContactsListJson {

    public List<ContactsGroupJson> groups;

    public ContactsListJson(ContactsList c) {
        groups = new ArrayList<ContactsGroupJson>();
        for(ContactsGroup g : c.groups)
            groups.add( g.toJson() );
    }

}
