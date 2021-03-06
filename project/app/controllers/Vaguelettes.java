package controllers;

import models.User;
import models.vagues.*;
import play.data.validation.*;
import controllers.base.Application;

import java.util.HashMap;
import java.util.Map;

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
    
    public static void create(@Required Long vagueId, String content, Long vagueletteParentId, Long userWindowId) {
        User currentUser = getConnectedUser();
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        Vaguelette vaguelette = new Vaguelette("",vague);
        vague.addVaguelette(vaguelette, getConnectedUser());
        vaguelette.parentId = vagueletteParentId;
        if(content!=null)
          vaguelette.setBody(content);
        
        Map<String,Object> answer = vaguelette.toJson().getMap();
        answer.put("senderWindowId",userWindowId);
        vaguelette.vague.sendCometAllParticipants("vaguelette.create",answer);
        
        renderJSON(answer);
    }
    
    public static void edit(@Required Long vagueletteId, String content) {
        User currentUser = getConnectedUser();
        Vaguelette vaguelette = Vaguelette.findById(vagueletteId);
        notFoundIfNull(vaguelette);
        if(!vaguelette.containsUser(currentUser.userid))
            forbidden();
        
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
    public static void editSync(@Required Long vagueletteId, @Required String patch, @Required Long userWindowId, Long patchTime, Boolean getVagulette) {
        User currentUser = getConnectedUser();
        Vaguelette vaguelette = Vaguelette.findById(vagueletteId);
        notFoundIfNull(vaguelette);
        
        // check if user is allowed to edit
        if(!vaguelette.vague.containsUser(currentUser.userid))
        	forbidden();
        
        Map<String,Object> answer = new HashMap<String, Object>();
        answer.put("vagueletteId",vagueletteId);
        answer.put("vagueId",vaguelette.vague.id);
        
        if (vaguelette.patch(patch, currentUser) == false) {
            answer.put("code","500");
            answer.put("codeText","Cannot apply patch, reload your vagulette");
            renderJSON(toJson(answer));
        }
        
        answer.put("version",vaguelette.version);
        answer.put("patch",patch);
        answer.put("userId",currentUser.userid);
        answer.put("senderWindowId",userWindowId);
        answer.put("patchTime",patchTime);
        
         // Send the patch to every member of the vague
        vaguelette.vague.sendCometAllParticipants("vaguelette.patch",answer);
        try {
            if (getVagulette) {
                answer.put("body",vaguelette.body);
                renderJSON(answer);
            }
        } catch (NullPointerException e) {
            
        }
    }
}
