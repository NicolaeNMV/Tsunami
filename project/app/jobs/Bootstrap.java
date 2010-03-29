package jobs;



import models.User;
import play.Logger;
import play.jobs.*;

@OnApplicationStart
public class Bootstrap extends Job<Object> {

    public void doJob() {
        if (User.count() == 0) {
            // Create some test users
            new User("master", "tsunami").save();
            Logger.info("No user in database. User master (passwd:tsunami) created.");
            User u;
            u = new User("toto", "toto");
            u.email = "toto@toto.fr";
            u.save();
            u = new User("titi", "titi");
            u.email = "titi@titi.fr";
            u.save();
            u = new User("tata", "tata");
            u.email = "tata@tata.fr";
            u.save();
            Logger.info("Users 'toto', 'titi', 'tata' created for tests.");
            
            // destroy session because it's seems database have been reset.
            //Session.current().clear();
        }
    }

}
