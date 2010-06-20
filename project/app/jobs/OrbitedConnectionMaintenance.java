package jobs;

import java.io.*;

import play.Logger;
import play.Play;
import play.jobs.*;
import play.libs.WS;
import play.libs.WS.WSRequest;
import util.CometHelper;

@Every("10s")
public class OrbitedConnectionMaintenance extends Job<Void> {

	private static void resetOrbitedConnection() {
		Logger.info("Orbited connection maintenance");
		OrbitedConnection.stopAll();
		OrbitedConnection.startAll();
	}
	
	@Override
	public void run() {
		if(OrbitedConnection.isStarted()) {
			try {
				Integer status = WS.url("http://localhost:5001/").timeout("2s").get().getStatus();
				if(status!=200) {
					resetOrbitedConnection();
					return;
				}
				status = WS.url("http://localhost:8001/tcp").timeout("2s").get().getStatus();
                if(status!=200) {
                    resetOrbitedConnection();
                    return;
                }
			}
			catch(Exception e) {
				resetOrbitedConnection();
				return;
			}
			if(CometHelper.getCometClient().isClosed()) {
				resetOrbitedConnection();
				return;
			}
		}
	}
}
