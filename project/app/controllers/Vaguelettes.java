package controllers;

import models.User;
import models.vagues.*;
import play.data.validation.*;
import controllers.base.Application;

import java.util.HashMap;

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
          sendComet(vp.user.userid,"vaguelette.edit",vagueletteId);
        
        vaguelette.setBody(content);
        renderJSON(vaguelette.toJson());
    }
    
    public static void inviteUser(@Required Long vagueletteId, @Required String userid) {
        User currentUser = getConnectedUser();
        Vaguelette vaguelette = Vaguelette.findById(vagueletteId);
        notFoundIfNull(vaguelette);
        if(!vaguelette.containsUser(currentUser.userid))
            forbidden();
        User user = User.findByUserid(userid);
        notFoundIfNull(user);
        VagueParticipant vp = new VagueParticipant(user);
        vaguelette.vague.addParticipant(vp);
        renderJSON("{}");
    }
    public static void editSync(@Required Long vagueletteId, @Required String patch, @Required Long userWindowId) {
        User currentUser = getConnectedUser();
        Vaguelette vaguelette = Vaguelette.findById(vagueletteId);
        notFoundIfNull(vaguelette);
        
        // TODO, check if user is allowed to edit
        
        HashMap answer = new HashMap();
        answer.put("vagueletteId",vagueletteId);
        
        if (vaguelette.patch(patch) == false) {
            answer.put("code","500");
            answer.put("codeText","Cannot apply patch, reload your vagulette");
            renderJSON(toJson(answer));
        }
        
        answer.put("code","200");
        answer.put("codeText","OK");
        answer.put("version",vaguelette.version);
        answer.put("patch",patch);
        answer.put("userId",currentUser.userid);
        answer.put("senderWindowId",userWindowId);
        
        vaguelette.vague.sendCometAllParticipants("vaguelette.patch",answer);
        
        // Send the patch to every member of the vague
        // renderJSON(vaguelette.toJson());
    }
}
