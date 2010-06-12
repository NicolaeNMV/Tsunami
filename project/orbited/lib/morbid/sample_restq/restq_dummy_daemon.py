from twisted.web import server, resource
from twisted.internet import reactor
import time
try:
    try:
        import cjson as json
    except ImportError:
        try:
            import simplejson as json
        except ImportError:
            import json
except ImportError:
    raise ImportError, "Could not load one of: Python json, cjson, simplejson. Please install a json module."
if hasattr(json, 'encode'):
    encode = json.encode
    decode = json.decode
elif hasattr(json, 'dumps'):
    encode = json.dumps
    decode = json.loads
elif hasattr(json, 'write'):
    encode = json.write
    decode = json.read
else:
    raise ImportError, 'Fatal Error: loaded unknown json module: "%s".'%(json.__file__,)

cbUrls = None

class DummyLeaf(object):
    def __init__(self, data):
        self.data = data

    def render(self, request):
        return self.data

def wrap(data):
    print "sending data:",data
    return DummyLeaf(encode(data))

class RestQDummyResource(resource.Resource):
    def getChild(self, path, request):
        if not path or path == "/":
            return wrap(cbUrls)
        headers = decode(request.content.read())
        print '-------------------'
        print 'headers:',headers
        username = headers['username']
        destination = headers.get("destination",None)
        if path in cbUrls:
            print 'checking path: "%s"'%(path,)
            if path == "connect":
                if username == "noconnect":
                    return wrap({"allow":"no"})
            elif path == "send":
                newBody = headers['body'].replace("apples","bananas")
                if username == 'nosend':
                    return wrap({"allow":"no"})
                elif username == 'slow':
                    time.sleep(1)
                return wrap({"body":newBody})
            elif path == "subscribe":
                if destination == "auto":
                    return wrap({"autosubscribe":["room1","room2","room3"]})
            elif path == "unsubscribe":
                if destination == "auto":
                    return wrap({"autounsubscribe":["room1","room2","room3"]})
            return wrap({})

def main():
    global cbUrls
    from optparse import OptionParser
    parser = OptionParser()
    parser.add_option(
        "-p",
        "--port",
        dest="port",
        type="int",
        default=5000,
        help="port the RestQ demonstration resource should bind to. default: 5000"
    )
    options = parser.parse_args()[0]
    cbUrls = {
        'connect':'http://localhost:%s/connect'%options.port,
        'disconnect':'http://localhost:%s/disconnect'%options.port,
        'subscribe':'http://localhost:%s/subscribe'%options.port,
        'unsubscribe':'http://localhost:%s/unsubscribe'%options.port,
        'send':'http://localhost:%s/send'%options.port
    }
    site = server.Site(RestQDummyResource())
    print 'running on %s'%options.port
    reactor.listenTCP(options.port, site)
    reactor.run()

if __name__ == "__main__":
    main()