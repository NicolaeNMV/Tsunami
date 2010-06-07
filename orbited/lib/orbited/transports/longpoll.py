from twisted.internet import reactor
from orbited import logging
from orbited.transports.base import CometTransport


class LongPollingTransport(CometTransport):

    logger = logging.get_logger('orbited.transports.longpoll.LongPollingTransport')

    def opened(self):
        self.totalBytes = 0
        # Force reconnect ever 45 seconds
        self.close_timer = reactor.callLater(30, self.triggerCloseTimeout)
#        self.request.setHeader('content-type', 'application/x-orbited-event-stream')
        self.request.setHeader('cache-control', 'no-cache, must-revalidate')

    def triggerCloseTimeout(self):
        self.close()

    def write(self, packets):
        # TODO: we can optimize this. In the case where packets contains a
        #       single packet, and its a ping, just don't send it. (instead,
        #       close the connection. the re-open will prompt the ack)
        
        self.logger.debug('write %r' % packets)
        payload = self.encode(packets)
        self.logger.debug('WRITE ' + payload)        
        self.request.write(payload)
        self.close()

    def encode(self, packets):
        output = []
        for packet in packets:
            for i, arg in enumerate(packet):
                if i == len(packet) -1:
                    output.append('0')
                else:
                    output.append('1')
                output.append(str(len(arg)))
                output.append(',')                
                output.append(arg)
        return "".join(output)

    def writeHeartbeat(self):
        # NOTE: no heartbeats...
        pass
