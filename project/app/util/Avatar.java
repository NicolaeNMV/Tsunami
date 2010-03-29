package util;

import java.io.File;
import java.io.IOException;

import exceptions.BadMimetype;

import play.Play;
import play.libs.Images;
import play.libs.MimeTypes;

public class Avatar {
   
    public File small;
    public File medium;
    public File large;
    
    public Avatar(File folder) {
        small = new File(folder, "small.png");
        medium = new File(folder, "medium.png");
        large = new File(folder, "large.png");
    }
    
    public File getFile(String size) {
        if(size.equals("small"))
            return small;
        if(size.equals("medium"))
            return medium;
        if(size.equals("large"))
            return large;
        return null;
    }
    
    private void touchFiles() throws IOException {
        if(!small.exists())
            small.createNewFile();
        if(!medium.exists())
            medium.createNewFile();
        if(!large.exists())
            large.createNewFile();
    }
    
    private void cleanFiles() {
        if(small.exists())
            small.delete();
        if(medium.exists())
            medium.delete();
        if(large.exists())
            large.delete();
    }
    
    /**
     * Try to set the new avatar.
     * @param img : the File image to set the new avatar.
     * @return true if the avatar is successfull set.
     * @throws BadMimetype 
     * @throws Exception 
     */
    public void setAvatar(File img) throws Exception {
        String mimetype = MimeTypes.getMimeType(img.getPath());
        if(!mimetype.contains("image/"))
            throw new BadMimetype(mimetype);
        try {
            touchFiles();
            Images.resize(img, small, 32, 32);
            Images.resize(img, medium, 64, 64);
            Images.resize(img, large, 128, 128);
        }
        catch (Exception e) {
            cleanFiles();
            throw e;
        }
        if(!MimeTypes.getMimeType(small.getPath()).contains("image/")
        || !MimeTypes.getMimeType(medium.getPath()).contains("image/")
        || !MimeTypes.getMimeType(large.getPath()).contains("image/")) {
            cleanFiles();
            throw new BadMimetype();
        }
    }
    
    public boolean removeAvatar() {
        if( small.exists() && medium.exists() && large.exists() ) {
            small.delete();
            medium.delete();
            large.delete();
            return true;
        }
        return false;
    }
    
    public static Avatar getDefault() {
        return new Avatar(Play.getFile("/public/images/avatar/"));
    }
    
    public static boolean isAuthorizedSize(String size) {
        return size.equals("small") || size.equals("medium") || size.equals("large");
    }
}
