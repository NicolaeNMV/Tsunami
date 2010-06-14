package controllers;

import java.util.ArrayList;
import java.util.List;

import controllers.base.Application;
import models.vagues.*;
import models.*;
import models.vagues.VagueParticipant.BoxStatus;
import models.vagues.json.VagueJson;
import models.vagues.json.VagueParticipantJson;
import models.vagues.json.VagueletteParticipantJson;
import play.Logger;
import play.data.validation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for vagues
 * @author Adren
 */

public class Vagues extends Application {
  
    public static void list(String search) {
        List<Vague> vagues = Vague.findByUserid(getConnectedUser().userid, search);
        List<VagueJson> vaguesJson = new ArrayList<VagueJson>();
        for(Vague v : vagues)
            vaguesJson.add(new VagueJson(v,getConnectedUser().userid));
        renderJSON(vaguesJson);
    }
  
    public static void create(String subject) {
        User currentUser = getConnectedUser();
        Vague vague = new Vague(subject);
        VagueParticipant vp = new VagueParticipant(currentUser).assignToVague(vague);
        vp.save();
        vague.participants.add(vp);
        vague.save();
        vague.addVaguelette(new Vaguelette(subject, vague), getConnectedUser());
        vague.updateParticipantSeen( currentUser.userid );
        renderJSON(new VagueJson(vague));
    }

    public static void show(Long vagueId) {
        Vague vague = Vague.findById(vagueId);
        User currentUser = getConnectedUser();
        notFoundIfNull(vague);
        if(!vague.containsUser(currentUser))
        	forbidden();
        vague.updateParticipantSeen( currentUser.userid );
        if(request.format.equals("json"))
            renderJSON(new VagueJson(vague));
        render(vague);
    }
    
    public static void getParticipants(Long vagueId) {
        Vague vague = Vague.findById(vagueId);
        User currentUser = getConnectedUser();
        notFoundIfNull(vague);
        if(!vague.containsUser(currentUser))
        	forbidden();
        List<VagueParticipantJson> participants = new ArrayList<VagueParticipantJson>();
        for(VagueParticipant vp : vague.participants)
            participants.add(new VagueParticipantJson(vp));
        renderJSON(participants);
    }
    
    /* User have saw the last changes of the vague, update participant seen date */
    public static void saw(Long vagueId) {
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        vague.updateParticipantSeen( getConnectedUser().userid );
        renderText("{code:200}");
    }
    
    public static void changeBox(@Required Long[] vagueIds, @Required String box) {
    	if(Validation.hasErrors())
    		error();
    	box = box.toUpperCase();
    	User connected = getConnectedUser();
    	for(Long vagueId : vagueIds) {
    		Vague vague = Vague.findById(vagueId);
    		VagueParticipant vagueParticipant = null;
    		for(VagueParticipant vp : vague.participants)
    			if(connected.equals(vp.user))
    				vagueParticipant = vp;
    		if(vagueParticipant!=null)
    			vagueParticipant.setStatus(BoxStatus.valueOf(box)).save();
    	}
        renderJSON("{}");
    }
    
    public static void inviteUser(@Required Long vagueId, @Required String userid) {
        User currentUser = getConnectedUser();
        Vague vague = Vague.findById(vagueId);
        notFoundIfNull(vague);
        if(!vague.containsUser(currentUser.userid) || vague.containsUser(userid))
            forbidden();
        User user = User.findByUserid(userid);
        notFoundIfNull(user);
        VagueParticipant vp = new VagueParticipant(user);
        vague.addParticipant(vp);
        
        Map<String,Object> answer = new HashMap<String, Object>();
        answer.put("vagueId",vague.id);
        answer.put("userId",user.userid);
        vague.sendCometAllParticipants("vague.newParticipant",answer);
        
        renderJSON("{}");
    }
}
