package jobs;

import play.jobs.Job;
import play.jobs.OnApplicationStart;
import util.CometHelper;

@OnApplicationStart
public class OrbitedConnection extends Job<Void>{
    
    public void doJob() {
        CometHelper.getCometClient();
    }

}
