package controllers;

import controllers.base.*;
import play.data.validation.*;
import play.mvc.*;
import models.*;
import util.*;

public class Admin extends CRUD {
    
    @Before
    public static void globals() {
        if(session.contains("uid")) {
            User user = User.findByUserid( session.get("uid"));
            if(!user.isAdmin)
                forbidden();
            renderArgs.put("currentUser", user);
        }
        else
            redirect("/");
        BaseUtil.addCurrentThemeToRenderArgs(renderArgs, session);
    }
}