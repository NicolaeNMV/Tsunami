package controllers;

import controllers.base.Base;
import models.User;
import models.contacts.ImStatus;
import play.data.validation.*;

/**
 * TODO @ gren : will be improved 
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
    
    public static void browserCompatibilityPage() {
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
        
        if(u==null || !u.password.equals(password) )
            notFound();
        
        session.put("uid", u.userid);
        renderJSON("{}");
    }
    
    public static void register(
            @Required @MinSize(4) @MaxSize(32) String username,
            @Required @MinSize(4) @MaxSize(255) String password,
            @Email String email) {
        notFoundIfNotJSON();
        
        if( Validation.hasErrors() ) {
            response.status = 400;
            renderJSON( Validation.errors() );
        }
        
        if( !User.isValidUsername(username) ) {
            response.status = 400;
            renderJSON("[{ message:'Le nom d\\'utilisateur doit être alpha-numérique.'" + /* TODO : with I18n, this will be in conf/messages.fr file */
                    ",key:'username' }]");
        }
        
        if (User.findByUsername(username) != null) {
            response.status = 400;
            renderJSON("[{ message:'Ce nom d\\'utilisateur existe déjà.',key:'username' }]");
        }
        
        User u = new User(username, password);
        
        if(email!=null && email.length()!=0) {
            if( User.findByEmail(email) != null ) {
                response.status = 400;
                renderJSON("[{ message:'Cet email est déjà utilisé par un utilisateur.',key:'email' }]");
            }
            u.email = email;
        }

        u.save();
        
        renderJSON("{}");
    }

}
