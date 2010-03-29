package basic;

import models.User;
import org.junit.Test;
import play.test.UnitTest;

public class UsersUnit  extends UnitTest {

    @Test
    public void createUser() {
        User testuser = new User("testuser", "testuser");
        assertNotNull(testuser);
        testuser.email = "testuser@test.fr";
        testuser.save();
        assertEquals(testuser.userid, User.findByUsername("testuser").userid);
        assertEquals(testuser.userid, User.findByLogin("testuser").userid);
        assertEquals(testuser.userid, User.findByEmail("testuser@test.fr").userid);
        assertEquals(testuser.userid, User.findByLogin("testuser@test.fr").userid);
    }
    
    @Test
    public void removeUser() {
        User testuser = User.findByLogin("testuser");
        assertNotNull(testuser);
        testuser.delete();
        assertNull(User.findByLogin("testuser"));
    }
}
