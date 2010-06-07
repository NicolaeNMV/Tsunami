package controllers.base;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

import models.User;

import play.Logger;
import play.mvc.Before;
import play.mvc.Router;
import sun.misc.UUDecoder;
import util.CometHelper;

import net.ser1.stomp.Client;
import net.ser1.stomp.Stomp;

// Base of all controllers excepts the Auth controller
public class Application extends Base {
    
    @Before
    protected static void checkUserAndFillArgs() {
        String uid = session.get("uid");
        User currentUser = null;
        
        if(uid!=null) {
            currentUser = User.findByUserid(session.get("uid"));
            if(currentUser==null)
                session.clear();
        }
        if(uid==null || currentUser==null) {
            if( request.isAjax() )
                forbidden();
            else
                controllers.Auth.loginPage();
        }
        
        // General update
        currentUser.updateActivity();
        
        // Fill commons information for current user
        renderArgs.put("currentUser", currentUser);
        renderArgs.put("routes", Router.routes);
    }
    
    // Utils //
    protected static User getConnectedUser() {
        return User.findByUserid( session.get("uid"));
    }
    
    
    /**
     * Send data to a single user <i>(polymorphic sendComet to support String userid)</i>
     * @param userid : userid receiver user
     * @param event : event name
     * @param data : data content (can be a string, something, list of something)
     * @return true if data successfully sent
     */
    public static boolean sendComet(String userid, String event, Object data) {
        User u = User.findByUserid(userid);
        return sendComet(u, event, data);
    }
    
    
    /**
        * Send data to a single user <i>(polymorphic sendComet to support String userid)</i>
        * @param userid : userid receiver user
        * @param event : event name
        * @param data : data content (can be a string, something, list of something)
        * @return true if data successfully sent
    */
    public static boolean sendComet(User u, String event, Object data) {
      if (u == null || !u.isConnected())
        return false;
      List<User> users = new ArrayList<User>();
      users.add(u);
      return sendComet(users, event, data);
    }

    /**
     * Send data to specified connected users
     * @param users : List of users
     * @param event : event name
     * @param data : data content (can be a string, something, list of something)
     * @return true if data successfully sent
     */
    public static boolean sendComet(Collection<User> users, String event, Object data) {
    	Map map = new HashMap();
    	map.put("event", event);
    	map.put("data", data);
    	String jsonData = new Gson().toJson(map);
        Client c = CometHelper.getCometClient();
        if(c==null)
            return false;
        for(User u : users) {
          //if(u.isConnected())
          c.send("/events/"+u.userid, jsonData);
          Logger.info("sendComet /events/%s : %s", u.userid, jsonData);
        }
        return true;
    }
}
