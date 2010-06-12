def error(msg, reactor_running=True):
    print "MorbidQ Error:",msg
    if reactor_running:
        from twisted.internet import reactor
        reactor.stop()
    else:
        import sys
        sys.exit(-1)