package controllers;

import models.User;
import models.vagues.*;
import play.data.validation.*;
import controllers.base.Application;

public class Vaguelettes extends Application {
    
    public static void list(@Required Long vagueId) {
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        renderJSON(vague.getVaguelettes(getConnectedUser().userid));
    }
    
    public static void view(@Required Long vagueletteId) {
        User currentUser = getConnectedUser();
        Vaguelette vaguelette = Vaguelette.findById(vagueletteId);
        notFoundIfNull(vaguelette);
        if(!vaguelette.containsUser(currentUser.userid))
            forbidden();
        renderJSON(vaguelette.toJson());
    }
    
    public static void create(@Required Long vagueId, String content, Long vagueletteParentId) {
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        Vaguelette vaguelette = new Vaguelette("",vague);
        vague.addVaguelette(vaguelette, getConnectedUser());
        vaguelette.parentId = vagueletteParentId;
        vaguelette.setBody(content);
        renderJSON(vaguelette.toJson());
    }
    
    public static void edit(@Required Long vagueletteId, String content) {
        User currentUser = getConnectedUser();
        Vaguelette vaguelette = Vaguelette.findById(vagueletteId);
        notFoundIfNull(vaguelette);
        if(!vaguelette.containsUser(currentUser.userid))
            forbidden();
        for(VagueParticipant vp : vaguelette.vague.participants)
          sendComet(vp.userid,"vaguelette.edit",vagueletteId);
        
        vaguelette.setBody(content);
        renderJSON(vaguelette.toJson());
    }
    
}
