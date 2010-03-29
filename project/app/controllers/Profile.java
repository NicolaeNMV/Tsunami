package controllers;

import java.io.File;

import com.google.gson.Gson;

import models.User;
import play.data.validation.Required;
import play.data.validation.Validation;
import util.Avatar;

import controllers.base.Application;

public class Profile extends Application {
    
    public static void postAvatar(@Required File file) {
        if(Validation.hasErrors()) {
            response.status = 400;
            renderJSON( Validation.errors() );
        }
        User connectedUser = getConnectedUser();
        try {
            (new Avatar(connectedUser.getUserPath())).setAvatar(file);
        } catch (Exception e) {
            error(e.toString());
        }
        connectedUser.setAvatar(true);
        renderText("ok");
    }
    
    public static void updateSubmessage(String submessage) {
        User connectedUser = getConnectedUser();
        connectedUser.setSubmessage(submessage);
        connectedUser.refresh();
        renderJSON( connectedUser.toJson() );
    }
    
    public static void changeTheme(String theme) {
        session.put("theme", theme);
        if(request.format.equals("json"))
            renderJSON("{}");
        redirect("/");
    }
    
    /*
     * TODO:
     * - Send only if userid is a friend of current user
     * - Move to a new controller (Chat maybe and rename the action by send)
     */
    public static void chatSend(String userid, String msg) {
    	if ( sendComet(userid, "chat.msg",  msg) ) {
    		renderText("yes");
        }
        renderText("no");
    }
    

}
