package controllers;

import java.util.ArrayList;
import java.util.List;

import controllers.base.Application;
import models.vagues.*;
import models.vagues.json.VagueJson;

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
        Vague vague = new Vague(subject);
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
}
