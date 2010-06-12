"""
    Note: Strictly speaking, these are not unit tests - they're
    acceptance tests. They provide a set of tests to validate
    morbid, messagequeue, and mqsecurity and how they work together.
    
    The idea is that these tests can also be used as the basis for
    a set of tests designed to exercise a complete morbid configuration.
"""

import unittest

import logging

from morbid import messagequeue
from morbid import mqsecurity
from morbid import StompProtocol, StompFactory

import stomper

from zope.interface import implements

from twisted.trial import unittest
from twisted.internet import reactor, protocol, defer, error
from twisted.internet.protocol import Protocol, ReconnectingClientFactory, ClientCreator

from twisted.protocols import loopback

# Useful constants for the tests

uall = '/topic/users/user2/user3/c/r/w/'
uread = '/topic/users/r/'
uwrite = '/topic/users/w/'
ucreate = '/topic/users/c/'

qall = '/queue/users/user2/user3/c/r/w/'
qread = '/queue/users/r/'
qwrite = '/queue/users/w/'

pall = '/pubsub/users/c/r/w/'
ptwo = '/pubsub/users/c/r/w/'

test_message_1 = "This is a test"
test_message_2 = "This is line 2"
test_header_1 = {'transaction':'atran'}
stomper.utils.log_init(logging.CRITICAL)


def queue_rights(group_list, qname):
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


class MsgError(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

        
class Expects(object):
    def __init__(self):
        self.emsg = []
        self.deferred = []
        
    def add_emsg(self, emsg, d1):
        self.emsg.append(emsg)
        self.deferred.append(d1)

    def check_rmsg(self, rmsg):
        if (rmsg['body'] in self.emsg):
            i = self.emsg.index(rmsg['body'])
            if (i > 0):
                print
                print "Warning: message received out of sequence expected"
                print rmsg
                print "expecting :"
                print self.emsg[0]
                print
            self.emsg.pop(i)
            d1 = self.deferred.pop(i)
            d1.callback(rmsg)
        else:
            print
            print "Unexpected message:"
            print "expecting one of -", self.emsg
            print "received -",rmsg['body']
            raise MsgError("Unexpected message received:\n"+repr(rmsg)+"\n")


class StompClientProtocol(Protocol, stomper.Engine):

    def __init__(self, username='xxx', password='yyy'):
        stomper.Engine.__init__(self)
        self.username = username
        self.password = password
        self.counter = 1
        self.expects = Expects()

    def ack(self, msg):
        self.expects.check_rmsg(msg)
        self.log.info("SENDER - received: %s " % msg['body'])

    def send(self, msg, mq):
        f = stomper.Frame()
        f.unpack(stomper.send(mq, msg))
        self.counter += 1        
        self.transport.write(f.pack())

    def subscribe(self, qname):
        self.transport.write(stomper.subscribe(qname))

    def connectionMade(self):
        cmd = stomper.connect(self.username, self.password)
        self.transport.write(cmd)

    def connected(self, msg):
        self.sessionId = msg['headers']['session']
    
    def error(self, msg):
        #print 'error msg =', msg
        self.expects.check_rmsg(msg)
        self.log.info("SENDER - received: %s " % msg['body'])

    def dataReceived(self, data):
        all_msgs = data.split('\x00\n')
        for a_msg in all_msgs:
            if a_msg:
                #print 'dr - msg =', a_msg
                msg = stomper.unpack_frame(a_msg)
                returned = self.react(msg)
                if returned:
                    self.transport.write(returned)


class MorbidTestCase(unittest.TestCase):
    def setUp(self):
        self.timeout = 5
        self.log = logging.getLogger("sender")
        self.mqm = messagequeue.MessageQueueManager()
        self.mqs = mqsecurity.MQPortal(self.mqm, None)
        self.mqm.set_queue_rights(queue_rights)
 
        self.factory = StompFactory(mqm=self.mqm)
        self.factory.mq_portal = self.mqs
        self.serverProtocol = self.factory.buildProtocol(None)
        self.serverProtocol.log = self.log
        self.client = StompClientProtocol('users','users')
        self.client.log = self.log
        self.loopbackBody = loopback.loopbackAsync(self.serverProtocol, self.client)

    def waitForResponse(self, client, msg):
        d1 = self.listenForResponse(client, msg)
        client.send(msg, self.dest)
        return d1

    def listenForResponse(self, client, msg):
        d1 = defer.Deferred()
        d1.addCallback(self.gotResponse)
        d1.addErrback(self.msgError)
        client.expects.add_emsg(msg, d1)
        return d1
    
    def gotResponse(self, msg):
        if 'done' in msg['body']:
            self.client.transport.loseConnection()
        #return er == msg['body']
            
    def msgError(self, *args):
        return args[0]

    def waitForErrorMsg(self, client, msg, err):
        d1 = self.listenForErrorMsg(client, err)
        client.send(msg, self.dest)
        return d1
    
    def listenForErrorMsg(self, client, err):
        d1 = defer.Deferred()
        d1.addCallback(self.gotError)
        d1.addErrback(self.msgError)
        client.expects.add_emsg(err, d1)
        return d1
        
    def gotError(self, msg):
        self.assertEquals(msg['cmd'], 'ERROR')


class BasicMorbidServerTestCase(MorbidTestCase):
    def test_SendTopicText(self):
        self.dest = uall
        self.client.subscribe(self.dest)
        d1 = self.waitForResponse(self.client, test_message_1)
        d2 = self.waitForResponse(self.client, test_message_2)
        d3 = self.waitForResponse(self.client, "done")
        dl = defer.DeferredList([d1, d2, d3])
        return dl
    
    def test_SendQueueTest(self):
        self.dest = qall
        d1 = self.waitForResponse(self.client, test_message_1)
        d2 = self.waitForResponse(self.client, test_message_2)
        d3 = self.waitForResponse(self.client, "done")
        self.client.subscribe(self.dest)
        dl = defer.DeferredList([d1, d2, d3])
        return dl

    def test_checkCreateRights(self):
        d1 = self.client.subscribe(uall)
        return d1
    
    def test_checkNoCreateRights(self):
        self.dest = uread
        d1 = self.waitForErrorMsg(self.client, 
                                  test_message_1,
                                  "Not authorized to create queue")
        return d1

    def test_checkNoWriteRights(self):
        self.dest = ucreate
        d1 = self.waitForErrorMsg(self.client,
                                  test_message_2,
                                  "Not authorized to write to queue")
        return d1

class TwoClientServerTestCase(MorbidTestCase):
    def setUp(self):
        MorbidTestCase.setUp(self)
        self.serverProtocol2 = self.factory.buildProtocol(None)
        self.serverProtocol2.log = self.log
        self.adminClient = StompClientProtocol('admin','admin')
        self.adminClient.log = self.log
        self.loopbackBody = loopback.loopbackAsync(self.serverProtocol2, 
                                                   self.adminClient)
   
    def test_checkReadRights(self):
        self.dest = qread
        self.adminClient.send(test_message_1, self.dest)
        d1 = self.listenForResponse(self.client, test_message_1)
        self.client.subscribe(self.dest)
        return d1

    def test_checkNoReadRights(self):
        self.dest = qwrite
        self.adminClient.send(test_message_1, self.dest)
        d1 = self.listenForErrorMsg(self.client, 
                                    "Not authorized to read queue")
        self.client.subscribe(self.dest)
        return d1
    
    def test_checkWriteRights(self):
        self.dest = qwrite
        d1 = self.listenForResponse(self.adminClient, test_message_2)
        self.adminClient.subscribe(self.dest)
        self.client.send(test_message_2, self.dest)
        return d1
    

class TwoListenersTestCase(MorbidTestCase):
    def setUp(self):
        MorbidTestCase.setUp(self)
        self.serverProtocol2 = self.factory.buildProtocol(None)
        self.serverProtocol2.log = self.log
        self.client2 = StompClientProtocol('user2','user2')
        self.client2.log = self.log
        self.loopbackBody = loopback.loopbackAsync(self.serverProtocol2, 
                                                   self.client2)

        self.serverProtocol3 = self.factory.buildProtocol(None)
        self.serverProtocol3.log = self.log
        self.client3 = StompClientProtocol('user3','user3')
        self.client3.log = self.log
        self.loopbackBody = loopback.loopbackAsync(self.serverProtocol3, 
                                                   self.client3)

    def test_pubsub(self):
        
        self.mqm.add_pubsub_child(self.serverProtocol, ptwo, uall+'2')
        self.mqm.add_pubsub_child(self.serverProtocol, ptwo, uall+'3')

        d2 = self.listenForResponse(self.client2, test_message_1)
        self.client2.subscribe(uall+'2')
        d3 = self.listenForResponse(self.client3, test_message_1)
        self.client3.subscribe(uall+'3')
        
        self.client.send(test_message_1, ptwo)

        dl = defer.DeferredList([d2, d3])
        return dl

    def test_pubsub_queue_multiple(self):
        
        self.mqm.add_pubsub_child(self.serverProtocol, ptwo, qall+'1')
        self.mqm.add_pubsub_child(self.serverProtocol, ptwo, qall+'2')
        self.mqm.add_pubsub_child(self.serverProtocol, ptwo, qall+'3')

        self.client.send(test_message_1, ptwo)
        self.client.send(test_message_2, ptwo)
        
        d11 = self.listenForResponse(self.client, test_message_1)
        d12 = self.listenForResponse(self.client, test_message_2)
        self.client.subscribe(qall+'1')

        d21 = self.listenForResponse(self.client2, test_message_1)
        d22 = self.listenForResponse(self.client2, test_message_2)
        self.client2.subscribe(qall+'2')

        d31 = self.listenForResponse(self.client3, test_message_1)
        d32 = self.listenForResponse(self.client3, test_message_2)
        self.client3.subscribe(qall+'3')
        
        dl = defer.DeferredList([d11, d12, d21, d22, d31, d32])
        return dl
