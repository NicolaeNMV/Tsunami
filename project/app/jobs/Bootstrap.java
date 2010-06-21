package jobs;

import play.jobs.*;
import models.*;
import models.contacts.*;
import models.vagues.*;
import play.test.Fixtures;
import play.Logger;
import java.util.ArrayList;
import java.util.List;

@OnApplicationStart
public class Bootstrap extends Job<Object> {

    public void doJob() {
        if (User.count() == 0) {
          Logger.info("Bootstraping...");
          Fixtures.deleteAll();
          Fixtures.load("jobs/data.yml");
          Logger.info("...success.");
        }
    }

}
