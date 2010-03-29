package contacts;

import models.User;
import models.contacts.Contact;
import models.contacts.ContactsGroup;
import org.junit.Test;

import play.test.UnitTest;

public class ContactsUnit extends UnitTest {
    
    @Test
    public void createUsers() {
        new User("testuser", "testuser").save();
        new User("testuserContact1", "test").save();
        new User("testuserContact2", "test").save();
    }
    
    @Test
    public void checkCorrectContactsList () {
        User testuser = User.findByLogin("testuser");
        assertNotNull( testuser.contacts );
        assertEquals(testuser.contacts.groups.size(),0);
    }
    
    @Test
    public void addContactInDefaultGroup() {
        User testuser = User.findByLogin("testuser");
        ContactsGroup group = testuser.contacts.getDefaultGroup();
        assertNotNull(group);
        User contactUser = User.findByLogin("testuserContact1");
        assertNotNull(contactUser);
        Contact contact = new Contact(contactUser, Contact.SyncStatus.INVITED);
        assertNotNull(contact);
        group.addContact(contact);
        assertNotNull( group.findContact(contactUser) );
        assertNotNull( testuser.contacts.findContact(contactUser) );
    }
    
    // To be continued...
    
    @Test
    public void deleteUsers() {
        User.findByLogin("testuser").delete();
        User.findByLogin("testuserContact1").delete();
        User.findByLogin("testuserContact2").delete();
    }
    
}
