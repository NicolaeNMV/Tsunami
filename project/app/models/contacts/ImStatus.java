package models.contacts;

/* Inspirate by pidgin status */
public enum ImStatus {
    OFFLINE,        /* is not connected to the application                          */
    AVAILABLE,      /* is connected and available                                   */
    UNAVAILABLE,    /* is connected and unavailable ( = busy )                      */
    INVISIBLE,      /* is connected but invisible : his contacts saw him offline    */
    AWAY,           /* is connected but away (not on the computer right now)        */
    INACTIVE        /* is connected but not active right now                        */
}
