package controllers;

import controllers.base.Application;
import play.data.validation.*;
import play.mvc.*;
import models.*;

public class Admin extends CRUD {
    
    @Before
    public static void globals() {
        if(session.contains("uid")) {
            User user = User.findByUserid( session.get("uid"));
            if(!user.isAdmin)
                forbidden();
        }
        else
            redirect("/");
    }
}