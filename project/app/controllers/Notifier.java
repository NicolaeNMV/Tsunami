package controllers;

import org.apache.commons.lang.RandomStringUtils;

import models.User;
import play.Logger;
import play.Play;
import play.mvc.Mailer;

public class Notifier extends Mailer {
	
	public static void resetPassword(User user) {
		addRecipient(user.email);
		Logger.info("sending resetPassword to %s", user.email);
		user.resetToken = RandomStringUtils.randomAlphabetic(64);
		user.save();
		setSubject("Tsunami - Oubli du mot de passe");
		setFrom(Play.configuration.getProperty("tsunami.mail"));
		send(user);
	}
}
