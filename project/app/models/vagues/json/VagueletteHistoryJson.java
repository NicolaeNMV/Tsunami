package models.vagues.json;

import java.util.ArrayList;
import java.util.List;

import play.Logger;

import models.User;
import models.vagues.Vaguelette;
import models.vagues.VagueletteHistory;

public class VagueletteHistoryJson {
    
    public String body;
    
    public int version;
    
    public String username;
    
    public Long timestamp;
    
    public VagueletteHistoryJson(VagueletteHistory vh) {
        body = vh.body;
        version = vh.version;
        username = vh.user.username;
        timestamp = vh.timestamp;
    }
    
    public static List<VagueletteHistoryJson> getHistories(Vaguelette v) {
        List<VagueletteHistoryJson> list = new ArrayList<VagueletteHistoryJson>();
        for(VagueletteHistory vh : v.histories)
            list.add(new VagueletteHistoryJson(vh));
        return list;
    }
}
