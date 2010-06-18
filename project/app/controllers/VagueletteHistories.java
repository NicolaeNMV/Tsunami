package controllers;

import models.*;
import models.vagues.*;
import models.vagues.json.VagueletteHistoryJson;
import models.vagues.json.VagueletteJson;
import play.data.validation.*;
import controllers.base.Application;

public class VagueletteHistories extends Application {
    
    public static void list(@Required Long vagueletteId) {
        User currentUser = getConnectedUser();
        Vaguelette vaguelette = Vaguelette.findById(vagueletteId);
        notFoundIfNull(vaguelette);
        if(!vaguelette.containsUser(currentUser.userid))
            forbidden();
        renderJSON(new VagueletteJson(vaguelette, true));
    }
}
