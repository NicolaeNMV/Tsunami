package models.vagues.json;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import models.User;
import models.vagues.*;

public class VagueletteParticipantJson {
	public String userid;
	public String username;
	public Long timestamp;
	
	public VagueletteParticipantJson(User user, Long timestamp) {
		userid = user.userid;
		username = user.username;
		this.timestamp = timestamp;
	}
	
	public static List<VagueletteParticipantJson> getParticipants(Vaguelette v) {
		List<VagueletteParticipantJson> participants;
		Map<User, Long> lastUserMessage = new HashMap<User, Long>();
        for(VagueletteHistory vh : v.histories) {
            Long last = lastUserMessage.get(vh.user);
        	if(last==null || vh.timestamp>last)
        		lastUserMessage.put(vh.user, vh.timestamp);
        }
        
        participants = new ArrayList<VagueletteParticipantJson>();
        for(User user : lastUserMessage.keySet()) 
        	participants.add(new VagueletteParticipantJson(user, lastUserMessage.get(user)));
        return participants;
	}
}
