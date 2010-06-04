package controllers;

import java.io.File;

import com.google.gson.Gson;

import models.User;
import play.data.validation.Required;
import play.data.validation.Validation;

import controllers.base.Base;

import models.contacts.ImStatus;

public class Cometsync extends Base {
    public static void userStatus(String userid, String event) {
	    User user = User.findByUserid(userid);
	    
	    if (user == null)
            error("userNotFound");
	    
	    System.out.println("event: "+event);
	    if (event.equals("connect")) {
	    	System.out.println("connected ");
	    	user.imStatus = ImStatus.AVAILABLE;
	    } else {
	    	System.out.println("offline ");
	    	user.imStatus = ImStatus.OFFLINE;
	    }
	    // @TODO, include the new status of the user
	    user.save();
	    System.out.println("user.imStatus "+user.imStatus);
		user.sendCometAllContacts("user.status",user.userid);
    }
}