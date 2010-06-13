package models.vagues.json;

import models.User;

public class VagueletteParticipantJson {
	public String userid;
	public String username;
	public Long timestamp;
	
	public VagueletteParticipantJson(User user, Long timestamp) {
		userid = user.userid;
		username = user.username;
		this.timestamp = timestamp;
	}
}
