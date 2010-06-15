package controllers;

import java.io.File;

import com.google.gson.Gson;

import models.User;
import play.data.validation.Required;
import play.data.validation.Validation;

import controllers.base.Base;

import models.contacts.ImStatus;

public class CometSync extends Base {
    public static void userStatus(String userid, String event) {
	    User user = User.findByUserid(userid);
	    if (user == null)
            error("userNotFound");
	    user.imStatus = "connect".equals(event) ? ImStatus.AVAILABLE : ImStatus.OFFLINE;
	    user.save();
        // TODO, include the new status of the user
		user.sendCometAllContacts("user.status",user.userid);
    }
}