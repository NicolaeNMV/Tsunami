package jobs;

import java.io.*;

import edu.emory.mathcs.backport.java.util.concurrent.ExecutorService;

import play.Logger;
import play.Play;
import play.jobs.Job;
import play.jobs.OnApplicationStart;
import util.CometHelper;

@OnApplicationStart
public class OrbitedConnection extends Job<Void>{

	private void startRestq() {
		new Thread() {
			@Override
			public void run() {
				try {
					Process p = Runtime.getRuntime().exec("./orbited/start.sh restq", null, Play.applicationPath);
				} catch (IOException e) {
				}
			}
		}.start();
	}

	private void startOrbited() {
		new Thread() {
			@Override
			public void run() {
				try {
					Runtime.getRuntime().exec("./orbited/start.sh orbited", null, Play.applicationPath);
				} catch (IOException e) {
				}
			}
		}.start();
	}
	
    public void doJob() {
    	
    	Logger.info("Starting Restq...");
    	startRestq();
    	try {
			Thread.sleep(2000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
    	Logger.info("Restq started.");

    	Logger.info("Starting Orbited...");
    	startOrbited();
    	try {
			Thread.sleep(2000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
    	Logger.info("Orbited started.");
    	
        CometHelper.getCometClient();
    }

}
