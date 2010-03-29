package vagues;

import java.util.List;

import org.junit.Test;
import org.junit.Before;

import play.test.Fixtures;
import play.test.UnitTest;

import models.User;
import models.vagues.Vaguelette;
import models.vagues.Vague;
import models.vagues.VagueParticipant;

public class VaguesUnit extends UnitTest {
    /*@Before
    public void setup() {
        Fixtures.deleteAll();
    }*/	
	/*
	@Test
	public void createVague() {
		Vague v = new Vague("Test vague");
		assertNotNull(v);
		v.save();
		v = Vague.findById(v.id);
		assertEquals("Test vague", v.subject);
		
		// Test ondelette
		Ondelette o = new Ondelette(v,"Test ondelette");
		assertNotNull(o);
		o.save();
		o = Ondelette.findById(o.id);
		assertEquals("Test ondelette", o.body);
		assertEquals(v, o.vague);
		
		User u = new User("testuservague","testuser");
		u.save();
		
		// Test VagueParticipant
		VagueParticipant vp = new VagueParticipant(o, u);
		vp.save();
		
		List<Ondelette> olist = VagueParticipant.findByUser(u);
		assertFalse(olist.isEmpty()); // isEmpty Returns true if this list contains no elements.
		assertEquals(1,olist.size()); 
		assertEquals(o.body,olist.get(0).body);
		
	}
	*/
}
