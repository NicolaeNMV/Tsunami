package controllers;

import org.apache.commons.io.filefilter.NotFileFilter;
import org.apache.commons.lang.RandomStringUtils;

import controllers.base.Base;
import models.User;
import models.contacts.ImStatus;
import play.Logger;
import play.data.validation.*;
import play.i18n.Messages;

/**
 * @author gren
 */
public class Auth extends Base {
    
    // HTML controllers //
    
    public static void loginPage() {
        addCurrentThemeToRenderArgs();
        if(session.contains("uid"))
            redirect("/"); // Redirect if logged
        render();
    }
    
    /**
     * Redirect to the login page with "logout" hash
     */
    public static void logout() {
        addCurrentThemeToRenderArgs();
        if(session.contains("uid")) {
            User user = User.findByUserid( session.get("uid"));
            user.imStatus = ImStatus.OFFLINE;
            user.save();
        }
        session.remove("uid");
        redirect("/#logout");
    }
    
    public static void registerPage() {
        addCurrentThemeToRenderArgs();
        if(session.contains("uid"))
            redirect("/"); // Redirect if logged
        render();
    }
    
    public static void applyResetToken(@Required String login, @Required String resetToken) {
    	flash.keep();
    	if(Validation.hasErrors())
    		forbidden();
    	User user = User.findByLogin(login);
    	notFoundIfNull(user);
        addCurrentThemeToRenderArgs();
        Logger.debug("user.resetToken=%s", user.resetToken);
    	if(!resetToken.equals(user.resetToken))
    		render(user);
    	user.resetToken = null;
    	String password = RandomStringUtils.randomAlphabetic(10);
    	user.encodePassword(password);
    	user.save();
    	flash.put("password", password);
    	render(user);
    }
    
    public static void requestPasswordReset(@Required String login) {
    	if(Validation.hasErrors()) {
    		Validation.keep();
    		forgottenPassword();
    	}
    	User user = User.findByLogin(login);
    	if(user==null) {
    		validation.addError("login", "Aucun compte ne correspond à cet identifiant.");
    	}
    	else if(user.email==null) {
    		validation.addError("emailNotFound", "L'email n'a pas été fourni pour l'inscription de cet utilisateur.");
    	}
    	if(Validation.hasErrors()) {
    		Validation.keep();
    		forgottenPassword();
    	}
    	Notifier.resetPassword(user);
    	flash.put("emailSent", "success");
    	flash.keep();
    	forgottenPassword();
    }
    
    public static void forgottenPassword() {
        addCurrentThemeToRenderArgs();
        render();
    }
    
    // Ajax controllers //
    
    public static void login(@Required String login, @Required String password) {
        notFoundIfNotJSON();
        
        if( Validation.hasErrors() ) {
            response.status = 400;
            renderJSON( Validation.errors() );
        }
        
        User u = User.findByLogin(login);
        
        if(u==null || !u.matchPassword(password) )
            notFound();
        
        session.put("uid", u.userid);
        renderJSON("{}");
    }
    
    public static void register(
            @Required @MinSize(4) @MaxSize(32) String username,
            @Required @MinSize(4) @MaxSize(255) String password,
            @Required @Equals("password") String passwordAgain,
            @Email String email) {
        params.flash();
        
        if( Validation.hasErrors() ) {
            Validation.keep();
            registerPage();
        }

        if( !User.isValidUsername(username) )
            Validation.addError("username", Messages.get("validation.username.alnum"));
        else if (User.findByUsername(username) != null)
            Validation.addError("username", Messages.get("validation.username.exists"));
        
        if( Validation.hasErrors() ) {
            Validation.keep();
            registerPage();
        }
        
        User u = new User(username, password);
        
        if(email!=null && email.length()!=0) {
            if( User.findByEmail(email) != null ) {
                Validation.addError("email", "Cet email est déjà utilisé par un utilisateur.");
            }
            if( Validation.hasErrors() ) {
                Validation.keep();
                registerPage();
            }
            u.email = email;
        }

        u.save();
        
        redirect("/");
    }

}
