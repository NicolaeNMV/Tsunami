package controllers;

import java.util.ArrayList;
import java.util.List;

import controllers.base.Application;
import models.vagues.*;
import models.*;
import models.vagues.json.VagueJson;
import play.data.validation.*;

/**
 * Controller for vagues
 * @author Adren
 */

public class Vagues extends Application {
  
    public static void list(String search) {
        List<Vague> vagues = Vague.findByUserid(getConnectedUser().userid, search);
        List<VagueJson> vaguesJson = new ArrayList<VagueJson>();
        for(Vague v : vagues)
            vaguesJson.add(new VagueJson(v));
        renderJSON(vaguesJson);
    }
  
    public static void create(String subject) {
        User currentUser = getConnectedUser();
        Vague vague = new Vague(subject);
        VagueParticipant vp = new VagueParticipant(currentUser).assignToVague(vague);
        vp.save();
        vague.participants.add(vp);
        vague.save();
        vague.addVaguelette(new Vaguelette("", vague), getConnectedUser());
        renderJSON(new VagueJson(vague));
    }
  
    public static void show(Long vagueId) {
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        if(request.format.equals("json"))
            renderJSON(new VagueJson(vague));
        render(vague);
    }
    
    public static void edit(Long vagueId, String subject) {
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        vague.subject = subject;
        vague.save();
        renderJSON(new VagueJson(vague));
    }
    
    public static void inviteUser(@Required Long vagueId, @Required String userid) {
        User currentUser = getConnectedUser();
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        if(!vague.containsUser(currentUser.userid))
            forbidden();
        User user = User.findByUserid(userid);
        notFoundIfNull(user);
        VagueParticipant vp = new VagueParticipant(user);
        vague.addParticipant(vp);
        renderJSON("{}");
    }
}
