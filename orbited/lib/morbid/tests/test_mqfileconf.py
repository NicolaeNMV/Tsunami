import unittest
import os, sys
sys.path.insert(0, os.path.join('..','sample_auth'))
mqfileconf = __import__('mqfileconf')

class ParmTestCase(unittest.TestCase):
    def setUp(self):
        self.parms = mqfileconf.Parms()
        self.do_group_rights = self.parms.get_group_access_rights()
        self.co = set('c')
        self.ro = set('r')
        self.wo = set('w')
        self.cr = set(['c', 'r'])
        self.cw = set(['c', 'w'])
        self.rw = set(['r', 'w'])
        self.crw = set(['r', 'w', 'c'])
        self.none = set()
        
    def testUnknownQueue(self):
        self.assertEquals(self.do_group_rights(['user'],'/topic/unknown'), self.none)

    def testTextQueueUser(self):
        self.assertEquals(self.do_group_rights(['user'],'/topic/text/1'), self.rw)

    def testTextQueueAdmin(self):
        self.assertEquals(self.do_group_rights(['admin'],'/topic/text/1'), self.crw)
        
    def testHomeQueueUnknownUser(self):
        self.assertEquals(self.do_group_rights(['userx'],'/topic/home/1'), self.none)
        
    def testAdminQueueAdmin(self):
        self.assertEquals(self.do_group_rights(['admin'],'/topic/admin/2'), self.crw)
        
    def testAdminQueueUser(self):
        self.assertEquals(self.do_group_rights(['user'],'/topic/admin/2'), self.none)
        
    def testCommandQueueSite(self):
        self.assertEquals(self.do_group_rights(['site'],'/command/front'), self.cw)
        
    def testCommandQueueAdmin(self):
        self.assertEquals(self.do_group_rights(['admin'],'/command/front'), self.rw)
        
    def testCommandQueueUser(self):
        self.assertEquals(self.do_group_rights(['user'],'/command/front'), self.none)
        
    def testGroupHomeQueue(self):
        self.assertEquals(self.do_group_rights(['user'],'/home/user/1'), self.crw)
        
    def testOtherGroupHomeQueue(self):
        self.assertEquals(self.do_group_rights(['admin'],'/home/user/2'), self.none)
        
    def testMultipleGroups(self):
        self.assertEquals(self.do_group_rights(['admin', 'user'],'/topic/text/3'), self.crw)
        
    def testAdditiveRights(self):
        self.assertEquals(self.do_group_rights(['site','admin'],'/command/back'), self.crw)
        
    def testHomeListeningQueue(self):
        self.assertEquals(self.do_group_rights(['usr1', 'user'],'/queue/read/usr1'), self.ro)
        
    def testAdminHomeListeningQueue(self):
        self.assertEquals(self.do_group_rights(['admin'],'/queue/read/usr1'), self.cw)
        
