package util;

import java.io.IOException;

import javax.security.auth.login.LoginException;

import play.Logger;
import play.Play;

import net.ser1.stomp.Client;

public class CometHelper {
    
    private static Client client = null;
    
    public static Client getCometClient() {
        if(client==null || client.isClosed()) {
            try {
                client = new Client( Play.configuration.getProperty("stomp.server"), 
                        Integer.parseInt(Play.configuration.getProperty("stomp.port")), 
                        Play.configuration.getProperty("stomp.login"),
                        Play.configuration.getProperty("stomp.pass") );
                if(client.isConnected())
                    Logger.info("Connected to Orbited");
                else {
                	client = null; // force next reloading
                    Logger.error("Unable to connect to Orbited.");
                }
            } catch(Exception e) {
            	client = null; // force next reloading
                Logger.error("Unable to connect to Orbited : %s", e.getMessage());
            }
        }
        return client;
    }
    
    public static boolean isInit() {
      return client != null;
    }
}
