package models.json;

import models.User;

public class PublicUserInfoJson {
    
    public String userid;
    public String username;

    public String email;
    public String firstName;
    public String lastName;
    
    public PublicUserInfoJson(User user) {
        userid = user.userid;
        username = user.username;
        email = user.email;
        firstName = user.firstName;
        lastName = user.lastName;
    }
}
