package jobs;

import java.io.*;

import play.Logger;
import play.Play;
import play.jobs.Job;
import play.jobs.OnApplicationStart;
import util.CometHelper;

@OnApplicationStart
public class OrbitedConnection extends Job<Void>{

	private static class Proc extends Thread {
		Process p = null;
		String cmd = null;
		
		public Proc(String cmd) {
			this.cmd = cmd;
		}
		
		@Override
		public void run() {
			try {
				p = Runtime.getRuntime().exec(cmd, null, Play.applicationPath);
			} catch (IOException e) {
			}
		}
		
		public void killProc() {
			p.destroy();
		}
	}
	

	private static Proc restq = null;
	private static Proc orbited = null;
	
	private static void startRestq() {
		restq = new Proc("./orbited/start.sh restq");
		restq.start();
	}
	
	private static void stopRestq() {
		if(restq!=null) {
			restq.killProc();
			restq = null;
		}
	}
	
	private static void stopOrbited() {
		if(orbited!=null) {
			orbited.killProc();
			orbited = null;
		}
	}

	private static void startOrbited() {
		orbited = new Proc("./orbited/start.sh orbited");
		orbited.start();
	}
	
	public static void stopAll() {
		stopOrbited();
		stopRestq();
	}
	
	public static void startAll() {
		Logger.info("starting restq and orbited...");
        startRestq();
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        Logger.info("Restq started.");

        startOrbited();
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        Logger.info("Orbited started.");
        
        CometHelper.getCometClient();
    }
	
	private static boolean applicationStarted = false;
	public static boolean isStarted() {
		return applicationStarted;
	}
	
	
	public void doJob() {
		stopAll();
        startAll();
        applicationStarted = true;
    }

}
