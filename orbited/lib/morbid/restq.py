from twisted.internet import defer
from twisted.web.client import getPage
from error import error

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
    raise ImportError, 'Fatal Error: loaded unknown json module: "%s"'%(json.__file__,)
"""
This fixes the unicode problem for now.
It would be more efficient to do the
unicode check early on and try to use
a json module that doesn't require this
hack (for now, I'm just trying them in
what I consider a reasonable order). It
also might be nice to have other json
options (I removed demjson because it
was somehow still causing unicode errors).

-mario
"""
if not isinstance(decode(encode('test')), str):
    _decode = decode
    def decode(data):
        def fix_unicode(chunk):
            if isinstance(chunk, list):
                for i in range(len(chunk)):
                    chunk[i] = fix_unicode(chunk[i])
            elif isinstance(chunk, dict):
                old_chunk = chunk
                chunk = {}
                for key, val in old_chunk.items():
                    chunk[str(key)] = fix_unicode(val)
            elif isinstance(chunk, unicode):
                chunk = str(chunk)
            return chunk
        return fix_unicode(_decode(data))

def eb(url):
    def _eb(e):
        error('problem connecting to server: "%s"'%(url,))
    return _eb

class RestQ(object):
    def __init__(self, rqaddr):
        self.cbs = {
            'connect':None,
            'disconnect':None,
            'subscribe':None,
            'unsubscribe':None,
            'send':None
        }
        if rqaddr:
            getPage(rqaddr).addCallback(self.initialize).addErrback(eb(rqaddr))

    def submit(self, conn, cmd, headers={}, body=""):
        url = self.cbs.get(cmd,None)
        if url is not None:
            headers["username"] = conn.username
            if cmd == "send":
                headers['body'] = body
            def cb(raw_data):
                data = decode(raw_data)
                if "allow" in data and data["allow"] == "no":
                    return (data, None)
                newBody = data.get('body',body)
                headers['content-length'] = len(newBody)
                if "autosubscribe" in data:
                    conn.autosubscribe(data['autosubscribe'])
                if "autounsubscribe" in data:
                    conn.autounsubscribe(data['autounsubscribe'])
                return (headers, newBody)
            sendDeferred = getPage(url, method='POST', postdata=encode(headers)).addCallback(cb).addErrback(eb(url))
            if cmd in ["connect", "subscribe", "send"]:
                return sendDeferred
        return defer.succeed((headers, body))

    def initialize(self, rawData):
        data = decode(rawData)
        for key, value in data.items():
            self.cbs[key] = value
