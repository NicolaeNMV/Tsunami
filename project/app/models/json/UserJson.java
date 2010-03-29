package models.json;

import models.User;

public class UserJson extends CommonContactInfoJson {
    
    public String selectedStatus;
    
    public UserJson(User user) {
        super(user);
        if(user.selectedStatus!=null)
          selectedStatus = user.selectedStatus.toString();
    }
}
