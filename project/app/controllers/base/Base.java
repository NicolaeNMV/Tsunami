package controllers.base;

import java.util.Arrays;

import play.Logger;
import play.mvc.Before;
import play.mvc.Controller;
import util.*;

// Base of all controllers
public class Base extends Controller {

    @Before
    static void logRequest() {
        Logger.debug("%-7s %-20s (%s) -> %s", request.method, request.path, request.contentType, request.action);
    }
    
    protected static void addCurrentThemeToRenderArgs() {
        BaseUtil.addCurrentThemeToRenderArgs(renderArgs, session);
    }
    
    protected static void notFoundIfNotJSON() {
      if(!request.format.equals("json"))
        notFound();
    }
    
}
