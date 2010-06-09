
package util;

import java.io.File;
import java.io.IOException;

import exceptions.BadMimetype;

import play.Play;
import play.libs.Images;
import play.libs.MimeTypes;
import java.util.Map;
import play.mvc.*;

public class BaseUtil {
    private static final String[] themes = {"ocean", "orange", "apple", "metal"};
    
    public static void addCurrentThemeToRenderArgs(Scope.RenderArgs renderArgs, Scope.Session session) {
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
}