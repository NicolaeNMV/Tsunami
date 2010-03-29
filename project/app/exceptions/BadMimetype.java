package exceptions;

public class BadMimetype extends Exception {
    public String mimetype;
    public BadMimetype() {
        
    }
    public BadMimetype(String mimetype) {
        this.mimetype = mimetype;
    }
    @Override
    public String getLocalizedMessage() {
        if(mimetype!=null)
            return mimetype;
        return super.getLocalizedMessage();
    }
}
