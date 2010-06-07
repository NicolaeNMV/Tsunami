import traceback
import stomper
import mqsecurity
from datetime import datetime
from restq import RestQ
from messagequeue import QueueError
from error import error

verbose = False

try:
    from twisted.internet.protocol import Factory, Protocol
except:
    error("Twisted required to run; see www.twistedmatrix.com", False)

class StompProtocol(Protocol):
    id = 0
    def __init__(self):
        self.state = 'initial'
        self.username = None
        self.password = None
        self.buffer = ""
        self.stompBuffer = stomper.stompbuffer.StompBuffer()
        self.lastNull = False
        StompProtocol.id += 1
        self.id = StompProtocol.id
        self.avatar = None
        self.receivedDisconnect = False

    def get_groups(self):
        return self.avatar.groups

    def dataReceived(self, data):
        # NOTE: Allow each frame to have an optional '\n'
        # NOTE: binary DOES NOT WORK with this hack in place
        self.stompBuffer.appendData(data.replace('\0', '\0\n'))
        while True:
            msg = self.stompBuffer.getOneMessage()
            # NOTE: the rest of the optional '\n' hack
            if self.stompBuffer.buffer.startswith('\n'):
                self.stompBuffer.buffer = self.stompBuffer.buffer[1:]
            if msg is None:
                break
            if not msg['headers'] and not msg['body'] and not msg['cmd']:
                break
            msg['cmd'] = msg['cmd'].lower()
            getattr(self, 'read_%s' % self.state)(**msg)

    def sendError(self, e):
        exception, instance, tb = traceback.sys.exc_info()
        tbOutput= "".join(traceback.format_tb(tb))
        self.sendFrame('ERROR', {'message': str(e) }, tbOutput)

    def sendFrame(self, cmd, headers, body):
        f = stomper.Frame()
        f.cmd = cmd
        f.headers.update(headers)
        f.body = body
        self.transport.write(f.pack())

    def autosubscribe(self, subs):
        for sub in subs:
            self.frame_subscribe(({'destination':sub}, None))

    def autounsubscribe(self, unsubs):
        for unsub in unsubs:
            self.frame_unsubscribe(({'destination':unsub}, None))

    def read_initial(self, cmd, headers, body):
        assert cmd == 'connect', "Invalid cmd: expected CONNECT"
        self.username = headers.get('login',"")
        self.password = headers.get('passcode',"")
        d = None
        if self.factory.mq_portal:
            d = self.factory.mq_portal.stomp_login(**headers)
        if d:
            d.addCallback(self.stomp_connected).addErrback(self.stomp_connect_failed)
        else:
            self.stomp_connected((IConnector, Connector("None", ["None"]), lambda: None))

    def stomp_connected(self, *args):
        def stomp_connected_callback((headers, body)):
            if "allow" in headers and headers["allow"] == "no":
                return self.stomp_connect_failed()
            avatarInterface, avatar, logout_func = args[0]
            self.avatar = avatar
            self.state = 'connected'
            self.sendFrame('CONNECTED', {"session": self.id}, "")
        self.factory.restq.submit(self, "connect", {"username":self.username, "password":self.password}).addCallback(stomp_connected_callback)

    def stomp_connect_failed(self, *args):
        self.sendFrame('ERROR', {'message': "Invalid ID or password"}, "Invalid ID or password")
        self.username = None
        self.transport.loseConnection()

    def read_connected(self, cmd, headers, body):
        self.factory.restq.submit(self, cmd, headers, body).addCallback(getattr(self, 'frame_%s' % cmd))

    def frame_subscribe(self, (headers, body)):
        if "allow" in headers and headers["allow"] == "no":
            return
        try:
            self.factory.mqm.subscribe_queue(self, headers['destination'])
        except QueueError, err:
            self.sendFrame('ERROR',
                           {'message': self.get_message_code(err.code)},
                           self.get_message_text(err.code))

    def frame_unsubscribe(self, (headers, body)):
        self.factory.mqm.leave_queue(self, headers['destination'])

    def frame_send(self, (headers, body)):
        if "allow" in headers and headers["allow"] == "no":
            return
        try:
            result = self.factory.mqm.send_message(self, headers['destination'], (headers, body))
        except QueueError, err:
            self.sendFrame('ERROR',
                           {'message': self.get_message_code(err.code)},
                           self.get_message_text(err.code))

    def frame_disconnect(self, (headers, body)):
        self.receivedDisconnect = True
        self.transport.loseConnection()

    def connectionLost(self, reason):
        if not self.receivedDisconnect and self.username:
            self.factory.restq.submit(self, "disconnect")
        self.factory.disconnected(self)

    def get_message_code(self, code):
        return {'FAILC': "CREATE error",
                'FAILR': "READ error",
                'FAILW': "WRITE error"}[code]

    def get_message_text(self, code):
        return {'FAILC': "Not authorized to create queue",
                'FAILR': "Not authorized to read queue",
                'FAILW': "Not authorized to write to queue"}[code]

    def send(self, message):
        '''
        This method is invoked by the message queues.
        Not intended for direct use by the protocol.
        '''
        headers, body = message
        self.sendFrame('MESSAGE', headers, body)

class StompFactory(Factory):
    """
    The StompFactory creates an instance of a StompProtocol for each connection.
    Successful authentication results in the creation of an avatar for that user.
    The Avatar is assigned to the StompProtocol.
    """
    protocol = StompProtocol

    def __init__(self, mqm=None, filename=None, rqaddr=None, verbose=False):
        self.id = 0
        self.restq = RestQ(rqaddr)
        self.verbose = verbose
        if mqm:
            self.mqm = mqm
        else:
            import messagequeue
            self.mqm = messagequeue.MessageQueueManager()
        self.mq_portal = mqsecurity.MQPortal(self.mqm, filename=filename)

    def report(self, msg):
        if self.verbose:
            print "[%s] MorbidQ: %s"%(datetime.now(), msg)

    def disconnected(self, proto):
        self.mqm.unsubscribe_all_queues(proto)

def load_config(config_file, config_dict):
    import os
    if not os.path.isfile(config_file):
        return error('config file "%s" does not exist'%(config_file,))
    f = open(config_file)
    lines = f.readlines()
    f.close()
    for line in lines:
        if "=" not in line:
            return error('error parsing config. line: "%s"'%(line,))
        option, value = line.split("=",1)
        if option == "verbose":
            if value.lower() == "true":
                value = True
            else:
                value = False
        if option == "port":
            try:
                value = int(value)
            except:
                return error('non-integer port specified: "%s"'%(line,))
        config_dict[option.strip()] = value.strip()

def get_stomp_factory(config_file="", cfg={'auth':None,'restq':None,'verbose':False}):
    if config_file:
        load_config(config_file, cfg)
    f = StompFactory(filename=cfg['auth'], rqaddr=cfg['restq'], verbose=cfg['verbose'])
    f.report("server starting with configuration: %s"%(cfg,))
    return f

def main():
    from optparse import OptionParser
    parser = OptionParser()
    parser.add_option(
        "-c",
        "--config",
        dest="config",
        type="string",
        default="",
        help="configuration file"
    )
    parser.add_option(
        "-p",
        "--port",
        dest="port",
        type="int",
        default=61613,
        help="port the daemon should bind to (default: 61613)"
    )
    parser.add_option(
        "-i",
        "--interface",
        dest="interface",
        type="string",
        default="",
        help="hostname the daemon should bind to (default: all interfaces)"
    )
    parser.add_option(
        "-a",
        "--auth",
        dest="auth",
        type="string",
        default="",
        help="local path to authentication module"
    )
    parser.add_option(
        "-r",
        "--restq",
        dest="restq",
        type="string",
        default="",
        help="RestQ http callback resource"
    )
    parser.add_option(
        "-v",
        "--verbose",
        dest="verbose",
        action="store_true",
        default=False,
        help="verbose mode"
    )
    from twisted.internet import reactor
    (options, args) = parser.parse_args()
    stomp_factory = get_stomp_factory(options.config, {
        'verbose':options.verbose,
        'restq':options.restq,
        'auth':options.auth
    })
    reactor.listenTCP(options.port, stomp_factory, interface=options.interface)
    reactor.run()

if __name__ == "__main__":
    main()
