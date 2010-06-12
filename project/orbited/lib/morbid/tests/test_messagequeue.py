import unittest

from morbid import messagequeue

class TestAvatar(object):
    def __init__(self, user_name, groups):
        self.user_name = user_name
        self.groups = groups
        
class TestProtocol(object):
    def __init__(self, avatar):
        self.num_msg_sent = 0
        self.avatar = avatar
        
    def send(self, message):
        #print "Message sent : ", message
        self.num_msg_sent += 1
        self.headers = message[0]
        self.body = message[1]

    def get_groups(self):
        return self.avatar.groups
    
def queue_rights(group_list, qname):
    #Simple access rights test.
    #Admin group automatically has all rights - no need to check anything else
    #A group has the access specified by the name of the queue
    #/queue/group1/c/r/w/ - Group 1 has all rights
    #/queue/group2/r/ - Group 2 has read-only access
    r = set()
    for g in group_list:
        if g == 'admin':
            r = set(['c','r','w'])
            break
        if g not in qname:
            continue
        for type in ['/c/', '/r/', '/w/']:
            if type in qname:
                r.add(type[1])
    return r

# Useful constants for the tests

uall = '/topic/users/c/r/w/'
uread = '/topic/users/r/'
uwrite = '/topic/users/w/'

qall = '/queue/users/c/r/w/'
qread = '/queue/users/r/'
qwrite = '/queue/users/w/'

pall = '/pubsub/users/c/r/w/'

test_message =  "This is a test"
test_message_2 = "This is line 2"
test_header_1 = {'transaction':'atran'}
    
class MQMTestCase(unittest.TestCase):
    def setUp(self):
        self.a1 = TestProtocol(TestAvatar('tskww', ['users','admin']))
        self.u1 = TestProtocol(TestAvatar('usr1', ['users']))
        self.u2 = TestProtocol(TestAvatar('usr2', ['users']))
        self.u3 = TestProtocol(TestAvatar('usr3', ['none']))
        self.mqm = messagequeue.MessageQueueManager()
        self.mqm.set_queue_rights(queue_rights)
        
    def testCreateTopic(self):
        self.mqm.create_queue(self.u1, uall)
        self.assert_(self.mqm.message_queues.has_key(uall))
        self.assert_(isinstance(self.mqm.message_queues[uall], messagequeue.Topic))
         
    def testFailCreateTopic(self):
        self.assertRaises(messagequeue.QueueError, self.mqm.create_queue, self.u1, uread)
        
    def testSubscribeTopic(self):
        self.mqm.create_queue(self.u1, uall)
        self.mqm.subscribe_queue(self.u2, uall)
        self.assertEquals(self.mqm.message_queues[uall].subscribers[0], self.u2)

    def testFailSubscribeTopic(self):
        self.mqm.create_queue(self.u1, uall)
        self.assertRaises(messagequeue.QueueError, self.mqm.subscribe_queue, self.u3, uall)

    def testAdminCreateTopic(self):
        self.mqm.create_queue(self.a1, uread)
        self.assert_(self.mqm.message_queues.has_key(uread))

    def testCreateQueue(self):
        self.mqm.create_queue(self.u1, qall)
        self.assert_(self.mqm.message_queues.has_key(qall))
        self.assert_(isinstance(self.mqm.message_queues[qall], messagequeue.Queue))
        
    def testFailCreateQueue(self):
        self.assertRaises(messagequeue.QueueError, self.mqm.create_queue, self.u1, qread)

    def testAdminCreateQueue(self):
        self.mqm.create_queue(self.a1, qread)
        self.assert_(self.mqm.message_queues.has_key(qread))
        
    def testSubscribeQueue(self):
        self.mqm.create_queue(self.u1, qall)
        self.mqm.subscribe_queue(self.u2, qall)
        self.assertEquals(self.mqm.message_queues[qall].subscribers[0], self.u2)

    def testFailSubscribeQueue(self):
        self.mqm.create_queue(self.u1, qall)
        self.assertRaises(messagequeue.QueueError, self.mqm.subscribe_queue, self.u3, qall)
        

class TopicTestCase(unittest.TestCase):
    def setUp(self):
        self.u1 = TestProtocol(TestAvatar('usr1', ['users']))
        self.u2 = TestProtocol(TestAvatar('usr2', ['users']))
        self.u3 = TestProtocol(TestAvatar('usr3', ['none']))
        self.mqm = messagequeue.MessageQueueManager()
        self.mqm.set_queue_rights(queue_rights)
        self.mqm.create_queue(self.u1, uall)
        self.mqm.subscribe_queue(self.u2, uall)
        
    def testSendMessage(self):
        self.u4 = TestProtocol(TestAvatar('usr4', ['users']))
        self.mqm.subscribe_queue(self.u4, uall)
        self.mqm.send_message(self.u1, uall, test_message)
        self.assertEquals(self.u2.num_msg_sent, 1)
        self.assertEquals(self.u2.body, test_message)
        self.assertEquals(self.u4.num_msg_sent, 1)
        self.assertEquals(self.u4.body, test_message)
        
    def testFailSendMessage(self):
        self.assertRaises(messagequeue.QueueError, self.mqm.send_message, self.u3, uall, test_message)
        
    def testHeaderMaintenance(self):
        self.mqm.subscribe_queue(self.u2, uall)
        self.mqm.send_message(self.u1, uall, (test_header_1, test_message))
        self.assertEquals(self.u2.headers['transaction'], 'atran')


class QueueTestCase(unittest.TestCase):
    def setUp(self):
        self.u1 = TestProtocol(TestAvatar('usr1', ['users']))
        self.u2 = TestProtocol(TestAvatar('usr2', ['users']))
        self.u3 = TestProtocol(TestAvatar('usr3', ['none']))
        self.mqm = messagequeue.MessageQueueManager()
        self.mqm.set_queue_rights(queue_rights)
        self.mqm.create_queue(self.u1, qall)

    def testSendMessage(self):
        self.mqm.subscribe_queue(self.u2, qall)
        self.mqm.send_message(self.u1, qall, test_message)
        self.assertEquals(self.u2.num_msg_sent, 1)
        self.assertEquals(self.u2.body, test_message)

    def testFailSendMessage(self):
        self.assertRaises(messagequeue.QueueError, self.mqm.send_message, self.u3, qall, test_message)

    def testQueueMessage(self):
        self.mqm.send_message(self.u1, qall, test_message)
        self.assertEquals(len(self.mqm.message_queues[qall].messages), 1)
        self.assertEquals(self.mqm.message_queues[qall].messages[0][0], {})
        self.assertEquals(self.mqm.message_queues[qall].messages[0][1], test_message)
        
    def testReadQueuedMessage(self):
        self.mqm.send_message(self.u1, qall, test_message)
        self.mqm.subscribe_queue(self.u2, qall)
        self.assertEquals(len(self.mqm.message_queues[qall].messages), 0)
        self.assertEquals(self.u2.body, test_message)
        
    def testTwoQueuedMessages(self):
        self.mqm.send_message(self.u1, qall, test_message)
        self.mqm.send_message(self.u1, qall, (test_header_1, test_message_2))
        self.assertEquals(len(self.mqm.message_queues[qall].messages), 2)
        self.assertEquals(self.mqm.message_queues[qall].messages[0][1], test_message)
        self.assertEquals(self.mqm.message_queues[qall].messages[1][0]['transaction'], 'atran')
        self.assertEquals(self.mqm.message_queues[qall].messages[1][1], test_message_2)

    def testReadTwoQueuedMessages(self):
        self.mqm.send_message(self.u1, qall, test_message)
        self.mqm.send_message(self.u1, qall, test_message_2)
        self.mqm.subscribe_queue(self.u2, qall)
        self.assertEquals(len(self.mqm.message_queues[qall].messages), 0)
        self.assertEquals(self.u2.num_msg_sent, 2)
        self.assertEquals(self.u2.body, test_message_2)

    def testTwoReadTwoQueuedMessages(self):
        self.u3 = TestProtocol(TestAvatar('usr3', ['user']))
        self.mqm.subscribe_queue(self.u2, qall)
        self.mqm.subscribe_queue(self.u3, qall)
        self.mqm.send_message(self.u1, qall, test_message)
        self.mqm.send_message(self.u1, qall, test_message_2)
        self.assertEquals(len(self.mqm.message_queues[qall].messages), 0)
        self.assertEquals(self.u2.num_msg_sent, 1)
        self.assertEquals(self.u2.body, test_message)
        self.assertEquals(self.u3.num_msg_sent, 1)
        self.assertEquals(self.u3.body, test_message_2)
        
    def testQueueHeaderMaintenance(self):
        self.mqm.subscribe_queue(self.u2, qall)
        self.mqm.send_message(self.u1, qall, (test_header_1, test_message))
        self.assertEquals(self.u2.headers['transaction'], 'atran')


class PubsubTestCase(unittest.TestCase):
    def setUp(self):
        self.u1 = TestProtocol(TestAvatar('usr1', ['users']))
        self.u2 = TestProtocol(TestAvatar('usr2', ['users']))
        self.u3 = TestProtocol(TestAvatar('usr3', ['users']))
        self.u4 = TestProtocol(TestAvatar('usr4', ['users']))
        self.mqm = messagequeue.MessageQueueManager()
        self.mqm.set_queue_rights(queue_rights)

        self.mqm.create_queue(self.u1, uall+"1")
        self.mqm.create_queue(self.u1, uall+"2")
        self.mqm.create_queue(self.u1, uall+"3")

        self.mqm.subscribe_queue(self.u2, uall+"1")
        self.mqm.subscribe_queue(self.u3, uall+"2")
        self.mqm.subscribe_queue(self.u4, uall+"3")
        
    def testCreatePubsub(self):
        self.mqm.create_queue(self.u1, pall)
        self.mqm.add_pubsub_child(self.u1, pall, uall+"1")
        self.mqm.add_pubsub_child(self.u1, pall, uall+"2")
        self.mqm.add_pubsub_child(self.u1, pall, uall+"3")
        
        self.mqm.send_message(self.u1, pall, (test_header_1, test_message))
        
        self.assertEquals(self.u2.body, test_message)
        self.assertEquals(self.u3.body, test_message)
        self.assertEquals(self.u4.body, test_message)
