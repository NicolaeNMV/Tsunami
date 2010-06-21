package jobs;

import play.jobs.*;
import models.*;
import models.contacts.*;
import models.vagues.*;
import play.test.Fixtures;
import play.Logger;
import java.util.ArrayList;
import java.util.List;

@OnApplicationStart
public class Bootstrap extends Job<Object> {

    public void doJob() {
        if (User.count() == 0) {
          Logger.info("Bootstraping...");
          Fixtures.deleteAll();
          Fixtures.load("jobs/data.yml");
          Logger.info("...success.");
          
          
          // make users all friends
          List<User> users = new ArrayList<User>();
          users.add(User.findByUsername("master"));
          users.add(User.findByUsername("titi"));
          users.add(User.findByUsername("toto"));
          users.add(User.findByUsername("tata"));
          for (User u : users) {
            u.encodePassword(u.password);
            
            for (User user : users)
              if (!u.equals(user)) {
                if(u.contacts==null) {
                  u.contacts = new ContactsList();
                  u.contacts.save();
                }
                u.contacts.getDefaultGroup().addContact(new Contact(user,Contact.SyncStatus.CONFIRMED));
                u.contacts.save();
                u.save();
              }
          }
          
          List<Vague> vagues = Vague.findAll();
          for(Vague v : vagues) {
            for(User u : users) {
              v.addParticipant(new VagueParticipant(u));
            }
            for(Vaguelette vl: v.vaguelettes) {
              vl.vague = v;
              vl.initActivity();
              vl.initHistory(users.get(0));
              vl.save();
            }
            v.updatePreview();
            v.initActivity();
            v.save();
          }
          
          /*
            // Create some test users
            new User("master", "tsunami").setAdmin(true).save();
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
            */
          
            // destroy session because it's seems database have been reset.
            //Session.current().clear();
        }
    }

}
