package controllers;

import java.io.File;

import com.google.gson.Gson;

import models.User;
import play.data.validation.*;
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
        render();
    }
    
    public static void updateSubmessage(String submessage) {
        User connectedUser = getConnectedUser();
        connectedUser.setSubmessage(submessage).save();
        connectedUser.refresh();
        connectedUser.sendCometAllContacts("user.submessage",connectedUser.userid);
        renderJSON( connectedUser.toJson() );
    }
    
    public static void changeTheme(String theme) {
        session.put("theme", theme);
        if(request.format.equals("json"))
            renderJSON("{}");
        redirect("/");
    }
    
    public static void changePassword
      (@Required String password, 
      @Required @Equals("password") String passwordRetype, 
      @Required @MinSize(4) @MaxSize(255) String newPassword) {
        if(validation.hasErrors())
            render();
        User connected = getConnectedUser();
        if(!connected.matchPassword(password))
            validation.addError("password", "mot de passe invalide");
        if(validation.hasErrors())
            render();
        connected.encodePassword(newPassword);
        connected.save();
        renderArgs.put("success",true);
        render();
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
