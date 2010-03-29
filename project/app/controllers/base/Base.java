package controllers.base;

import java.util.Arrays;

import play.Logger;
import play.mvc.Before;
import play.mvc.Controller;

// Base of all controllers
public class Base extends Controller {

    @Before
    static void logRequest() {
        Logger.debug("%-7s %-20s (%s) -> %s", request.method, request.path, request.contentType, request.action);
    }
    
    private static final String[] themes = {"ocean", "orange", "apple", "metal"};
    
    protected static void addCurrentThemeToRenderArgs() {
        String theme = session.get("theme");
        boolean valid = false;
        if(theme!=null)
            for(int i=0; i<themes.length && !valid; ++i)
                if(themes[i].equals(theme))
                    valid = true;
        if(!valid) session.put("theme", themes[0]);
        renderArgs.put("theme", session.get("theme"));
        renderArgs.put("themes", themes);
    }
    
    protected static void notFoundIfNotJSON() {
      if(!request.format.equals("json"))
        notFound();
    }
    
}
