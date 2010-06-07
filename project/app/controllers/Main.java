package controllers;

import controllers.base.Application;

public class Main extends Application {

    public static void index() {
        addCurrentThemeToRenderArgs();
        if(request.isAjax())
          forbidden();
        render();
    }
    
    public static void test() {
    	render();
    }

}
