package models.contacts.json;

import models.contacts.Contact;
import models.contacts.Contact.SyncStatus;
import models.json.CommonContactInfoJson;

public class ContactJson extends CommonContactInfoJson {
    
    public String syncStatus;
    public Long groupid;
    
    public ContactJson(Contact contact) {
        super(contact.user);
        groupid = contact.group.id;
        syncStatus = contact.status.toString();
        
        // Only accepted contact infos :
        if( !contact.isAccepted() ) {
            imStatus=null;
            submessage=null;
        }
    }
}
