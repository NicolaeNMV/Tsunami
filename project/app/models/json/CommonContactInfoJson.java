package models.json;

import models.User;
import models.contacts.Contact.SyncStatus;

public class CommonContactInfoJson extends PublicUserInfoJson {
    
    public String imStatus;
    public String submessage;
    
    public CommonContactInfoJson(User user) {
        super(user);
        submessage = user.submessage;
        imStatus = user.updateStatusTimeOut().toString();
    }
}
